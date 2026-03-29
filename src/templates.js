// ============================================================
// MWHA Weather - HTML Templates
// ============================================================

MWHA.Templates = {
  current(data, config) {
    var units = config.units || 'metric';
    return '' +
      '<div class="mwha-current">' +
        '<div class="mwha-current__icon">' + MWHA.Icons.get(data.icon) + '</div>' +
        '<div class="mwha-current__info">' +
          '<div class="mwha-current__temp">' + MWHA.Utils.formatTemp(data.temp, units) + '</div>' +
          '<div class="mwha-current__desc">' + data.description + '</div>' +
          (config.show_feels_like !== false
            ? '<div class="mwha-current__feels">Ressenti ' + MWHA.Utils.formatTemp(data.feels_like, units) + '</div>'
            : '') +
        '</div>' +
      '</div>';
  },

  details(data, config) {
    var items = [];

    if (config.show_humidity !== false) {
      items.push(this._detailItem('humidity', MWHA.Utils.formatPercent(data.humidity), 'Humidite'));
    }
    if (config.show_wind !== false) {
      var windText = MWHA.Utils.formatSpeed(data.wind_speed, config.units);
      var dir = MWHA.Utils.windDirection(data.wind_deg);
      items.push(this._detailItem('wind', windText + (dir ? ' ' + dir : ''), 'Vent'));
    }
    if (config.show_pressure !== false) {
      items.push(this._detailItem('pressure', MWHA.Utils.formatPressure(data.pressure), 'Pression'));
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

  forecast(forecastData, config) {
    if (!forecastData || forecastData.length === 0) return '';

    var days = forecastData.slice(1, (config.forecast_days || 5) + 1);
    var units = config.units || 'metric';
    var lang = config.language || 'fr';

    var items = days.map(function(day) {
      return '' +
        '<div class="mwha-forecast__day">' +
          '<div class="mwha-forecast__day-name">' + MWHA.Utils.formatDayName(day.dt, lang) + '</div>' +
          '<div class="mwha-forecast__icon">' + MWHA.Icons.get(day.icon) + '</div>' +
          '<div class="mwha-forecast__temp-high">' + MWHA.Utils.formatTemp(day.temp_max, units) + '</div>' +
          '<div class="mwha-forecast__temp-low">' + MWHA.Utils.formatTemp(day.temp_min, units) + '</div>' +
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
