/* global AFRAME */
var anime = require('animejs');

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

var utils = AFRAME.utils;
var getComponentProperty = utils.entity.getComponentProperty;
var setComponentProperty = utils.entity.setComponentProperty;
var styleParser = utils.styleParser.parse;

/**
 * Animation component for A-Frame.
 */
AFRAME.registerComponent('animation', {
  schema: {
    delay: {default: 0},
    direction: {default: ''},
    duration: {default: 1000},
    easing: {default: 'easeOutElastic'},
    loop: {default: false},
    property: {default: ''},
    to: {default: ''}
  },

  multiple: true,

  init: function () {
    this.animation = null;
    this.isPlaying = false;
  },

  update: function () {
    var data = this.data;
    var el = this.el;
    var from = AFRAME.utils.entity.getComponentProperty(el, data.property);
    var propType = getPropertyType(el, data.property);

    var config = {
      autoplay: false,
      direction: data.direction,
      duration: data.duration,
      loop: data.loop,
    };

    if (propType === 'vec3') {
      var to = AFRAME.utils.coordinates.parse(data.to);
      config = AFRAME.utils.extend({}, config, {
        targets: [from],
        update: function () {
          AFRAME.utils.entity.setComponentProperty(el, data.property, this.targets[0]);
        }
      }, to);
    } else {
      config = AFRAME.utils.extend({}, config, {
        targets: [{property: from}],
        property: data.to,
        update: function () {
          AFRAME.utils.entity.setComponentProperty(el, data.property,
                                                   this.targets[0].property);
        }
      });
    }

    this.stopAnimation();
    this.animation = anime(config);
  },

  remove: function () {
    this.stopAnimation();
  },

  tick: function (t) {
    if (!this.animation) { return; }
    this.animation.tick(t);
  },

  pause: function () {
    this.stopAnimation();
  },

  play: function () {
    if (!this.animation) { return; }
    this.animation.play();
  },

  stopAnimation: function () {
    if (!this.animation) { return; }
    this.animation.pause();
  }
});

function getPropertyType (el, property) {
  var split = property.split('.');
  var componentName = split[0];
  var propertyName = split[1];
  var schema = (el.components[componentName] || AFRAME.components[componentName]).schema;

  if (propertyName) {
    return schema[propertyName].type;
  }
  return schema.type;
}
