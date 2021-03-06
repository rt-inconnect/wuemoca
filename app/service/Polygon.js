Ext.define('App.service.Polygon', {

  requires: [
    'App.util.Window'
  ],

  singleton: true,
  all: __LocalDB.get('Polygons', []),

  source: false,
  layer: false,

  drawControl: false,
  modifyControl: false,
  selectControl: false,

  activated: false,

  selected: false,

  windowEdit: Ext.create('App.util.Window', { title: i18n.exportUI.title, items: [{ xtype: 'app-polygon-form' }] }),

  initialize: function () {

    var self = this;

    self.source = new ol.source.Vector();
    self.layer = new ol.layer.Vector({
      source: self.source,
      style: self.getDefaultColor
    });

    self.layer.setMap(App.service.Map.instance);

    self.drawControl = new ol.interaction.Draw({ type: ('Polygon') });

    self.selectControl = new ol.interaction.Select({
      layers: [self.layer],
      style: self.getSelectColor
    });

    App.service.Map.instance.addInteraction(self.drawControl);
    App.service.Map.instance.addInteraction(self.selectControl);
    this.deactivate();

    self.selectControl.on('select', function (e) {
      self.whenUnselect(e);
      if (e.selected.length < 1) return false;
      self.whenSelect(e);
    });


    self.drawControl.on('drawend', function (e) {
      self.registerPolygon(e.feature.getGeometry());
      self.rerenderFeatures();
    });

    self.rerenderFeatures();
  },

  activate: function () {
    this.drawControl.setActive(true);
    this.selectControl.setActive(false);
    this.activated = true;
  },

  deactivate: function () {
    this.drawControl.setActive(false);
    this.selectControl.setActive(true);
    this.activated = false;
  },

  getDefaultColor: function (feature) {
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: '#41b6c4'
      }),
      stroke: new ol.style.Stroke({
        color: '#2b8cbe'
      })
    });
  },

  getSelectColor: function (feature) {
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: '#fff'
      }),
      stroke: new ol.style.Stroke({
        color: '#4d004b'
      })
    });
  },

  updateWindowEdit: function () {
    var polygon = this.all[this.getSelectedIndex()];
    App.service.Helper.setComponentsValue([
       { id: 'exportui-name',       value: polygon.info.name     || '' }
      ,{ id: 'exportui-location',   value: polygon.info.location || '' }
    ]);
  },

  whenUnselect: function (e) {
    App.service.Helper.disableComponents(['polygon-btn-edit', 'polygon-btn-calculate', 'polygon-btn-remove']);
    //if (!this.windowEdit.isHidden()) this.windowEdit.close();
  },

  whenSelect: function (e) {
    App.service.Helper.enableComponents(['polygon-btn-edit', 'polygon-btn-calculate', 'polygon-btn-remove']);
    this.selected = e.selected[0];
    if (!this.windowEdit.isHidden()) this.updateWindowEdit();
  },

  registerPolygon: function (geometry) {
    var polygon = {
      uid: 'polygon-' + new Date().getTime(),
      info: { name: '', location: '' },
      data: [],
      geometry: geometry.getCoordinates()[0]
    };
    this.all.push(polygon);
    this.saveAll();
    return polygon;
  },

  createFeature: function (polygon) {
    var feature = new ol.Feature(new ol.geom.Polygon([polygon.geometry]));
    feature.set('uid',  polygon.uid);
    feature.set('data', polygon.data);
    return feature;
  },

  removeSelectedPolygon: function () {
    this.all.splice(this.getSelectedIndex(), 1);
    this.saveAll();
    this.source.removeFeature(this.selected);
    this.selectControl.getFeatures().clear();
    this.whenUnselect();
    this.selected = false;
  },

  save: function (info) {
    this.all[this.getSelectedIndex()].info = info;
    this.saveAll();
  },

  saveAll: function () {
    __LocalDB.set('Polygons', this.all);
  },

  rerenderFeatures: function () {
    var self = this;
    var source = self.layer.getSource();
    source.clear();
    self.all.map(function (polygon) {
      source.addFeature(self.createFeature(polygon));
    });
  },

  getSelectedIndex: function () {
    return this.all.map(function (d) {
      return d.uid;
    }).indexOf(this.selected.get('uid'));
  }

});