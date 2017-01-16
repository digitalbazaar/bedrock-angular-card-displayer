/*!
 * Bedrock Motor Vehicle Credential Displayer
 *
 * Copyright (c) 2016-2017 Digital Bazaar, Inc. All rights reserved.
 */
define(['jsonld'], function(jsonld) {

'use strict';

function register(module) {
  module.component('brMotorVehicleCredentialDisplayer', {
    bindings: {
      // FIXME: don't need all of these?
      model: '<brModel',
      library: '<?brLibrary',
      options: '<brOptions'
    },
    controller: Ctrl,
    templateUrl:
      requirejs.toUrl(
        'bedrock-angular-card-displayer/' +
          'motor-vehicle-license-credential-displayer.html')
  });
}

var DISPLAY_CONTEXT = 'https://w3id.org/identity/v1';

/* @ngInject */
function Ctrl($scope) {
  var self = this;

  self.$onChanges = function(changes) {
    if(changes.model && changes.model.currentValue) {
      jsonld.promises.compact(
        changes.model.currentValue.credential, DISPLAY_CONTEXT)
        .then(function(compacted) {
          self.credential = compacted;
          $scope.$apply();
        });
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
}

return register;

});
