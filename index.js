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

    var value = AFRAME.utils.entity.getComponentProperty(el, data.property);

    if (value.constructor === String) {
      var target = {};
      target[data.property] = value;
      value = target;
    }

    var config = {
      targets: [value],
      autoplay: false,
      direction: data.direction,
      duration: data.duration,
      loop: data.loop,
      update: function () {
        AFRAME.utils.entity.setComponentProperty(el, data.property, value[data.property]);
      }
    };
    config[data.property] = data.to;

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
