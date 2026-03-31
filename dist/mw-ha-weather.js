(function() {
'use strict';

// --- constants.js ---
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


// --- utils.js ---
// ============================================================
// MWHA Weather - Utilities
// ============================================================

MWHA.Utils = {
  formatTemp(value, unit) {
    if (value == null) return '--';
    return Math.round(value) + (unit || '\u00b0C');
  },

  formatSpeed(value, unit) {
    if (value == null) return '--';
    return Math.round(value) + ' ' + (unit || 'km/h');
  },

  formatPressure(value, unit) {
    if (value == null) return '--';
    return Math.round(value) + ' ' + (unit || 'hPa');
  },

  formatPercent(value) {
    if (value == null) return '--';
    return Math.round(value) + '%';
  },

  formatVisibility(value) {
    if (value == null) return '--';
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + ' km';
    }
    return Math.round(value) + ' m';
  },

  formatDayName(isoString, lang) {
    var date = new Date(isoString);
    if (isNaN(date.getTime())) return '--';
    return date.toLocaleDateString(lang || 'fr', { weekday: 'short' });
  },

  windDirection(degrees) {
    if (degrees == null) return '';
    var directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    var index = Math.round(degrees / 45) % 8;
    return directions[index];
  },

  // WMO weather code -> icon code
  weatherCodeToIcon(code, isDay) {
    var suffix = isDay ? 'd' : 'n';
    if (code === 0) return '01' + suffix;
    if (code === 1) return '02' + suffix;
    if (code === 2) return '03' + suffix;
    if (code === 3) return '04' + suffix;
    if (code === 45 || code === 48) return '50' + suffix;
    if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) return '09' + suffix;
    if (code >= 61 && code <= 67) return '10' + suffix;
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return '13' + suffix;
    if (code >= 95) return '11' + suffix;
    return '03' + suffix;
  },

  // HA condition string -> icon code
  conditionToIcon(condition, isDay) {
    if (!isDay && condition === 'sunny') return '01n';
    if (!isDay && condition === 'partlycloudy') return '02n';
    var icon = MWHA.CONDITION_ICON[condition];
    if (icon) {
      if (!isDay && icon.endsWith('d')) {
        return icon.slice(0, -1) + 'n';
      }
      return icon;
    }
    return isDay ? '03d' : '03n';
  },

  // WMO weather code -> description
  weatherCodeToDescription(code, lang) {
    var locale = (lang || 'fr').toLowerCase().slice(0, 2);
    var descriptions = locale === 'fr' ? {
      0: 'Ciel degage',
      1: 'Principalement degage',
      2: 'Partiellement nuageux',
      3: 'Couvert',
      45: 'Brouillard',
      48: 'Brouillard givrant',
      51: 'Bruine legere',
      53: 'Bruine moderee',
      55: 'Bruine dense',
      56: 'Bruine verglacante legere',
      57: 'Bruine verglacante dense',
      61: 'Pluie legere',
      63: 'Pluie moderee',
      65: 'Pluie forte',
      66: 'Pluie verglacante legere',
      67: 'Pluie verglacante forte',
      71: 'Neige legere',
      73: 'Neige moderee',
      75: 'Neige forte',
      77: 'Grains de neige',
      80: 'Averses legeres',
      81: 'Averses moderees',
      82: 'Averses violentes',
      85: 'Averses de neige legeres',
      86: 'Averses de neige fortes',
      95: 'Orage',
      96: 'Orage avec grele legere',
      99: 'Orage avec grele forte',
    } : {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Light rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Light snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Light rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Light snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with light hail',
      99: 'Thunderstorm with heavy hail',
    };
    return descriptions[code] || (locale === 'fr' ? 'Conditions inconnues' : 'Unknown conditions');
  },

  // HA condition string -> description
  conditionToDescription(condition, lang) {
    var locale = (lang || 'fr').toLowerCase().slice(0, 2);
    var descriptions = locale === 'fr' ? {
      'sunny': 'Ensoleille',
      'clear-night': 'Nuit degagee',
      'partlycloudy': 'Partiellement nuageux',
      'cloudy': 'Couvert',
      'fog': 'Brouillard',
      'rainy': 'Pluie',
      'pouring': 'Fortes pluies',
      'snowy': 'Neige',
      'snowy-rainy': 'Pluie et neige',
      'lightning': 'Orage',
      'lightning-rainy': 'Orage pluvieux',
      'exceptional': 'Exceptionnel',
      'windy': 'Venteux',
      'windy-variant': 'Venteux et nuageux',
      'hail': 'Grele',
    } : {
      'sunny': 'Sunny',
      'clear-night': 'Clear night',
      'partlycloudy': 'Partly cloudy',
      'cloudy': 'Cloudy',
      'fog': 'Fog',
      'rainy': 'Rainy',
      'pouring': 'Pouring',
      'snowy': 'Snowy',
      'snowy-rainy': 'Sleet',
      'lightning': 'Lightning',
      'lightning-rainy': 'Thunderstorm',
      'exceptional': 'Exceptional',
      'windy': 'Windy',
      'windy-variant': 'Windy and cloudy',
      'hail': 'Hail',
    };
    return descriptions[condition] || condition || '--';
  },
};


