/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
define([], function() {

'use strict';

function register(module) {
  module.service('brCardDisplayerService', factory);
}

/* @ngInject */
function factory() {
  var service = {};

  /**
   * Computes a CSS style for a ISO/IEC 7810 ID-1 card based on the given
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
