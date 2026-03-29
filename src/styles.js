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
