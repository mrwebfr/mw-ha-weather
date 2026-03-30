"""Constants for MWHA Weather integration."""

import logging

DOMAIN = "mw_ha_weather"
LOGGER = logging.getLogger(__package__)

API_BASE_FORECAST = "https://api.open-meteo.com/v1/forecast"

CONF_LOCATION_NAME = "location_name"
CONF_LATITUDE = "latitude"
CONF_LONGITUDE = "longitude"
CONF_UPDATE_INTERVAL = "update_interval"
CONF_HISTORY_DAYS = "history_days"

DEFAULT_UPDATE_INTERVAL = 15  # minutes
DEFAULT_HISTORY_DAYS = 14

# Mapping Open-Meteo WMO codes -> HA condition strings
CONDITION_MAP = {
    0: "sunny",
    1: "sunny",
    2: "partlycloudy",
    3: "cloudy",
    45: "fog",
    48: "fog",
    51: "rainy",
    53: "rainy",
    55: "rainy",
    56: "snowy-rainy",
    57: "snowy-rainy",
    61: "rainy",
    63: "rainy",
    65: "pouring",
    66: "snowy-rainy",
    67: "snowy-rainy",
    71: "snowy",
    73: "snowy",
    75: "snowy",
    77: "snowy",
    80: "rainy",
    81: "rainy",
    82: "pouring",
    85: "snowy",
    86: "snowy",
    95: "lightning",
    96: "lightning-rainy",
    99: "lightning-rainy",
}