// --- icons.js ---
// ============================================================
// MWHA Weather — SVG Icons
// ============================================================

MWHA.Icons = {
  _weather: {
    // Ciel dégagé — jour
    '01d': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="32" cy="32" r="12"/><line x1="32" y1="6" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="58"/><line x1="6" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="58" y2="32"/><line x1="13.6" y1="13.6" x2="19.3" y2="19.3"/><line x1="44.7" y1="44.7" x2="50.4" y2="50.4"/><line x1="13.6" y1="50.4" x2="19.3" y2="44.7"/><line x1="44.7" y1="19.3" x2="50.4" y2="13.6"/></svg>',
    // Ciel dégagé — nuit
    '01n': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M38 12a20 20 0 1 0 14 34 16 16 0 0 1-14-34z"/></svg>',
    // Quelques nuages — jour
    '02d': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="24" cy="20" r="8"/><line x1="24" y1="4" x2="24" y2="9"/><line x1="24" y1="31" x2="24" y2="34"/><line x1="10" y1="20" x2="15" y2="20"/><line x1="11" y1="10" x2="14.5" y2="13.5"/><line x1="11" y1="30" x2="14.5" y2="26.5"/><path d="M20 42a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 44 56H22a10 10 0 0 1-2-14z"/></svg>',
    // Quelques nuages — nuit
    '02n': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M30 8a12 12 0 0 0 10 22 10 10 0 0 1-10-22z"/><path d="M20 42a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 44 56H22a10 10 0 0 1-2-14z"/></svg>',
    // Nuages épars
    '03d': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 40a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 42 54H20a10 10 0 0 1-2-14z"/></svg>',
    '03n': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 40a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 42 54H20a10 10 0 0 1-2-14z"/></svg>',
    // Nuages fragmentés / couvert
    '04d': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 44a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 38 58H16a10 10 0 0 1-2-14z"/><path d="M30 32a8 8 0 0 1 7.8-10h1a11 11 0 0 1 10.8 8.4A6.4 6.4 0 0 1 49 42H34" opacity="0.5"/></svg>',
    '04n': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 44a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 38 58H16a10 10 0 0 1-2-14z"/><path d="M30 32a8 8 0 0 1 7.8-10h1a11 11 0 0 1 10.8 8.4A6.4 6.4 0 0 1 49 42H34" opacity="0.5"/></svg>',
    // Averses
    '09d': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 34a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 40 48H18a10 10 0 0 1-2-14z"/><line x1="22" y1="52" x2="20" y2="58"/><line x1="30" y1="52" x2="28" y2="58"/><line x1="38" y1="52" x2="36" y2="58"/></svg>',
    '09n': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 34a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 40 48H18a10 10 0 0 1-2-14z"/><line x1="22" y1="52" x2="20" y2="58"/><line x1="30" y1="52" x2="28" y2="58"/><line x1="38" y1="52" x2="36" y2="58"/></svg>',
    // Pluie
    '10d': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="22" cy="16" r="6" opacity="0.5"/><line x1="22" y1="6" x2="22" y2="8" opacity="0.5"/><line x1="14" y1="16" x2="12" y2="16" opacity="0.5"/><line x1="14.4" y1="9.4" x2="13" y2="8" opacity="0.5"/><path d="M16 34a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 40 48H18a10 10 0 0 1-2-14z"/><line x1="22" y1="52" x2="18" y2="60"/><line x1="30" y1="52" x2="26" y2="60"/><line x1="38" y1="52" x2="34" y2="60"/></svg>',
    '10n': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 34a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 40 48H18a10 10 0 0 1-2-14z"/><line x1="22" y1="52" x2="18" y2="60"/><line x1="30" y1="52" x2="26" y2="60"/><line x1="38" y1="52" x2="34" y2="60"/></svg>',
    // Orage
    '11d': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 30a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 40 44H18a10 10 0 0 1-2-14z"/><polyline points="28,44 24,52 32,52 28,62"/></svg>',
    '11n': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 30a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 40 44H18a10 10 0 0 1-2-14z"/><polyline points="28,44 24,52 32,52 28,62"/></svg>',
    // Neige
    '13d': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 30a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 40 44H18a10 10 0 0 1-2-14z"/><line x1="24" y1="50" x2="24" y2="58"/><line x1="20" y1="54" x2="28" y2="54"/><line x1="36" y1="50" x2="36" y2="58"/><line x1="32" y1="54" x2="40" y2="54"/></svg>',
    '13n': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 30a10 10 0 0 1 9.8-12h1.2a14 14 0 0 1 13.6 10.6A8 8 0 0 1 40 44H18a10 10 0 0 1-2-14z"/><line x1="24" y1="50" x2="24" y2="58"/><line x1="20" y1="54" x2="28" y2="54"/><line x1="36" y1="50" x2="36" y2="58"/><line x1="32" y1="54" x2="40" y2="54"/></svg>',
    // Brouillard
    '50d': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="24" x2="52" y2="24"/><line x1="16" y1="32" x2="48" y2="32"/><line x1="12" y1="40" x2="52" y2="40"/><line x1="20" y1="48" x2="44" y2="48"/></svg>',
    '50n': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="24" x2="52" y2="24"/><line x1="16" y1="32" x2="48" y2="32"/><line x1="12" y1="40" x2="52" y2="40"/><line x1="20" y1="48" x2="44" y2="48"/></svg>',
  },

  _detail: {
    humidity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2.7s-7 8.3-7 13.3a7 7 0 0 0 14 0c0-5-7-13.3-7-13.3z"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9.6 4.5a3 3 0 1 1 3 3H2"/><path d="M12.6 19.5a3 3 0 1 0 3-3H2"/><path d="M17.1 12.5a2.5 2.5 0 1 1 0-5H2"/></svg>',
    pressure: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2.5"/></svg>',
    visibility: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    feels_like: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>',
  },

  get(iconCode) {
    return this._weather[iconCode] || this._weather['03d'];
  },

  getDetail(name) {
    return this._detail[name] || '';
  },
};


