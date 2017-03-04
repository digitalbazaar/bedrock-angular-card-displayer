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
  // card style exposed to view
  self.cardStyle = {};

  // internal vars for tracking style changes
  var style = {};
  var styleOptions = {
    background: {
      radialGradient: true
    }
  };

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
          $scope.$apply();
        });
    }
    if(changes.options && changes.options.currentValue.displayer &&
      typeof changes.options.currentValue.displayer.style === 'object') {
      self.cardStyle = brCardDisplayerService.computeCardStyle(
        angular.merge(
          {}, styleOptions, changes.options.currentValue.displayer.style));
      angular.extend(self.cardStyle, style);
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
}

return register;

});
