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
    easing: {default: 'easeInQuad'},
    elasticity: {default: 400},
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
    var attrName = this.attrName;
    var data = this.data;
    var el = this.el;
    var propType = getPropertyType(el, data.property);

    // Base config.
    var config = {
      autoplay: false,
      begin: function () {
        el.emit('animation-start');
        el.emit(attrName + '-start');
      },
      complete: function () {
        el.emit('animation-end');
        el.emit(attrName + '-end');
      },
      direction: data.direction,
      duration: data.duration,
      easing: data.easing,
      elasticity: data.elasticity,
      loop: data.loop
    };

    // Customize config based on property type.
    var updateConfig = configDefault;
    if (propType === 'vec2' || propType === 'vec3' || propType === 'vec4') {
      updateConfig = configVector;
    }

    // Stop previous animation.
    this.stopAnimation();

    // Create animation.
    this.animation = anime(updateConfig(el, data, config));
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

/**
 * Stuff property into generic `property` key.
 */
function configDefault (el, data, config) {
  var from = getComponentProperty(el, data.property);
  return AFRAME.utils.extend({}, config, {
    targets: [{property: from}],
    property: data.to,
    update: function () {
      setComponentProperty(el, data.property, this.targets[0].property);
    }
  });
}

/**
 * Extend x/y/z/w onto the config.
 */
function configVector (el, data, config) {
  var from = getComponentProperty(el, data.property);
  var to = AFRAME.utils.coordinates.parse(data.to);
  return AFRAME.utils.extend({}, config, {
    targets: [from],
    update: function () {
      setComponentProperty(el, data.property, this.targets[0]);
    }
  }, to);
}

function getPropertyType (el, property) {
  var split = property.split('.');
  var componentName = split[0];
  var propertyName = split[1];
  var component = el.components[componentName] || AFRAME.components[componentName];

  // Primitives.
  if (!component) { return null; }

  if (propertyName) {
    return component.schema[propertyName].type;
  }
  return component.schema.type;
}
