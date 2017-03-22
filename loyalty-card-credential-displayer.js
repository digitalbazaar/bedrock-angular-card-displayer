/*!
 * Loyalty Card Displayer
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* global requirejs */
define(['angular', 'jsonld'], function(angular, jsonld) {

'use strict';

function register(module) {
  module.component('brLoyaltyCardCredentialDisplayer', {
    bindings: {
      model: '<brModel',
      library: '<?brLibrary',
      options: '<brOptions'
    },
    controller: Ctrl,
    templateUrl:
      requirejs.toUrl(
        'bedrock-angular-card-displayer/loyalty-card-credential-displayer.html')
  });
}

var DISPLAY_CONTEXT = [
  'https://w3id.org/identity/v1',
  'https://w3id.org/credentials/v1',
  'https://w3id.org/documents/v1'];

var DISPLAY_FRAME = {
  '@context': DISPLAY_CONTEXT,
  claim: {}
};

/* @ngInject */
function Ctrl($scope, brCardDisplayerService) {
  var self = this;
  // styles exposed to view
  self.cardStyle = {};
  self.containerStyle = {};
  self.containerClass = {
    'br-card-id-1-border': true,
    'br-card-id-1-radial-gradient': true
  };
  self.textStyle = {};

  // internal vars for tracking style changes
  var style = {};
  var styleOptions = {
    background: {
      radialGradient: false
    }
  };

  // TODO: The code below moves background styles from the main card style
  // to the container to get certain effects. This is not intuitive and
  // this code needs some cleanup and general structure for better applying
  // options like gradients, etc.

  self.$onChanges = function(changes) {
    if(changes.model && changes.model.currentValue) {
      jsonld.promises.frame(
        changes.model.currentValue.credential, DISPLAY_FRAME)
        .then(function(framed) {
          var credential = (framed['@graph'] || [])[0] || {};
          if(!credential.claim || typeof credential.claim !== 'object') {
            // TODO: better error handling
            console.error('No embedded claim found in credential.');
            return credential;
          }
          if(credential.claim.document &&
            typeof credential.claim.document === 'object' &&
            credential.claim.document.documentType) {
            return getDocumentType(credential);
          }
          return credential;
        }).then(function(credential) {
          self.credential = credential;
        }).catch(function(err) {
          // TODO: better error handling
          console.error(err);
          self.credential = {};
        }).then(function() {
          self.cardStyle = brCardDisplayerService.computeCardStyle(
            angular.merge({}, styleOptions, self.options.displayer.style));
          angular.extend(self.cardStyle, style);
          moveBackgroundEffectsToContainer();
          updateTextStyle();
          $scope.$apply();
        });
    }
    if(changes.options && !changes.options.isFirstChange() &&
      changes.options.currentValue.displayer &&
      typeof changes.options.currentValue.displayer.style === 'object') {
      self.cardStyle = brCardDisplayerService.computeCardStyle(
        angular.merge(
          {}, styleOptions, changes.options.currentValue.displayer.style));
      angular.extend(self.cardStyle, style);
      moveBackgroundEffectsToContainer();
      updateTextStyle();
    }
  };

  function getDocumentType(credential) {
    var documentTypeId = getDocumentTypeId(
      credential.claim.document.documentType);
    if(!documentTypeId) {
      return credential;
    }

    // fetch documentType by its ID
    return jsonld.promises.compact(documentTypeId, DISPLAY_CONTEXT, {
      expandContext: {base: documentTypeId},
      base: ''
    }).then(function(documentType) {
      credential.claim.document.documentType = documentType;

      if(documentType.documentBackgroundImage) {
        styleOptions.background.image = documentType.documentBackgroundImage;
        style['background-repeat'] = 'no-repeat';
        style['background-size'] = 'cover';
      } else {
        delete styleOptions.background.image;
        delete style['background-repeat'];
        delete style['background-size'];
      }
      if(documentType.documentBackgroundColor) {
        styleOptions.background.color = documentType.documentBackgroundColor;
      } else {
        delete styleOptions.background.color;
      }

      return credential;
    });
  }

  function getDocumentTypeId(documentType) {
    if(typeof documentType === 'string') {
      return documentType;
    }
    if(documentType === 'object') {
      if(documentType.title &&
        documentType.brand &&
        typeof documentType.brand === 'object' &&
        documentType.brand.logo &&
        documentType.brand.text) {
        // documentType has enough embedded info for display, return early
        return null;
      }
      if(!documentType.id) {
        // no ID to look up documentType with, bail
        return null;
      }
      return documentType.id;
    }

    // unsupported
    console.error('Unsupported documentType format.');
    return null;
  }

  function moveBackgroundEffectsToContainer() {
    self.containerStyle = {};
    if('background-image' in self.cardStyle) {
      self.containerStyle['background-image'] =
        self.cardStyle['background-image'];
      self.containerStyle['background-repeat'] =
        self.cardStyle['background-repeat'];
      self.containerStyle['background-size'] =
        self.cardStyle['background-size'];
      delete self.cardStyle['background-image'];
      delete self.cardStyle['background-repeat'];
      delete self.cardStyle['background-size'];
    }
  }

  function updateTextStyle() {
    var hex =
      self.credential.claim.document.documentType.documentForegroundColor;
    var rgb = brCardDisplayerService.hexToRgb(hex);
    var rgbaLight = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.25)';
    var rgbaDark = 'rgba(0,0,0,0.25)';
    self.textStyle = {
      color: hex,
      'text-shadow': [
        '-1px 0px 1px ' + rgbaLight,
        '0px -1px 1px ' + rgbaLight,
        '1px 0px 1px ' + rgbaDark,
        '0px 1px 1px ' + rgbaDark].join(',')
    };
  }
}

return register;

});
