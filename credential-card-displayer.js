/*!
 * Generic Credential Card Displayer
 *
 * Copyright (c) 2016-2017 Digital Bazaar, Inc. All rights reserved.
 */
define(['lodash', 'jsonld'], function(_, jsonld) {

'use strict';

function register(module) {
  module.component('brCredentialCardDisplayer', {
    bindings: {
      model: '<brModel',
      library: '<?brLibrary',
      options: '<brOptions'
    },
    controller: Ctrl,
    templateUrl:
      requirejs.toUrl(
        'bedrock-angular-card-displayer/credential-card-displayer.html')
  });
}

var DISPLAY_CONTEXT = 'https://w3id.org/identity/v1';

/* @ngInject */
function Ctrl($q, brCardDisplayerService) {
  var self = this;

  self.$onChanges = function(changes) {
    if(changes.model && changes.model.currentValue) {
      $q.resolve(jsonld.promises.compact(
        changes.model.currentValue.credential, DISPLAY_CONTEXT))
        .then(function(compacted) {
          self.credential = compacted;
          self.credentialType = getType(self.credential);
        });
    }
    if(changes.options && changes.options.currentValue.displayer &&
      typeof changes.options.currentValue.displayer.style === 'object') {
      self.cardStyle = brCardDisplayerService.computeCardStyle(
        changes.options.currentValue.displayer.style);
    }
  };
  self.schemaFor = function(id) {
    if(id in self.library.properties) {
      return self.library.properties[id];
    }
    if(id in self.library.classes) {
      return self.library.properties[id];
    }
    return null;
  };
  self.labelFor = function(id) {
    var schema = self.schemaFor(id);
    if(schema && schema.label) {
      return schema.label;
    }
    return id;
  };

  function getType(credential) {
    var i = _.intersectionWith(
      credential.type, ['br:', 'urn:'], function(a, b) {
        return a.indexOf(b) === 0;
      });
    return i.length === 1 ? i[0] : null;
  }
}

return register;

});
