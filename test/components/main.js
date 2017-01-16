define(['angular'], function(angular) {

'use strict';

var module = angular.module(
  'bedrock-angular-card-displayer-test', ['bedrock-angular-card-displayer']);

Array.prototype.slice.call(arguments, 1).forEach(function(register) {
  register(module);
});

});
