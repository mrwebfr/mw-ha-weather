// ============================================================
// MWHA Weather — Constants & Configuration
// ============================================================

const MWHA = {};

MWHA.CARD_NAME = 'mw-ha-weather';
MWHA.CARD_EDITOR_NAME = 'mw-ha-weather-editor';
MWHA.CARD_VERSION = '0.1.0';

MWHA.API_BASE_FORECAST = 'https://api.open-meteo.com/v1/forecast';

MWHA.DEFAULT_CONFIG = {
  latitude: null,
  longitude: null,
  name: '',
  units: 'metric',
  language: '',
  refresh_interval: 10,
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

MWHA.UNITS_LABELS = {
  metric: { temp: '°C', speed: 'km/h', pressure: 'hPa' },
  imperial: { temp: '°F', speed: 'mph', pressure: 'hPa' },
  standard: { temp: 'K', speed: 'm/s', pressure: 'hPa' },
};
