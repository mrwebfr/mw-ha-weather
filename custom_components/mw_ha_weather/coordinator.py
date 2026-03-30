"""DataUpdateCoordinator for MWHA Weather."""

from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import aiohttp

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)

from .const import (
    API_BASE_FORECAST,
    CONDITION_MAP,
    CONF_UPDATE_INTERVAL,
    DEFAULT_UPDATE_INTERVAL,
    DOMAIN,
    LOGGER,
)


class MWHAWeatherCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator to fetch weather data from Open-Meteo."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize coordinator."""
        self.entry = entry
        self.latitude = entry.data.get(CONF_LATITUDE, hass.config.latitude)
        self.longitude = entry.data.get(CONF_LONGITUDE, hass.config.longitude)

        update_interval = entry.options.get(
            CONF_UPDATE_INTERVAL,
            entry.data.get(CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL),
        )

        super().__init__(
            hass,
            LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=update_interval),
        )

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from Open-Meteo API."""
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "timezone": "auto",
            "current": ",".join(
                [
                    "temperature_2m",
                    "apparent_temperature",
                    "relative_humidity_2m",
                    "pressure_msl",
                    "wind_speed_10m",
                    "wind_direction_10m",
                    "weather_code",
                    "is_day",
                ]
            ),
            "hourly": ",".join(
                [
                    "temperature_2m",
                    "weather_code",
                    "is_day",
                    "visibility",
                ]
            ),
            "daily": ",".join(
                [
                    "weather_code",
                    "temperature_2m_max",
                    "temperature_2m_min",
                ]
            ),
            "forecast_days": 7,
        }

        try:
            async with aiohttp.ClientSession() as session:
                data = await self._fetch(session, API_BASE_FORECAST, params)
        except aiohttp.ClientError as err:
            raise UpdateFailed(f"Erreur de connexion a Open-Meteo: {err}") from err

        return {
            "current": self._parse_current(data),
            "forecast": self._parse_forecast(data.get("daily", {})),
            "forecast_hourly": self._parse_hourly_forecast(
                data.get("hourly", {}),
                data.get("current", {}).get("time"),
            ),
        }

    async def _fetch(
        self, session: aiohttp.ClientSession, url: str, params: dict
    ) -> dict:
        """Fetch a single API endpoint."""
        async with session.get(
            url, params=params, timeout=aiohttp.ClientTimeout(total=15)
        ) as resp:
            if resp.status == 429:
                raise UpdateFailed("Limite Open-Meteo atteinte")
            if resp.status != 200:
                raise UpdateFailed(f"Erreur API Open-Meteo ({resp.status})")
            return await resp.json()

    def _parse_current(self, data: dict) -> dict[str, Any]:
        """Parse current weather response."""
        current = data.get("current", {})
        weather_code = current.get("weather_code", -1)
        is_day = current.get("is_day", 1) == 1

        return {
            "condition": self._map_condition(weather_code, is_day),
            "temperature": current.get("temperature_2m"),
            "feels_like": current.get("apparent_temperature"),
            "humidity": current.get("relative_humidity_2m"),
            "pressure": current.get("pressure_msl"),
            "wind_speed": current.get("wind_speed_10m"),
            "wind_bearing": current.get("wind_direction_10m"),
            "visibility": self._extract_visibility(data),
            "description": str(weather_code),
            "weather_code": weather_code,
            "is_day": is_day,
        }

    def _parse_forecast(self, data: dict) -> list[dict[str, Any]]:
        """Parse daily forecast response."""
        times = data.get("time", [])
        codes = data.get("weather_code", [])
        highs = data.get("temperature_2m_max", [])
        lows = data.get("temperature_2m_min", [])

        result = []
        for index, day in enumerate(times):
            code = codes[index] if index < len(codes) else -1
            temp_max = highs[index] if index < len(highs) else None
            temp_min = lows[index] if index < len(lows) else None

            result.append(
                {
                    "datetime": self._to_utc_isoformat(day),
                    "condition": CONDITION_MAP.get(code, "exceptional"),
                    "native_temperature": round(temp_max, 1)
                    if temp_max is not None
                    else None,
                    "native_templow": round(temp_min, 1)
                    if temp_min is not None
                    else None,
                }
            )

        return result

    def _parse_hourly_forecast(
        self,
        data: dict,
        current_time: str | None,
    ) -> list[dict[str, Any]]:
        """Parse hourly forecast response."""
        times = data.get("time", [])
        codes = data.get("weather_code", [])
        temperatures = data.get("temperature_2m", [])
        is_day_values = data.get("is_day", [])
        start_index = self._find_hourly_start_index(times, current_time)

        result = []
        for index in range(start_index, min(start_index + 24, len(times))):
            hour = times[index]
            code = codes[index] if index < len(codes) else -1
            temperature = temperatures[index] if index < len(temperatures) else None
            is_day = is_day_values[index] == 1 if index < len(is_day_values) else True

            result.append(
                {
                    "datetime": self._to_utc_isoformat(hour),
                    "condition": self._map_condition(code, is_day),
                    "native_temperature": round(temperature, 1)
                    if temperature is not None
                    else None,
                }
            )

        return result

    @staticmethod
    def _find_hourly_start_index(
        times: list[str],
        current_time: str | None,
    ) -> int:
        """Return the first hourly forecast index at or after the current time."""
        if not times or not current_time:
            return 0

        if current_time in times:
            return times.index(current_time)

        for index, value in enumerate(times):
            if value >= current_time:
                return index

        return 0

    @staticmethod
    def _map_condition(weather_code: int, is_day: bool) -> str:
        """Map Open-Meteo WMO code to a Home Assistant condition."""
        if not is_day and weather_code in (0, 1):
            return "clear-night"
        return CONDITION_MAP.get(weather_code, "exceptional")

    @staticmethod
    def _extract_visibility(data: dict) -> float | None:
        """Match current timestamp with hourly visibility."""
        current = data.get("current", {})
        hourly = data.get("hourly", {})
        current_time = current.get("time")
        hourly_times = hourly.get("time", [])
        hourly_visibility = hourly.get("visibility", [])

        if current_time not in hourly_times:
            return None

        index = hourly_times.index(current_time)
        if index >= len(hourly_visibility):
            return None
        return hourly_visibility[index]

    def _to_utc_isoformat(self, value: str) -> str:
        """Convert Open-Meteo local datetime string to UTC RFC3339."""
        timezone_name = getattr(self.hass.config, "time_zone", None) or "UTC"
        local_dt = datetime.fromisoformat(value)
        aware_dt = local_dt.replace(tzinfo=ZoneInfo(timezone_name))
        return aware_dt.astimezone(ZoneInfo("UTC")).isoformat()
