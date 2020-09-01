const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'mapquest',
  httpAdapter: 'https',
  apiKey: 'PlKsJSGGIdsoqivfmGLEsTpedXVNN20R',
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
