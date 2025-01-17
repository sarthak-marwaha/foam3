/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'PromotedClearAgent',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.NanoService'
  ],

  documentation: 'Clear data from promoted entries which will never be referenced again',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.ContextAgentTimerTask',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GT',
    'static foam.mlang.MLang.LT',
    'static foam.mlang.MLang.LTE',
    'static foam.mlang.MLang.MAX',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Sequence',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'java.util.Timer'
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      value: 'internalMedusaDAO'
    },
    {
      // REVIEW: Get this from DaggerService?
      documentation: 'Presently Dagger service bootstraps two entries.',
      name: 'minIndex',
      class: 'Long',
      value: 2
    },
    {
      documentation: 'Number of entries to retain for potential consensus matching.',
      name: 'retain',
      class: 'Long',
      value: 10000,
    },
    {
      name: 'timerInterval',
      class: 'Long',
      value: 5000
    },
    {
      name: 'initialTimerDelay',
      class: 'Int',
      value: 60000
    },
    {
      documentation: 'Store reference to timer so it can be cancelled, and agent restarted.',
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN',
      networkTransient: true
    }
 ],

  methods: [
    {
      documentation: 'Start as a NanoService',
      name: 'start',
      javaCode: `
      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      setTimer(timer);
      timer.schedule(new ContextAgentTimerTask(getX(), this),
        getTimerInterval(),
        getTimerInterval()
      );
      `
    },
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
      PM pm = new PM(this.getClass().getSimpleName());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      long maxIndex = replaying.getIndex() - getRetain();
      try {
        DAO dao = (DAO) x.get(getServiceName());
        dao = dao.where(
          AND(
            GT(MedusaEntry.INDEX, getMinIndex()),
            LTE(MedusaEntry.INDEX, maxIndex),
            EQ(MedusaEntry.PROMOTED, true)
          )
        );
        Max max = (Max) MAX(MedusaEntry.INDEX);
        Count count = new Count();
        ClearSink clearSink = new ClearSink(x, dao);
        CompactionSink compactionSink = new CompactionSink(x, clearSink);
        Sequence seq = new Sequence.Builder(x)
          .setArgs(new Sink[] {count, max, compactionSink})
          .build();
        dao.select(seq);
        if ( ((Long)count.getValue()) > 0 ) {
          Loggers.logger(x, this).debug("cleared", count.getValue());
          setMinIndex((Long)max.getValue());
        }
      } catch ( Throwable t ) {
        pm.error(x, t);
        Loggers.logger(x, this).error(t);
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});
