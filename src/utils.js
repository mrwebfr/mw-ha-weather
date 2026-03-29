// ============================================================
// MWHA Weather - Utilities
// ============================================================

MWHA.Utils = {
  formatTemp(value, units) {
    if (value == null) return '--';
    const label = MWHA.UNITS_LABELS[units || 'metric'];
    return Math.round(value) + label.temp;
  },

  formatSpeed(value, units) {
    if (value == null) return '--';
    const label = MWHA.UNITS_LABELS[units || 'metric'];
    return Math.round(value) + ' ' + label.speed;
  },

  formatPressure(value) {
    if (value == null) return '--';
    return value + ' hPa';
  },

  formatPercent(value) {
    if (value == null) return '--';
    return value + '%';
  },

  formatVisibility(value) {
    if (value == null) return '--';
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + ' km';
    }
    return value + ' m';
  },

  formatDayName(timestamp, lang) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(lang || 'fr', { weekday: 'short' });
  },

  windDirection(degrees) {
    if (degrees == null) return '';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  },
};
