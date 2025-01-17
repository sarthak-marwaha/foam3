/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.box.Skeleton;
import foam.core.*;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.SessionDAOSkeleton;
import foam.nanos.NanoService;
import foam.nanos.boot.NSpec;
import foam.nanos.boot.NSpecAware;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.pm.PM;
import foam.nanos.pm.PMWebAgent;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Top-Level Router Servlet.
 * Routes servlet requests based on NSpecDAO configuration.
 * Services can be exported as either Box Skeletons or as WebAgents/Servlets.
 * WebAgents require the service.run.<nspecname> permission.
 */
public class NanoRouter
  extends HttpServlet
  implements NanoService, ContextAware
{
  protected X x_;

  protected Map<String, WebAgent> handlerMap_ = new ConcurrentHashMap<>();
  protected DAO nSpecDAO_;

  @Override
  public void init(javax.servlet.ServletConfig config) throws javax.servlet.ServletException {
    Object x = config.getServletContext().getAttribute("X");
    if ( x != null && x instanceof foam.core.X ) x_ = (foam.core.X) x;

    nSpecDAO_ = (DAO) x_.get("nSpecDAO");
    nSpecDAO_.listen(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        NSpec sp = (NSpec) obj;
        handlerMap_.remove(sp.getName());
      }
    }, null);

    super.init(config);
  }

  @Override
  protected void service(final HttpServletRequest req, final HttpServletResponse resp)
    throws ServletException, IOException
  {
    String   path       = req.getRequestURI();
    String[] urlParams  = path.split("/");
    String   serviceKey = urlParams[2];
    NSpec    spec       = (NSpec) nSpecDAO_.find(serviceKey);

    foam.core.ClassInfoImpl clsInfo = new foam.core.ClassInfoImpl();
    clsInfo.setObjClass(this.getClass());
    clsInfo.setId(this.getClass().getSimpleName());
    PM       pm         = PM.create(getX(), clsInfo, serviceKey);

    resp.setContentType("text/html");

    // prevent browsers from changing content-type in response
    resp.setHeader("X-Content-Type-Options", "nosniff");
    // do not allow browser to cache response data
    resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    // same as cache-control, used for backwards compatibility with HTTP/1.0
    resp.setHeader("Pragma", "no-cache");
    // enable xss filtering to allow browser to sanitize page if xss attack is detected
    resp.setHeader("X-XSS-Protection", "1");
    // protect against clickjacking attacks
    resp.setHeader("X-Frame-Options", "SAMEORIGIN");

    try {
      if ( spec == null ) {
        System.err.println("Service not found: " + serviceKey);
        resp.sendError(resp.SC_NOT_FOUND, "No service found for: "+serviceKey);
        return;
      }
      if ( ! spec.getEnabled() ) {
        System.err.println("Service disabled: " + serviceKey);
        resp.sendError(resp.SC_NOT_FOUND, "No service found for: "+serviceKey);
        return;
      }

      // XLocator could be used by the factory of transient properties during
      // replay of DAO services.
      XLocator.set(getX());
      Object   service   = getX().get(serviceKey);
      WebAgent agent     = getWebAgent(spec, service);
      if ( agent == null ) {
        System.err.println("No service found for: " + serviceKey);
        resp.sendError(resp.SC_NOT_FOUND, "No service found for: "+serviceKey);
      } else {
        X requestContext = getX()
          .put(HttpServletRequest.class, req)
          .put(HttpServletResponse.class, resp)
          .putFactory(PrintWriter.class, new XFactory() {
            @Override
            public Object create(X x) {
              try {
                return resp.getWriter();
              } catch (IOException e) {
                return null;
              }
            }
          })
          .put("logger", new PrefixLogger(new Object[] { "[Service]", spec.getName() }, (Logger) getX().get("logger")))
          .put(NSpec.class, spec);
        agent.execute(requestContext);
      }
    } catch (Throwable t) {
      System.err.println("Error serving: " + serviceKey + " " + path + " " + t.getMessage());
      t.printStackTrace();
      throw t;
    } finally {
      XLocator.set(null);
      if ( ! serviceKey.equals("static") ) pm.log(x_);
    }
  }

  protected WebAgent getWebAgent(NSpec spec, Object service) {
    if ( spec == null ) return null;

    synchronized (spec.getName().intern()) {
      if ( ! handlerMap_.containsKey(spec.getName()) ) {
        handlerMap_.put(spec.getName(), createWebAgent(spec, service));
      }
    }
    return handlerMap_.get(spec.getName());
  }

  protected WebAgent createWebAgent(NSpec spec, Object service) {
    Logger logger = (Logger) getX().get("logger");
    logger.debug(this.getClass().getSimpleName(), "createWebAgent", spec.getName());
    if ( spec.getServe() ) {
      try {
        Class cls = spec.getBoxClass() != null && spec.getBoxClass().length() > 0 ?
            Class.forName(spec.getBoxClass()) :
            SessionDAOSkeleton.class ;
        Skeleton skeleton = (Skeleton) cls.newInstance();

        // TODO: create using Context, which should do this automatically
        if ( skeleton instanceof ContextAware ) ((ContextAware) skeleton).setX(getX());

        skeleton.setDelegateObject(service);

        service = getAgent(skeleton, spec);

        logger.debug(this.getClass().getSimpleName(), "createWebAgent.serve", spec.getName(), "service");
      } catch (IllegalAccessException | InstantiationException | ClassNotFoundException ex) {
        ex.printStackTrace();
        ((Logger) getX().get("logger")).error("Unable to create NSPec servlet: " + spec.getName());
      }
    } else {
      if ( service instanceof WebAgent ) {
        WebAgent pmService = (WebAgent) service;

        SendErrorHandler sendErrorHandler = null;
        if ( service instanceof SendErrorHandler )
          sendErrorHandler = (SendErrorHandler) service;

        if ( spec.getParameters() ) {
          service = new HttpParametersWebAgent((WebAgent) service);
        }
        if ( spec.getPm() ) {
          service = new PMWebAgent(pmService.getClass(), spec.getName(), (WebAgent) service);
        }

        //
        // NOTE: Authentication must be last as HttpParametersWebAgent will consume the authentication parameters.
        //
        if ( spec.getAuthenticate() ) {
          service = new AuthWebAgent("service.run." + spec.getName(), (WebAgent) service, sendErrorHandler);
        }

        logger.debug(this.getClass().getSimpleName(), "createWebAgent.WebAgent", spec.getName(), "webAgent");
      }
    }

    if ( service instanceof WebAgent ) return (WebAgent) service;

    logger.error(this.getClass(), spec.getName() + " does not have a WebAgent.");
    return null;
  }

  protected WebAgent getAgent(Skeleton skeleton, NSpec spec) {
    return new ServiceWebAgent(skeleton, spec.getAuthenticate());
  }

  protected void informService(Object service, NSpec spec) {
    Object obj = service;
    while ( obj != null ) {
      if ( obj instanceof ContextAware ) ((ContextAware) obj).setX(getX());
      if ( obj instanceof NSpecAware   ) ((NSpecAware) obj).setNSpec(spec);
      if ( obj instanceof ProxyDAO ) {
        obj = ((ProxyDAO) obj).getDelegate();
      } else if ( obj instanceof ProxyWebAgent ) {
        obj = ((ProxyWebAgent) obj).getDelegate();
      } else {
        obj = null;
      }
    }
  }

  @Override
  public void start() {
  }

  @Override
  public X getX() {
    return x_;
  }

  @Override
  public void setX(X x) {
    x_ = x;
  }
}
