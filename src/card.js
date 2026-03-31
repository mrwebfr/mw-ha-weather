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
