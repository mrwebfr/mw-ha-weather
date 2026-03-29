# MWHA Weather

Custom Home Assistant weather integration and Lovelace card using the free Open-Meteo API.

## Features

- Current weather conditions (temperature, humidity, wind, pressure, visibility)
- 5-day daily forecast in the custom card
- Hourly and daily forecasts in the Home Assistant weather entity
- A dedicated Home Assistant historical trend sensor based on a configurable history window recorded in HA
- Individual sensor entities for each metric
- Configurable update interval
- French and English translations
- No API key required

## Installation

### HACS

1. Open HACS in Home Assistant
2. Go to **Integrations**
3. Click the three dots menu > **Custom repositories**
4. Add `https://github.com/mrwebfr/mw-ha-weather` with type **Integration**
5. Install **MWHA Weather**
6. Restart Home Assistant

### Configuration

1. Go to **Settings > Devices & Services**
2. Click **Add Integration**
3. Search for **MWHA Weather**
4. Enter your location or leave latitude/longitude empty to use the Home Assistant location
5. Later, use **Options** on the integration to adjust `update_interval` and `history_days`

## Entities

| Entity | Type | Description |
|--------|------|-------------|
| `weather.mwha_*` | Weather | Current conditions + daily and hourly forecasts |
| `sensor.mwha_*_temperature` | Sensor | Temperature |
| `sensor.mwha_*_feels_like` | Sensor | Feels like temperature |
| `sensor.mwha_*_humidity` | Sensor | Humidity |
| `sensor.mwha_*_pressure` | Sensor | Atmospheric pressure |
| `sensor.mwha_*_wind_speed` | Sensor | Wind speed |
| `sensor.mwha_*_visibility` | Sensor | Visibility |
| `sensor.mwha_*_trend` | Sensor | Historical weather interpretation based on configurable HA history |

## Open-Meteo

This project uses the public `https://api.open-meteo.com/v1/forecast` endpoint.
For personal use, no token, account, or dashboard is required.
