Ext.define('App.util.Window', {
  extend: 'Ext.Window',

  layout:'fit',
  border: false,
  width: __Global.chart.Width,
  height: __Global.chart.Height,
  title: '',
  collapsed: false,
  resizable: false,
  closeAction: 'hide',
  plain: true,
  shadow: true,
  bodyBorder: false

});