// --- styles.js ---
// ============================================================
// MWHA Weather - Styles
// ============================================================

MWHA.Styles = {
  _base: `
    :host {
      display: block;
    }
    ha-card {
      padding: 20px;
      color: var(--primary-text-color);
      background: var(--ha-card-background, var(--card-background-color));
      border-radius: var(--ha-card-border-radius, 12px);
      font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
      overflow: hidden;
    }
    .mwha-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .mwha-header__name {
      font-size: 1.1em;
      font-weight: 500;
      opacity: 0.9;
    }
  `,

  _current: `
    .mwha-current {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 8px 0;
    }
    .mwha-current__icon {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
    }
    .mwha-current__icon svg {
      width: 100%;
      height: 100%;
    }
    .mwha-current__info {
      flex: 1;
    }
    .mwha-current__temp {
      font-size: 3em;
      font-weight: 300;
      line-height: 1;
    }
    .mwha-current__desc {
      font-size: 1.1em;
      opacity: 0.85;
      text-transform: capitalize;
      margin-top: 4px;
    }
    .mwha-current__feels {
      font-size: 0.85em;
      opacity: 0.6;
      margin-top: 2px;
    }
  `,

  _details: `
    .mwha-details {
      display: flex;
      flex-wrap: wrap;
      gap: 0;
      padding: 14px 0;
      margin-top: 12px;
      border-top: 1px solid var(--divider-color, rgba(255,255,255,0.12));
    }
    .mwha-details__item {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      min-width: 70px;
    }
    .mwha-details__item svg {
      width: 22px;
      height: 22px;
      opacity: 0.7;
    }
    .mwha-details__value {
      font-size: 0.95em;
      font-weight: 500;
    }
    .mwha-details__label {
      font-size: 0.75em;
      opacity: 0.5;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `,

  _forecast: `
    .mwha-forecast {
      display: flex;
      justify-content: space-between;
      padding-top: 14px;
      margin-top: 12px;
      border-top: 1px solid var(--divider-color, rgba(255,255,255,0.12));
    }
    .mwha-forecast__day {
      text-align: center;
      flex: 1;
      padding: 4px 0;
    }
    .mwha-forecast__day-name {
      font-size: 0.8em;
      opacity: 0.65;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .mwha-forecast__icon {
      width: 36px;
      height: 36px;
      margin: 4px auto;
    }
    .mwha-forecast__icon svg {
      width: 100%;
      height: 100%;
    }
    .mwha-forecast__temp-high {
      font-size: 0.95em;
      font-weight: 500;
      margin-top: 4px;
    }
    .mwha-forecast__temp-low {
      font-size: 0.85em;
      opacity: 0.55;
    }
  `,

  _error: `
    .mwha-error {
      padding: 20px;
      text-align: center;
    }
    .mwha-error__title {
      font-weight: 500;
      color: var(--error-color, #db4437);
      margin-bottom: 8px;
    }
    .mwha-error__message {
      font-size: 0.9em;
      opacity: 0.7;
    }
    .mwha-loading {
      padding: 40px;
      text-align: center;
      opacity: 0.5;
      font-size: 0.9em;
    }
  `,

  getAll() {
    return '<style>' +
      this._base +
      this._current +
      this._details +
      this._forecast +
      this._error +
      '</style>';
  },
};


