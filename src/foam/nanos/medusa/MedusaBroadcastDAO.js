/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaBroadcastDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Broadcast MedusaEntries.`,

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.om.OMLogger',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],
  
  properties: [
    {
      name: 'serviceName',
      class: 'String',
      javaFactory: `
      return "medusaMediatorDAO";
      `
    },
    {
      // TODO: clear on ClusterConfig DAO updates
      name: 'clients',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return Loggers.logger(getX(), this, this.getServiceName());
      `
    },
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      // getLogger().debug("put", entry.getIndex());

      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      MedusaEntry old = (MedusaEntry) getDelegate().find_(x, entry.getId());
      entry = (MedusaEntry) getDelegate().put_(x, entry).fclone();

      if ( support.getStandAlone() ) {
        if ( old == null ) {
          return ((DAO) x.get(getServiceName())).put_(x, entry);
        }
        return entry;
      }

      if ( myConfig.getType() == MedusaType.NODE &&
           myConfig.getStatus() == Status.ONLINE ) {
        entry = (MedusaEntry) submit(x, entry, DOP.PUT);
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        replaying.updateIndex(x, entry.getIndex());
      } else if ( myConfig.getType() == MedusaType.MEDIATOR &&
                  myConfig.getStatus() == Status.ONLINE && 
                  entry.getPromoted() ) {
        entry = (MedusaEntry) submit(x, entry, DOP.PUT);
      }
      return entry;
      `
    },
    {
      documentation: 'Using assembly line, write to all online mediators in zone 0 and same realm,region',
      name: 'cmd_',
      javaCode: `
      Object cmd = getDelegate().cmd_(x, obj);
      if ( cmd != null ) {
        return submit(x, cmd, DOP.CMD);
      }
      return cmd;
      `
    },
    {
      documentation: 'Using assembly line, write to mediators',
      name: 'submit',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        },
      ],
      type: 'Object',
      javaCode: `
    try {
      // getLogger().debug("submit", dop.getLabel(), obj.getClass().getSimpleName());

      final ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      final ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      Agency agency = (Agency) x.get(support.getThreadPoolName());
      for ( ClusterConfig config : support.getBroadcastMediators() ) {
        // getLogger().debug("submit", "job", config.getId(), dop.getLabel(), "assembly");
        agency.submit(x, new ContextAgent() {
          public void execute(X x) {
            getLogger().debug("agency", "execute", config.getId());
             try {
              DAO dao = (DAO) getClients().get(config.getId());
              if ( dao == null ) {
                dao = support.getBroadcastClientDAO(x, getServiceName(), myConfig, config);
                getClients().put(config.getId(), dao);
              }

              if ( DOP.PUT == dop ) {
                dao.put_(x, (FObject) obj);
              } else if ( DOP.CMD == dop ) {
                dao.cmd_(x, obj);
              }
              ((OMLogger) x.get("OMLogger")).log("medusa.broadcast.node-mediator");
            } catch ( Throwable t ) {
              getLogger().error("agency", "execute", config.getId(), t);
            }
          }
        }, this.getClass().getSimpleName());
      }
      return obj;
    } catch (Throwable t) {
      getLogger().error(t.getMessage(), t);
      throw t;
    }
      `
    }
   ]
});
