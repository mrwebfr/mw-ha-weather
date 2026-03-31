// ============================================================
// MWHA Weather — Constants & Configuration
// ============================================================

const MWHA = {};

MWHA.CARD_NAME = 'mw-ha-weather';
MWHA.CARD_EDITOR_NAME = 'mw-ha-weather-editor';
MWHA.CARD_VERSION = '0.2.0';

MWHA.DEFAULT_CONFIG = {
  entity: '',
  name: '',
  show_current: true,
  show_forecast: true,
  show_details: true,
  show_humidity: true,
  show_pressure: true,
  show_wind: true,
  show_visibility: true,
  show_feels_like: true,
  forecast_days: 5,
};

// HA condition string -> icon code (day variant)
MWHA.CONDITION_ICON = {
  'sunny': '01d',
  'clear-night': '01n',
  'partlycloudy': '03d',
  'cloudy': '04d',
  'fog': '50d',
  'rainy': '10d',
  'pouring': '09d',
  'snowy': '13d',
  'snowy-rainy': '10d',
  'lightning': '11d',
  'lightning-rainy': '11d',
  'exceptional': '03d',
  'windy': '03d',
  'windy-variant': '04d',
  'hail': '09d',
};