// --- templates.js ---
// ============================================================
// MWHA Weather - HTML Templates
// ============================================================

MWHA.Templates = {
  current(data, config, units) {
    return '' +
      '<div class="mwha-current">' +
        '<div class="mwha-current__icon">' + MWHA.Icons.get(data.icon) + '</div>' +
        '<div class="mwha-current__info">' +
          '<div class="mwha-current__temp">' + MWHA.Utils.formatTemp(data.temp, units.temp) + '</div>' +
          '<div class="mwha-current__desc">' + data.description + '</div>' +
          (config.show_feels_like !== false
            ? '<div class="mwha-current__feels">Ressenti ' + MWHA.Utils.formatTemp(data.feels_like, units.temp) + '</div>'
            : '') +
        '</div>' +
      '</div>';
  },

  details(data, config, units) {
    var items = [];

    if (config.show_humidity !== false) {
      items.push(this._detailItem('humidity', MWHA.Utils.formatPercent(data.humidity), 'Humidite'));
    }
    if (config.show_wind !== false) {
      var windText = MWHA.Utils.formatSpeed(data.wind_speed, units.speed);
      var dir = MWHA.Utils.windDirection(data.wind_deg);
      items.push(this._detailItem('wind', windText + (dir ? ' ' + dir : ''), 'Vent'));
    }
    if (config.show_pressure !== false) {
      items.push(this._detailItem('pressure', MWHA.Utils.formatPressure(data.pressure, units.pressure), 'Pression'));
    }
    if (config.show_visibility !== false) {
      items.push(this._detailItem('visibility', MWHA.Utils.formatVisibility(data.visibility), 'Visibilite'));
    }

    if (items.length === 0) return '';

    return '<div class="mwha-details">' + items.join('') + '</div>';
  },

  _detailItem(icon, value, label) {
    return '' +
      '<div class="mwha-details__item">' +
        MWHA.Icons.getDetail(icon) +
        '<span class="mwha-details__value">' + value + '</span>' +
        '<span class="mwha-details__label">' + label + '</span>' +
      '</div>';
  },

  forecast(forecastData, config, lang) {
    if (!forecastData || forecastData.length === 0) return '';

    var days = forecastData.slice(0, config.forecast_days || 5);
    var locale = lang || 'fr';

    var items = days.map(function(day) {
      var icon = MWHA.Utils.conditionToIcon(day.condition, true);
      var description = MWHA.Utils.conditionToDescription(day.condition, locale);
      var tempHigh = day.temperature != null ? day.temperature : day.native_temperature;
      var tempLow = day.templow != null ? day.templow : day.native_templow;

      return '' +
        '<div class="mwha-forecast__day">' +
          '<div class="mwha-forecast__day-name">' + MWHA.Utils.formatDayName(day.datetime, locale) + '</div>' +
          '<div class="mwha-forecast__icon">' + MWHA.Icons.get(icon) + '</div>' +
          '<div class="mwha-forecast__temp-high">' + MWHA.Utils.formatTemp(tempHigh) + '</div>' +
          '<div class="mwha-forecast__temp-low">' + MWHA.Utils.formatTemp(tempLow) + '</div>' +
        '</div>';
    });

    return '<div class="mwha-forecast">' + items.join('') + '</div>';
  },

  error(title, message) {
    return '' +
      '<div class="mwha-error">' +
        '<div class="mwha-error__title">' + title + '</div>' +
        '<div class="mwha-error__message">' + message + '</div>' +
      '</div>';
  },

  loading() {
    return '<div class="mwha-loading">Chargement...</div>';
  },
};


