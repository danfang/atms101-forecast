var Forecast = require('forecast');

var forecast = new Forecast({
  service: 'darksky',
  key: 'your-api-key',
  units: 'fahrenheit',
  cache: false,
});

forecast.get([47.44472, -122.31361], function(err, weather) {
  if (err) {
    return console.log(err);
  }
  console.dir(weather);
});
