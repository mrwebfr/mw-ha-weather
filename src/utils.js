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
