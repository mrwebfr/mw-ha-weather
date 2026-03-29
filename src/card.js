// ============================================================
// MWHA Weather â€” Main Card
// ============================================================

class MWHAWeatherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._data = null;
    this._refreshTimer = null;
    this._lastFetch = 0;
  }

  // -- HA Interface ------------------------------------------

  static getConfigElement() {
    return document.createElement(MWHA.CARD_EDITOR_NAME);
  }

  static getStubConfig() {
    return {
      show_current: true,
      show_forecast: true,
      show_details: true,
    };
  }

  setConfig(config) {
    this._config = Object.assign({}, MWHA.DEFAULT_CONFIG, config);
    if (this.shadowRoot) {
      this._render();
    }
  }

  set hass(hass) {
    const prevHass = this._hass;
    this._hass = hass;

    if (this._config.latitude == null && hass.config) {
      this._config.latitude = hass.config.latitude;
      this._config.longitude = hass.config.longitude;
    }

    if (!this._config.language && hass.language) {
      this._config.language = hass.language;
    }

    if (!prevHass) {
      this._fetchWeather();
    }
  }

  getCardSize() {
    return 4;
  }

  // -- Lifecycle ---------------------------------------------

  connectedCallback() {
    this._fetchWeather();
    this._startRefreshTimer();
  }

  disconnectedCallback() {
    this._stopRefreshTimer();
  }

  // -- Timer -------------------------------------------------

  _startRefreshTimer() {
    this._stopRefreshTimer();
    const interval = (this._config.refresh_interval || 10) * 60 * 1000;
    this._refreshTimer = setInterval(() => this._fetchWeather(), interval);
  }

  _stopRefreshTimer() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  // -- Data --------------------------------------------------

  async _fetchWeather() {
    if (this._config.latitude == null || this._config.longitude == null) {
      this._render();
      return;
    }

    const now = Date.now();
    const cacheMs = (this._config.refresh_interval || 10) * 60 * 1000;
    if (this._data && (now - this._lastFetch) < cacheMs) {
      return;
    }

    try {
      this._data = await MWHA.Api.fetch(
        this._config.latitude,
        this._config.longitude,
        this._config.units || 'metric',
        this._config.language || 'fr'
      );
      this._lastFetch = now;
      this._render();
    } catch (err) {
      console.error('MWHA Weather:', err);
      this._renderError(err.message);
    }
  }

  // -- Render ------------------------------------------------

  _render() {
    if (this._config.latitude == null || this._config.longitude == null) {
      this.shadowRoot.innerHTML = MWHA.Styles.getAll() +
        '<ha-card>' +
        '<div class="mwha-error">' +
        '<div class="mwha-error__title">Configuration requise</div>' +
        '<div class="mwha-error__message">Ajoutez une latitude et une longitude ou utilisez la localisation Home Assistant.</div>' +
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

    const parts = [MWHA.Styles.getAll(), '<ha-card>'];
    const cityName = this._config.name || this._data.current.name || '';

    if (cityName) {
      parts.push(
        '<div class="mwha-header">' +
        '<span class="mwha-header__name">' + cityName + '</span>' +
        '</div>'
      );
    }

    if (this._config.show_current !== false) {
      parts.push(MWHA.Templates.current(this._data.current, this._config));
    }

    if (this._config.show_details !== false) {
      parts.push(MWHA.Templates.details(this._data.current, this._config));
    }

    if (this._config.show_forecast !== false) {
      parts.push(MWHA.Templates.forecast(this._data.forecast, this._config));
    }

    parts.push('</ha-card>');
    this.shadowRoot.innerHTML = parts.join('');
  }

  _renderError(message) {
    this.shadowRoot.innerHTML = MWHA.Styles.getAll() +
      '<ha-card>' +
      '<div class="mwha-error">' +
      '<div class="mwha-error__title">Erreur</div>' +
      '<div class="mwha-error__message">' + message + '</div>' +
      '</div>' +
      '</ha-card>';
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
