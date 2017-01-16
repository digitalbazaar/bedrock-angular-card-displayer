var bedrock = require('bedrock');
var path = require('path');

// NOTE: it is critical that bedrock-protractor be required first so that
// it can register a bedrock.cli event listener
require('bedrock-protractor');

var config = bedrock.config;

bedrock.events.on('bedrock.test.configure', function() {
  // test configuration code
});

// pseudo Bower package
var dir = path.join(__dirname);
config.requirejs.bower.packages.push({
  path: path.join(dir, 'components'),
  manifest: path.join(dir, 'bower.json')
});

bedrock.start();