// --- editor.js ---
// ============================================================
// MWHA Weather - Config Editor
// ============================================================

class MWHAWeatherEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
  }

  setConfig(config) {
    this._config = Object.assign({}, MWHA.DEFAULT_CONFIG, config);
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._setupEntityPicker();
  }

  _render() {
    var config = this._config;

    this.shadowRoot.innerHTML = '' +
      '<style>' +
        '.editor { padding: 16px; }' +
        '.editor__section { margin-bottom: 20px; }' +
        '.editor__section-title { font-size: 0.85em; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; margin-bottom: 10px; }' +
        '.editor__row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }' +
        '.editor__label { font-size: 0.95em; }' +
        '.editor__input { width: 100%; padding: 8px 12px; border: 1px solid var(--divider-color, #ccc); border-radius: 8px; background: var(--card-background-color, #fff); color: var(--primary-text-color, #333); font-size: 0.9em; box-sizing: border-box; }' +
        '.editor__select { padding: 8px 12px; border: 1px solid var(--divider-color, #ccc); border-radius: 8px; background: var(--card-background-color, #fff); color: var(--primary-text-color, #333); font-size: 0.9em; }' +
        '.editor__switch { position: relative; width: 42px; height: 24px; flex-shrink: 0; }' +
        '.editor__switch input { opacity: 0; width: 0; height: 0; }' +
        '.editor__switch .slider { position: absolute; cursor: pointer; inset: 0; background: var(--divider-color, #ccc); border-radius: 24px; transition: 0.3s; }' +
        '.editor__switch .slider::before { content: ""; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }' +
        '.editor__switch input:checked + .slider { background: var(--primary-color, #03a9f4); }' +
        '.editor__switch input:checked + .slider::before { transform: translateX(18px); }' +
        '.editor__field { margin-bottom: 12px; }' +
        '.editor__field-label { font-size: 0.85em; opacity: 0.7; margin-bottom: 4px; }' +
        '.editor__info { font-size: 0.8em; opacity: 0.5; margin-top: 4px; }' +
      '</style>' +
      '<div class="editor">' +

        '<div class="editor__section">' +
          '<div class="editor__section-title">Entite meteo</div>' +
          '<div class="editor__field">' +
            '<div class="editor__field-label">Entite weather (creee par l integration MWHA Weather)</div>' +
            '<div id="entity-picker-container"></div>' +
            '<div class="editor__info">L intervalle de mise a jour et la localisation se configurent dans l integration.</div>' +
          '</div>' +
        '</div>' +

        '<div class="editor__section">' +
          '<div class="editor__section-title">Affichage</div>' +
          '<div class="editor__field">' +
            '<div class="editor__field-label">Nom affiche (optionnel, remplace le nom de l entite)</div>' +
            '<input class="editor__input" type="text" id="name" value="' + (config.name || '') + '" placeholder="Ex: Paris">' +
          '</div>' +
          '<div class="editor__row">' +
            '<span class="editor__label">Jours de previsions</span>' +
            '<select class="editor__select" id="forecast_days">' +
              '<option value="1"' + (config.forecast_days === 1 ? ' selected' : '') + '>1</option>' +
              '<option value="2"' + (config.forecast_days === 2 ? ' selected' : '') + '>2</option>' +
              '<option value="3"' + (config.forecast_days === 3 ? ' selected' : '') + '>3</option>' +
              '<option value="4"' + (config.forecast_days === 4 ? ' selected' : '') + '>4</option>' +
              '<option value="5"' + (config.forecast_days === 5 ? ' selected' : '') + '>5</option>' +
            '</select>' +
          '</div>' +
        '</div>' +

        '<div class="editor__section">' +
          '<div class="editor__section-title">Informations a afficher</div>' +
          this._switchRow('show_current', 'Meteo actuelle', config.show_current) +
          this._switchRow('show_forecast', 'Previsions', config.show_forecast) +
          this._switchRow('show_details', 'Details', config.show_details) +
          this._switchRow('show_humidity', 'Humidite', config.show_humidity) +
          this._switchRow('show_pressure', 'Pression', config.show_pressure) +
          this._switchRow('show_wind', 'Vent', config.show_wind) +
          this._switchRow('show_visibility', 'Visibilite', config.show_visibility) +
          this._switchRow('show_feels_like', 'Ressenti', config.show_feels_like) +
        '</div>' +
      '</div>';

    this._setupEntityPicker();
    this._attachEvents();
  }

  _setupEntityPicker() {
    var container = this.shadowRoot.getElementById('entity-picker-container');
    if (!container || !this._hass) return;

    var existing = container.querySelector('ha-entity-picker');
    if (existing) {
      existing.hass = this._hass;
      existing.value = this._config.entity || '';
      return;
    }

    var picker = document.createElement('ha-entity-picker');
    picker.hass = this._hass;
    picker.value = this._config.entity || '';
    picker.includeDomains = ['weather'];
    picker.allowCustomEntity = true;

    var self = this;
    picker.addEventListener('value-changed', function(ev) {
      self._updateConfig('entity', ev.detail.value || '');
    });

    container.innerHTML = '';
    container.appendChild(picker);
  }

  _switchRow(id, label, checked) {
    return '' +
      '<div class="editor__row">' +
        '<span class="editor__label">' + label + '</span>' +
        '<label class="editor__switch">' +
          '<input type="checkbox" id="' + id + '"' + (checked !== false ? ' checked' : '') + '>' +
          '<span class="slider"></span>' +
        '</label>' +
      '</div>';
  }

  _attachEvents() {
    var self = this;
    var shadow = this.shadowRoot;

    var nameEl = shadow.getElementById('name');
    if (nameEl) {
      nameEl.addEventListener('change', function() {
        self._updateConfig('name', nameEl.value || '');
      });
    }

    var forecastEl = shadow.getElementById('forecast_days');
    if (forecastEl) {
      forecastEl.addEventListener('change', function() {
        self._updateConfig('forecast_days', parseInt(forecastEl.value, 10));
      });
    }

    ['show_current', 'show_forecast', 'show_details', 'show_humidity',
     'show_pressure', 'show_wind', 'show_visibility', 'show_feels_like'
    ].forEach(function(id) {
      var el = shadow.getElementById(id);
      if (el) {
        el.addEventListener('change', function() {
          self._updateConfig(id, el.checked);
        });
      }
    });
  }

  _updateConfig(key, value) {
    this._config = Object.assign({}, this._config);
    this._config[key] = value;

    var event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define(MWHA.CARD_EDITOR_NAME, MWHAWeatherEditor);


// --- card.js ---
// ============================================================
// MWHA Weather — Main Card
// ============================================================

class MWHAWeatherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._data = null;
    this._forecast = [];
    this._connected = false;
    this._unsubForecast = null;
    this._subscribedEntity = null;
    this._lastStateJSON = null;
  }

  // -- HA Interface ------------------------------------------

  static getConfigElement() {
    return document.createElement(MWHA.CARD_EDITOR_NAME);
  }

  static getStubConfig() {
    return { entity: '', show_current: true, show_forecast: true, show_details: true };
  }

  setConfig(config) {
    this._config = Object.assign({}, MWHA.DEFAULT_CONFIG, config);
    if (this._hass) {
      this._updateFromEntity();
    }
    this._trySubscribeForecast();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateFromEntity();
    this._trySubscribeForecast();
  }

  getCardSize() {
    return 4;
  }

  // -- Lifecycle ---------------------------------------------

  connectedCallback() {
    this._connected = true;
    this._trySubscribeForecast();
  }

  disconnectedCallback() {
    this._connected = false;
    this._unsubscribeForecast();
  }

  // -- Forecast subscription ---------------------------------

  async _trySubscribeForecast() {
    if (!this._connected || !this._hass || !this._config.entity) return;
    if (this._subscribedEntity === this._config.entity) return;

    this._unsubscribeForecast();

    try {
      this._unsubForecast = await this._hass.connection.subscribeMessage(
        function(msg) {
          this._forecast = msg.forecast || [];
          this._render();
        }.bind(this),
        {
          type: 'weather/subscribe_forecast',
          forecast_type: 'daily',
          entity_id: this._config.entity,
        }
      );
      this._subscribedEntity = this._config.entity;
    } catch (err) {
      console.error('MWHA Weather: forecast subscription error', err);
    }
  }

  _unsubscribeForecast() {
    if (this._unsubForecast) {
      this._unsubForecast();
      this._unsubForecast = null;
    }
    this._subscribedEntity = null;
  }

  // -- Data from HA entity -----------------------------------

  _updateFromEntity() {
    if (!this._hass || !this._config.entity) {
      this._render();
      return;
    }

    var entity = this._hass.states[this._config.entity];
    if (!entity) {
      this._data = null;
      this._render();
      return;
    }

    var stateJSON = JSON.stringify(entity);
    if (stateJSON === this._lastStateJSON) return;
    this._lastStateJSON = stateJSON;

    var attrs = entity.attributes;
    var lang = (this._hass.language || 'fr').slice(0, 2);
    var weatherCode = attrs.mwha_weather_code;
    var isDay = attrs.mwha_is_day !== false;

    var description;
    var icon;
    if (weatherCode != null) {
      description = MWHA.Utils.weatherCodeToDescription(weatherCode, lang);
      icon = MWHA.Utils.weatherCodeToIcon(weatherCode, isDay);
    } else {
      description = MWHA.Utils.conditionToDescription(entity.state, lang);
      icon = MWHA.Utils.conditionToIcon(entity.state, isDay);
    }

    this._data = {
      current: {
        temp: attrs.temperature,
        feels_like: attrs.mwha_feels_like,
        humidity: attrs.humidity,
        pressure: attrs.pressure,
        visibility: attrs.mwha_visibility_m,
        wind_speed: attrs.wind_speed,
        wind_deg: attrs.wind_bearing,
        description: description,
        icon: icon,
        name: this._config.name || attrs.friendly_name || '',
      },
      units: {
        temp: attrs.temperature_unit || '\u00b0C',
        speed: attrs.wind_speed_unit || 'km/h',
        pressure: attrs.pressure_unit || 'hPa',
      },
    };

    this._render();
  }

  // -- Render ------------------------------------------------

  _render() {
    if (!this._config.entity) {
      this.shadowRoot.innerHTML = MWHA.Styles.getAll() +
        '<ha-card>' +
        '<div class="mwha-error">' +
        '<div class="mwha-error__title">Configuration requise</div>' +
        '<div class="mwha-error__message">Selectionnez une entite meteo dans la configuration de la carte.</div>' +
        '</div>' +
        '</ha-card>';
      return;
    }

    if (!this._data) {
      this.shadowRoot.innerHTML = MWHA.Styles.getAll() +
        '<ha-card>' +
        '<div class="mwha-loading">Chargement...</div>' +
        '</ha-card>';
      return;
    }

    var parts = [MWHA.Styles.getAll(), '<ha-card>'];
    var cityName = this._config.name || this._data.current.name || '';

    if (cityName) {
      parts.push(
        '<div class="mwha-header">' +
        '<span class="mwha-header__name">' + cityName + '</span>' +
        '</div>'
      );
    }

    var units = this._data.units;

    if (this._config.show_current !== false) {
      parts.push(MWHA.Templates.current(this._data.current, this._config, units));
    }

    if (this._config.show_details !== false) {
      parts.push(MWHA.Templates.details(this._data.current, this._config, units));
    }

    if (this._config.show_forecast !== false && this._forecast.length > 0) {
      var lang = (this._hass && this._hass.language) ? this._hass.language : 'fr';
      parts.push(MWHA.Templates.forecast(this._forecast, this._config, lang));
    }

    parts.push('</ha-card>');
    this.shadowRoot.innerHTML = parts.join('');
  }
}

// -- Registration --------------------------------------------

customElements.define(MWHA.CARD_NAME, MWHAWeatherCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: MWHA.CARD_NAME,
  name: 'MWHA Weather',
  description: 'Extension meteo basee sur Open-Meteo',
  preview: false,
  documentationURL: 'https://github.com/jsmusic-dev/mw-ha-weather',
});

console.info(
  '%c MWHA Weather %c v' + MWHA.CARD_VERSION + ' ',
  'background: #1976d2; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'background: #333; color: white; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);


})();
