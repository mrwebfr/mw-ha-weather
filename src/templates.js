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
