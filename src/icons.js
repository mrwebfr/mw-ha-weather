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
