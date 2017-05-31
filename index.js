/*!
 * Bedrock Credential Card Displayers
 *
 * Copyright (c) 2016-2017 Digital Bazaar, Inc. All rights reserved.
 */
import angular from 'angular';
import CardDisplayerService from './card-displayer-service.js';
import CredentialCardDisplayerComponent from
  './credential-card-displayer-component.js';
import LoyaltyCardCredentialDisplayerComponent from
  './loyalty-card-credential-displayer-component.js';
import IdentityCardCredentialDisplayerComponent from
  './identity-card-credential-displayer-component.js';
import MotorVehicleCredentialDisplayerComponent from
  './motor-vehicle-credential-displayer-component.js';

var module = angular.module('bedrock.card-displayer', []);

module.service('brCardDisplayerService', CardDisplayerService);
module.component('brCredentialCardDisplayer', CredentialCardDisplayerComponent);
module.component('brLoyaltyCardCredentialDisplayer',
  LoyaltyCardCredentialDisplayerComponent);
module.component('brIdentityCardCredentialDisplayer',
  IdentityCardCredentialDisplayerComponent);
module.component('brMotorVehicleCredentialDisplayer',
  MotorVehicleCredentialDisplayerComponent);
