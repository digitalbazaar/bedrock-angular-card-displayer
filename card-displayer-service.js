/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
define(['angular'], function(angular) {

'use strict';

function register(module) {
  module.service('brCardDisplayerService', factory);
}

/* @ngInject */
function factory() {
  var service = {};

  /**
   * Computes the CSS style for a ISO/IEC 7810 ID-1 card based on the given
   * displayer options.
   *
   * @param type the type of card (default: 'id-1').
   * @param options the options to use:
   *          [width] the width for the card component.
   */
  service.computeCardStyle = function(type, options) {
    if(arguments.length === 1) {
      options = type;
      type = 'id-1';
    }
    options = options || {};

    var style = {};

    if(type !== 'id-1') {
      throw new TypeError(
        'Unsupported card type: "' + type + '". Supported types are: "id-1".');
    }

    if(typeof options.width === 'string') {
      var width = service.parseCssValue(options.width);
      style.width = options.width;
      // id-1 dimensions are 85.60mm x 53.98mm
      style.height = (width.value * 53.98/85.60) + width.unit;
      // default CSS is coded based on a 1/100 width:fontsize ratio
      style['font-size'] = (width.value * 1/100) + width.unit;
    }

    // TODO: need to be able to support different backgrounds for card header
    // vs. card body
    if(options.background && typeof options.background === 'object') {
      angular.extend(style, service.computeBackground(options.background));
    }

    return style;
  };

  /**
   * Computes the CSS style for an element's background.
   *
   * @param options the options to use:
   *          [radialGradient] true for a default radial gradient.
   */
  service.computeBackground = function(options) {
    options = options || {};

    var style = {};

    var backgroundImages = [];

    if(options.color) {
      style['background-color'] = options.color;
    }

    if(options.image) {
      backgroundImages.push('url("' + options.image + '")');
    }

    var radialGradient = null;
    if(options.radialGradient === true) {
      // create default radial gradient
      radialGradient = 'radial-gradient(' +
        'circle at -25% -25%, ' +
        'rgba(255, 255, 255, 0.75) 0%, ' +
        'transparent 70%, ' +
        'rgba(0, 0, 0, 0.2) 90%)';
      /*radialGradient = 'radial-gradient(' +
        'ellipse at center, #fff 0%, transparent 80%)';*/
    }
    if(radialGradient) {
      backgroundImages.push(radialGradient);
    }

    var linearGradient = null;
    if(options.linearGradient === true) {
      // create default linear gradient
      linearGradient = 'linear-gradient(' +
        'to bottom right, ' +
        'rgba(255, 255, 255, 0.5) 0%, ' +
        'transparent 40%, ' +
        'rgba(0, 0, 0, 0.2) 80%)';
      backgroundImages.push(linearGradient);
    }

    if(backgroundImages.length > 0) {
      style['background-image'] = backgroundImages.join(', ');
    }

    return style;
  };

  service.parseCssValue = function(value) {
    var parsed = {};
    var matches = value.toString().trim().match(/^(-?[\d+\.\-]+)([a-z]+|%)$/i);
    if(matches) {
      parsed.value = parseFloat(matches[1]);
      parsed.unit = matches[2];
    } else {
      parsed.value = 0;
      parsed.unit = value;
    }
    return parsed;
  };

  return service;
}

return register;

});
