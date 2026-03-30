// ============================================================
// MWHA Weather - API Client
// ============================================================

MWHA.Api = {
  _cache: new Map(),

  async fetch(lat, lon, units, lang) {
    const cacheKey = [lat, lon, units || 'metric', lang || 'fr'].join(',');
    const cached = this._cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < 5 * 60 * 1000) {
      return cached.data;
    }

    const unitParams = this._getUnitParams(units);
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      timezone: 'auto',
      forecast_days: '14',
      current: [
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'pressure_msl',
        'visibility',
        'wind_speed_10m',
        'wind_direction_10m',
        'weather_code',
        'is_day',
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'pressure_msl',
        'wind_speed_10m',
        'visibility',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
      ].join(','),
      temperature_unit: unitParams.temperature_unit,
      wind_speed_unit: unitParams.wind_speed_unit,
    });

    const response = await fetch(MWHA.API_BASE_FORECAST + '?' + params.toString());

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Limite d appels API depassee. Reessayez plus tard.');
      }
      throw new Error('Erreur API (' + response.status + ')');
    }

    const data = await response.json();
    const current = data.current || {};
    const currentCode = current.weather_code;
    const isDay = current.is_day !== 0;

    const result = {
      current: {
        temp: this._normalizeTemperature(current.temperature_2m, units),
        feels_like: this._normalizeTemperature(current.apparent_temperature, units),
        humidity: current.relative_humidity_2m,
        pressure: current.pressure_msl,
        visibility: current.visibility != null
          ? current.visibility
          : this._findCurrentVisibility(data),
        wind_speed: current.wind_speed_10m,
        wind_deg: current.wind_direction_10m,
        description: this._getWeatherDescription(currentCode, lang),
        icon: this._getIconCode(currentCode, isDay),
        name: '',
      },
      forecast: this._parseDailyForecast(data.daily, lang, units),
      trend: this._parseTrendData(data.hourly, units),
    };

    this._cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  },

  _getUnitParams(units) {
    if (units === 'imperial') {
      return { temperature_unit: 'fahrenheit', wind_speed_unit: 'mph' };
    }
    if (units === 'standard') {
      return { temperature_unit: 'celsius', wind_speed_unit: 'ms' };
    }
    return { temperature_unit: 'celsius', wind_speed_unit: 'kmh' };
  },

  _findCurrentVisibility(data) {
    if (!data || !data.current || !data.current.time) return null;

    const hourly = data.hourly || {};
    if (!hourly.time || !hourly.visibility) return null;

    const index = hourly.time.indexOf(data.current.time);
    return index === -1 ? null : hourly.visibility[index];
  },

  _parseDailyForecast(dailyData, lang, units) {
    if (!dailyData || !dailyData.time) return [];

    return dailyData.time.map((date, index) => {
      const code = dailyData.weather_code ? dailyData.weather_code[index] : 3;

      return {
        dt: Math.floor(new Date(date + 'T12:00:00').getTime() / 1000),
        temp_min: dailyData.temperature_2m_min
          ? this._normalizeTemperature(dailyData.temperature_2m_min[index], units)
          : null,
        temp_max: dailyData.temperature_2m_max
          ? this._normalizeTemperature(dailyData.temperature_2m_max[index], units)
          : null,
        icon: this._getIconCode(code, true),
        description: this._getWeatherDescription(code, lang),
      };
    });
  },

  _parseTrendData(hourlyData, units) {
    if (!hourlyData || !hourlyData.time) return null;

    return {
      hourly: hourlyData.time.map((time, index) => {
        return {
          time: time,
          temp: hourlyData.temperature_2m
            ? this._normalizeTemperature(hourlyData.temperature_2m[index], units)
            : null,
          humidity: hourlyData.relative_humidity_2m
            ? hourlyData.relative_humidity_2m[index]
            : null,
          pressure: hourlyData.pressure_msl ? hourlyData.pressure_msl[index] : null,
          wind_speed: hourlyData.wind_speed_10m ? hourlyData.wind_speed_10m[index] : null,
          visibility: hourlyData.visibility ? hourlyData.visibility[index] : null,
        };
      }),
    };
  },

  _normalizeTemperature(value, units) {
    if (value == null) return null;
    return units === 'standard' ? value + 273.15 : value;
  },

  _getIconCode(code, isDay) {
    const suffix = isDay ? 'd' : 'n';

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

  _getWeatherDescription(code, lang) {
    const locale = (lang || 'fr').toLowerCase().slice(0, 2);
    const descriptions = locale === 'fr' ? {
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

  clearCache() {
    this._cache.clear();
  },
};
