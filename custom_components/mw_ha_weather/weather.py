"""Weather entity for MWHA Weather."""

from homeassistant.components.weather import (
    Forecast,
    WeatherEntity,
    WeatherEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfPressure, UnitOfSpeed, UnitOfTemperature
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_LOCATION_NAME, DOMAIN
from .coordinator import MWHAWeatherCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up MWHA Weather entity from a config entry."""
    coordinator: MWHAWeatherCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([MWHAWeatherEntity(coordinator, entry)])


class MWHAWeatherEntity(CoordinatorEntity[MWHAWeatherCoordinator], WeatherEntity):
    """Representation of MWHA Weather conditions."""

    _attr_has_entity_name = True
    _attr_native_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_native_wind_speed_unit = UnitOfSpeed.KILOMETERS_PER_HOUR
    _attr_native_pressure_unit = UnitOfPressure.HPA

    def __init__(
        self, coordinator: MWHAWeatherCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize."""
        super().__init__(coordinator)
        self._entry = entry
        location = entry.data.get(CONF_LOCATION_NAME, "MWHA")
        self._attr_unique_id = f"{entry.entry_id}_weather"
        self._attr_name = None
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=f"MWHA Weather {location}",
            manufacturer="MWHA Weather",
            model="Open-Meteo",
        )

    @property
    def condition(self) -> str | None:
        """Return the current condition."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data["current"].get("condition")

    @property
    def native_temperature(self) -> float | None:
        """Return the temperature."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data["current"].get("temperature")

    @property
    def native_humidity(self) -> int | None:
        """Return the humidity."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data["current"].get("humidity")

    @property
    def native_pressure(self) -> float | None:
        """Return the pressure."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data["current"].get("pressure")

    @property
    def native_wind_speed(self) -> float | None:
        """Return the wind speed."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data["current"].get("wind_speed")

    @property
    def wind_bearing(self) -> float | None:
        """Return the wind bearing."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data["current"].get("wind_bearing")

    @property
    def native_visibility(self) -> float | None:
        """Return the visibility in km."""
        if not self.coordinator.data:
            return None
        vis = self.coordinator.data["current"].get("visibility")
        if vis is not None:
            return vis / 1000  # m -> km
        return None

    @property
    def extra_state_attributes(self) -> dict[str, str | int | bool | None]:
        """Expose raw API values for easier debugging in Home Assistant."""
        if not self.coordinator.data:
            return {}

        current = self.coordinator.data["current"]
        return {
            "mwha_weather_code": current.get("weather_code"),
            "mwha_is_day": current.get("is_day"),
            "mwha_description": current.get("description"),
            "mwha_condition": current.get("condition"),
        }

    @property
    def supported_features(self) -> WeatherEntityFeature:
        """Return supported features."""
        return (
            WeatherEntityFeature.FORECAST_DAILY
            | WeatherEntityFeature.FORECAST_HOURLY
        )

    async def async_forecast_daily(self) -> list[Forecast]:
        """Return the daily forecast."""
        if not self.coordinator.data:
            return []

        forecasts = []
        for day in self.coordinator.data.get("forecast", []):
            forecasts.append(
                Forecast(
                    datetime=day["datetime"],
                    condition=day["condition"],
                    native_temperature=day["native_temperature"],
                    native_templow=day["native_templow"],
                )
            )
        return forecasts

    async def async_forecast_hourly(self) -> list[Forecast]:
        """Return the hourly forecast."""
        if not self.coordinator.data:
            return []

        forecasts = []
        for hour in self.coordinator.data.get("forecast_hourly", []):
            forecasts.append(
                Forecast(
                    datetime=hour["datetime"],
                    condition=hour["condition"],
                    native_temperature=hour["native_temperature"],
                )
            )
        return forecasts

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self.async_write_ha_state()
        self.hass.async_create_task(self.async_update_listeners())
