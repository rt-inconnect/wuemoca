Ext.define('App.store.Aggregation', {
  extend: 'Ext.data.Store',

  alias: 'store.aggregation',

  storeId: 'aggregation',

  fields: [ 'id', 'enName', 'ruName' ],

  data: [],

  proxy: {
    type: 'memory',
    reader: {
      type: 'json'
    }
  }
});
