const DARKSKY_API_KEY = process.env.DARKSKY_API_KEY;

const ATMS_101_FORECAST_URL = 'http://www.atmos.washington.edu/~atm101/process_fcst.cgi';
const ATMS_101_PSEUDONYM = process.env.ATMS_101_PSEUDONYM;
const ATMS_101_PASSWORD = process.env.ATMS_101_PASSWORD;

if (!DARKSKY_API_KEY || !ATMS_101_PSEUDONYM || !ATMS_101_PASSWORD) {
  console.log('DARKSKY_API_KEY, ATMS_101_PSEUDONYM, or ATMS_101_PASSWORD not set');
  process.exit(1);
}

const NO_PRECIP_PROBABILITY = .10;
const MEASURABLE_PRECIP_PROBABILITY = .70;
const MEASURABLE_PRECIP_INTENSITY = .02;
const SEATAC_COORDINATES = [47.44472, -122.31361];

var request = require('request');
var Forecast = require('forecast');

var forecast = new Forecast({
  service: 'darksky',
  key: DARKSKY_API_KEY,
  units: 'fahrenheit',
  cache: false,
});

forecast.get(SEATAC_COORDINATES, function(err, weather) {
  if (err) {
    return console.log(err);
  }

  var fcst = processWeatherForNthDay(weather, 1);

  console.log('-----------------');
  console.log('Forecast data:', fcst);
  console.log('-----------------');

  fcst.pseudonym = ATMS_101_PSEUDONYM;
  fcst.password = ATMS_101_PASSWORD;

  request.post({ url: ATMS_101_FORECAST_URL, form: fcst }, function(err, res, body) {
    if (err) {
      return console.log('Failed to submit forecast:', err);
    }
    if (res.statusCode != 200) {
      console.log('Failed to submit forecast: HTTP', res.statusCode);
      console.log(body);
    } else {
      console.log('Successfully submitted forecast! :)');
    }
  });
});

function processWeatherForNthDay(weather, n) {
  var day = weather.daily.data[n];
  console.log('Forecasting for: ' + new Date(day.time * 1000));
  console.log('-----------------');
  console.log('Summary:', day.summary);
  var maxt = parseInt(day.temperatureMax);
  var mint = parseInt(day.temperatureMin);
  console.log('High/Low temps (F):' + maxt + ' / ' + mint);
  console.log('Precipitation probability:' + day.precipProbability);
  console.log('Max precipitation intensity:' + day.precipIntensityMax);
  var rain;
  if (day.precipProbability <= NO_PRECIP_PROBABILITY) {
    rain = 'N';
  } else if (day.precipProbability >= MEASURABLE_PRECIP_PROBABILITY && day.precipIntensityMax > MEASURABLE_PRECIP_INTENSITY) {
    rain = 'Y';
  } else {
    rain = 'T';
  }
  console.log('Precipitation:', rain);
  return {
    maxt: maxt,
    mint: mint,
    rain: rain,
  }
}
