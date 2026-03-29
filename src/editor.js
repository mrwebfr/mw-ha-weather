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
      '</style>' +
      '<div class="editor">' +

        '<div class="editor__section">' +
          '<div class="editor__section-title">API Open-Meteo</div>' +
          '<div class="editor__field-label">Aucune cle API n est requise pour l usage gratuit.</div>' +
        '</div>' +

        '<div class="editor__section">' +
          '<div class="editor__section-title">Localisation</div>' +
          '<div class="editor__field">' +
            '<div class="editor__field-label">Nom de la ville (optionnel)</div>' +
            '<input class="editor__input" type="text" id="name" value="' + (config.name || '') + '" placeholder="Ex: Paris">' +
          '</div>' +
          '<div class="editor__field">' +
            '<div class="editor__field-label">Latitude (vide = localisation HA)</div>' +
            '<input class="editor__input" type="text" id="latitude" value="' + (config.latitude || '') + '" placeholder="Ex: 48.8566">' +
          '</div>' +
          '<div class="editor__field">' +
            '<div class="editor__field-label">Longitude (vide = localisation HA)</div>' +
            '<input class="editor__input" type="text" id="longitude" value="' + (config.longitude || '') + '" placeholder="Ex: 2.3522">' +
          '</div>' +
        '</div>' +

        '<div class="editor__section">' +
          '<div class="editor__section-title">Options</div>' +
          '<div class="editor__row">' +
            '<span class="editor__label">Unites</span>' +
            '<select class="editor__select" id="units">' +
              '<option value="metric"' + (config.units === 'metric' ? ' selected' : '') + '>Metrique (C, km/h)</option>' +
              '<option value="imperial"' + (config.units === 'imperial' ? ' selected' : '') + '>Imperial (F, mph)</option>' +
              '<option value="standard"' + (config.units === 'standard' ? ' selected' : '') + '>Standard (K, m/s)</option>' +
            '</select>' +
          '</div>' +
          '<div class="editor__row">' +
            '<span class="editor__label">Rafraichissement</span>' +
            '<select class="editor__select" id="refresh_interval">' +
              '<option value="5"' + (config.refresh_interval === 5 ? ' selected' : '') + '>5 min</option>' +
              '<option value="10"' + (config.refresh_interval === 10 ? ' selected' : '') + '>10 min</option>' +
              '<option value="15"' + (config.refresh_interval === 15 ? ' selected' : '') + '>15 min</option>' +
              '<option value="30"' + (config.refresh_interval === 30 ? ' selected' : '') + '>30 min</option>' +
            '</select>' +
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

    this._attachEvents();
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

    ['name', 'latitude', 'longitude'].forEach(function(id) {
      var el = shadow.getElementById(id);
      if (el) {
        el.addEventListener('change', function() {
          self._updateConfig(id, el.value || '');
        });
      }
    });

    ['units'].forEach(function(id) {
      var el = shadow.getElementById(id);
      if (el) {
        el.addEventListener('change', function() {
          self._updateConfig(id, el.value);
        });
      }
    });

    ['refresh_interval', 'forecast_days'].forEach(function(id) {
      var el = shadow.getElementById(id);
      if (el) {
        el.addEventListener('change', function() {
          self._updateConfig(id, parseInt(el.value, 10));
        });
      }
    });

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

    if (key === 'latitude' || key === 'longitude') {
      this._config[key] = value ? parseFloat(value) : null;
    } else {
      this._config[key] = value;
    }

    var event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define(MWHA.CARD_EDITOR_NAME, MWHAWeatherEditor);
