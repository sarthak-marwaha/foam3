/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.blob;

import foam.blob.*;
import foam.core.X;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.boot.NSpec;
import foam.nanos.boot.NSpecAware;
import foam.nanos.http.WebAgent;
import org.apache.commons.io.IOUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

public class HttpBlobService
    extends ProxyBlobService
    implements NSpecAware, WebAgent
{
  public static final int BUFFER_SIZE = 8192;

  protected NSpec nspec_;

  public HttpBlobService(X x, BlobService delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public void execute(X x) {
    HttpServletRequest  req  = x.get(HttpServletRequest.class);
    HttpServletResponse resp = x.get(HttpServletResponse.class);

    try {
      if ( "GET".equals(req.getMethod()) ) {
        download(req, resp);
      } else if ( "PUT".equals(req.getMethod()) ) {
        upload(req, resp);
      }
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  protected void download(HttpServletRequest req, HttpServletResponse resp) {
    OutputStream os = null;

    try {
      String path = req.getRequestURI();
      String id = path.replaceFirst("/service/" + nspec_.getName() + "/", "");

      Blob blob = getDelegate().find(id);
      if ( blob == null ) {
        resp.setStatus(resp.SC_NOT_FOUND);
        return;
      }

      long size = blob.getSize();
      resp.setStatus(resp.SC_OK);
      if ( blob instanceof FileBlob ) {
        File file = ((FileBlob) blob).getFile();
        resp.setContentType(Files.probeContentType(Paths.get(file.toURI())));
      } else {
        resp.setContentType("application/octet-stream");
      }
      resp.setHeader("Content-Length", Long.toString(size, 10));
      resp.setHeader("ETag", id);
      resp.setHeader("Cache-Control", "public");

      os = resp.getOutputStream();
      blob.read(os, 0, size);
      os.close();
    } catch (Throwable t) {
      t.printStackTrace();
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(os);
    }
  }

  protected void upload(javax.servlet.http.HttpServletRequest req, javax.servlet.http.HttpServletResponse resp) {
    InputStreamBlob blob = null;

    try {
      int size = req.getContentLength();
      blob = new InputStreamBlob(req.getInputStream(), size);
      new Outputter(resp.getWriter(), OutputterMode.NETWORK).output(getDelegate().put(blob));
    } catch (Throwable t) {
      t.printStackTrace();
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(blob);
    }
  }

  @Override
  public void setNSpec(NSpec spec) {
    nspec_ = spec;
  }
}
