"""Sensor entities for MWHA Weather."""

from collections import defaultdict
from collections.abc import Mapping
from datetime import timedelta
from statistics import mean
from typing import Any

from homeassistant.components.recorder import get_instance, history
from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    PERCENTAGE,
    UnitOfPressure,
    UnitOfSpeed,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant, State, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from .const import CONF_LOCATION_NAME, DOMAIN
from .const import CONF_HISTORY_DAYS, DEFAULT_HISTORY_DAYS
from .coordinator import MWHAWeatherCoordinator

SENSOR_TYPES: dict[str, dict] = {
    "temperature": {
        "name": "Temperature",
        "key": "temperature",
        "device_class": SensorDeviceClass.TEMPERATURE,
        "state_class": SensorStateClass.MEASUREMENT,
        "unit": UnitOfTemperature.CELSIUS,
        "icon": None,
    },
    "feels_like": {
        "name": "Ressenti",
        "key": "feels_like",
        "device_class": SensorDeviceClass.TEMPERATURE,
        "state_class": SensorStateClass.MEASUREMENT,
        "unit": UnitOfTemperature.CELSIUS,
        "icon": "mdi:thermometer-lines",
    },
    "humidity": {
        "name": "Humidite",
        "key": "humidity",
        "device_class": SensorDeviceClass.HUMIDITY,
        "state_class": SensorStateClass.MEASUREMENT,
        "unit": PERCENTAGE,
        "icon": None,
    },
    "pressure": {
        "name": "Pression",
        "key": "pressure",
        "device_class": SensorDeviceClass.PRESSURE,
        "state_class": SensorStateClass.MEASUREMENT,
        "unit": UnitOfPressure.HPA,
        "icon": None,
    },
    "wind_speed": {
        "name": "Vent",
        "key": "wind_speed",
        "device_class": SensorDeviceClass.WIND_SPEED,
        "state_class": SensorStateClass.MEASUREMENT,
        "unit": UnitOfSpeed.KILOMETERS_PER_HOUR,
        "icon": None,
    },
    "visibility": {
        "name": "Visibilite",
        "key": "visibility",
        "device_class": SensorDeviceClass.DISTANCE,
        "state_class": SensorStateClass.MEASUREMENT,
        "unit": "m",
        "icon": "mdi:eye",
    },
}

TREND_SOURCE_SUFFIXES = {
    "temperature": "temperature",
    "humidity": "humidity",
    "pressure": "pressure",
    "wind_speed": "wind_speed",
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up MWHA Weather sensor entities from a config entry."""
    coordinator: MWHAWeatherCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities = [
        MWHAWeatherSensor(coordinator, entry, sensor_type)
        for sensor_type in SENSOR_TYPES
    ]
    entities.append(MWHAWeatherTrendSensor(coordinator, entry))
    async_add_entities(entities)


class MWHAWeatherSensor(
    CoordinatorEntity[MWHAWeatherCoordinator], SensorEntity
):
    """Representation of a MWHA Weather sensor."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: MWHAWeatherCoordinator,
        entry: ConfigEntry,
        sensor_type: str,
    ) -> None:
        """Initialize."""
        super().__init__(coordinator)
        self._entry = entry
        self._sensor_type = sensor_type
        self._sensor_config = SENSOR_TYPES[sensor_type]

        location = entry.data.get(CONF_LOCATION_NAME, "MWHA")
        self._attr_unique_id = f"{entry.entry_id}_{sensor_type}"
        self._attr_name = self._sensor_config["name"]
        self._attr_device_class = self._sensor_config.get("device_class")
        self._attr_state_class = self._sensor_config.get("state_class")
        self._attr_native_unit_of_measurement = self._sensor_config.get("unit")
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=f"MWHA Weather {location}",
            manufacturer="MWHA Weather",
            model="Open-Meteo",
        )

        if self._sensor_config.get("icon"):
            self._attr_icon = self._sensor_config["icon"]

    @property
    def native_value(self):
        """Return the sensor value."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data["current"].get(self._sensor_config["key"])

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self.async_write_ha_state()


class MWHAWeatherTrendSensor(
    CoordinatorEntity[MWHAWeatherCoordinator], SensorEntity
):
    """Trend analysis based on Home Assistant historical data."""

    _attr_has_entity_name = True
    _attr_name = "Tendance meteo"
    _attr_icon = "mdi:chart-timeline-variant"

    def __init__(
        self,
        coordinator: MWHAWeatherCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the trend sensor."""
        super().__init__(coordinator)
        self._entry = entry
        self._trend: dict[str, Any] = {
            "state": "indisponible",
            "situation": "Analyse historique indisponible",
            "confidence": "faible",
            "interpretation": "Historique insuffisant pour etablir une tendance.",
            "signals": {},
        }
        self._source_entity_ids: dict[str, str] = {}
        self._history_days = entry.options.get(
            CONF_HISTORY_DAYS,
            entry.data.get(CONF_HISTORY_DAYS, DEFAULT_HISTORY_DAYS),
        )

        location = entry.data.get(CONF_LOCATION_NAME, "MWHA")
        self._attr_unique_id = f"{entry.entry_id}_trend"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=f"MWHA Weather {location}",
            manufacturer="MWHA Weather",
            model="Open-Meteo",
        )

    async def async_added_to_hass(self) -> None:
        """Resolve source entities and compute the first trend."""
        await super().async_added_to_hass()
        self._resolve_source_entity_ids()
        await self._async_refresh_trend()

    @property
    def native_value(self):
        """Return the interpreted trend state."""
        return self._trend.get("interpretation")

    @property
    def extra_state_attributes(self) -> Mapping[str, Any]:
        """Return supporting details for the computed trend."""
        return {
            "situation": self._trend.get("situation"),
            "confidence": self._trend.get("confidence"),
            "history_window_days": self._history_days,
            "source": "home_assistant_history",
            **self._trend.get("signals", {}),
        }

    @callback
    def _handle_coordinator_update(self) -> None:
        """Refresh the historical trend when the coordinator updates."""
        super()._handle_coordinator_update()
        self.hass.async_create_task(self._async_refresh_trend())

    def _resolve_source_entity_ids(self) -> None:
        """Resolve sibling entity_ids from the entity registry."""
        registry = er.async_get(self.hass)
        resolved: dict[str, str] = {}

        for key, suffix in TREND_SOURCE_SUFFIXES.items():
            entity_id = registry.async_get_entity_id(
                "sensor",
                DOMAIN,
                f"{self._entry.entry_id}_{suffix}",
            )
            if entity_id:
                resolved[key] = entity_id

        self._source_entity_ids = resolved

    def _refresh_configured_history_days(self) -> None:
        """Refresh history window from config entry data/options."""
        self._history_days = self._entry.options.get(
            CONF_HISTORY_DAYS,
            self._entry.data.get(CONF_HISTORY_DAYS, DEFAULT_HISTORY_DAYS),
        )

    async def _async_refresh_trend(self) -> None:
        """Compute trend from the configured number of past days recorded in HA."""
        self._refresh_configured_history_days()
        if len(self._source_entity_ids) != len(TREND_SOURCE_SUFFIXES):
            self._resolve_source_entity_ids()

        if len(self._source_entity_ids) != len(TREND_SOURCE_SUFFIXES):
            self._trend = {
                "state": "indisponible",
                "situation": "Capteurs sources introuvables",
                "confidence": "faible",
                "interpretation": "Impossible de retrouver tous les capteurs historiques necessaires.",
                "signals": {},
            }
            self.async_write_ha_state()
            return

        end = dt_util.utcnow()
        start = end - timedelta(days=self._history_days)

        histories: dict[str, list[State]] = {}
        for key, entity_id in self._source_entity_ids.items():
            result = await get_instance(self.hass).async_add_executor_job(
                history.state_changes_during_period,
                self.hass,
                start,
                end,
                entity_id,
                True,
                False,
                None,
                True,
            )
            histories[key] = list(result.get(entity_id, []))

        self._trend = self._build_trend_from_history(histories, start, end)
        self.async_write_ha_state()

    def _build_trend_from_history(
        self,
        histories: dict[str, list[State]],
        start,
        end,
    ) -> dict[str, Any]:
        """Analyze recorded data across the configured past period."""
        bucket_hours = self._bucket_hours()

        temperature = self._aggregate_numeric_states(
            histories.get("temperature", []), start, end, bucket_hours
        )
        humidity = self._aggregate_numeric_states(
            histories.get("humidity", []), start, end, bucket_hours
        )
        pressure = self._aggregate_numeric_states(
            histories.get("pressure", []), start, end, bucket_hours
        )
        wind = self._aggregate_numeric_states(
            histories.get("wind_speed", []), start, end, bucket_hours
        )

        coverage_days = min(
            self._covered_days(temperature),
            self._covered_days(humidity),
            self._covered_days(pressure),
            self._covered_days(wind),
        )
        minimum_required_days = self._minimum_required_coverage_days()
        minimum_bucket_count = self._minimum_bucket_count()

        if (
            len(temperature["raw_values"]) < 10
            or len(humidity["raw_values"]) < 10
            or len(pressure["raw_values"]) < 10
            or len(wind["raw_values"]) < 10
            or len(temperature["series"]) < minimum_bucket_count
            or len(humidity["series"]) < minimum_bucket_count
            or len(pressure["series"]) < minimum_bucket_count
            or len(wind["series"]) < minimum_bucket_count
            or coverage_days < minimum_required_days
        ):
            return {
                "state": "indisponible",
                "situation": f"Historique insuffisant sur {self._history_days} jours",
                "confidence": "faible",
                "interpretation": (
                    "Pas assez de mesures passees pour couvrir la fenetre "
                    "d analyse demandee de facon fiable."
                ),
                "signals": {
                    "configured_history_days": self._history_days,
                    "available_history_days": round(coverage_days, 1),
                    "required_history_days": round(minimum_required_days, 1),
                    "bucket_hours": bucket_hours,
                    "minimum_bucket_count": minimum_bucket_count,
                },
            }

        pressure_first = self._series_edge_mean(pressure["series"], at_start=True)
        pressure_last = self._series_edge_mean(pressure["series"], at_start=False)
        humidity_first = self._series_edge_mean(humidity["series"], at_start=True)
        humidity_last = self._series_edge_mean(humidity["series"], at_start=False)
        wind_first = self._series_edge_mean(wind["series"], at_start=True)
        wind_last = self._series_edge_mean(wind["series"], at_start=False)
        temp_first = self._series_edge_mean(temperature["series"], at_start=True)
        temp_last = self._series_edge_mean(temperature["series"], at_start=False)
        temp_range = max(temperature["series"]) - min(temperature["series"])

        pressure_delta = pressure_last - pressure_first
        humidity_delta = humidity_last - humidity_first
        wind_delta = wind_last - wind_first
        temp_delta = temp_last - temp_first

        trend = {
            "state": "mixte",
            "situation": f"Signaux passes melanges sur {self._history_days} jours",
            "confidence": "faible",
            "interpretation": "L historique montre des phases alternees, sans signal dominant net.",
        }

        if pressure_last >= 1018 and humidity_last <= 55 and temp_range <= 5:
            trend = {
                "state": "stable_beau",
                "situation": "Pression elevee + humidite basse + temperature stable",
                "confidence": "bonne",
                "interpretation": f"Les {self._history_days} derniers jours montrent un temps plutot stable, sec et favorable au beau temps.",
            }
        elif pressure_last >= 1016 and 55 < humidity_last <= 72:
            trend = {
                "state": "sec_stable",
                "situation": "Pression elevee + humidite moyenne",
                "confidence": "moyenne",
                "interpretation": "La periode passee est restee assez seche et relativement stable, avec quelques nuages possibles.",
            }
        elif pressure_delta <= -4 and humidity_delta >= 6 and wind_delta >= 4:
            trend = {
                "state": "degradation",
                "situation": "Pression qui baisse + humidite qui monte + vent qui se leve",
                "confidence": "bonne",
                "interpretation": "L historique montre une degradation progressive, typique d une periode plus instable.",
            }
        elif pressure_last <= 1009 and humidity_last >= 82 and 2 <= temp_last <= 22:
            trend = {
                "state": "humide_instable",
                "situation": "Pression basse + humidite tres haute + temperature moderee",
                "confidence": "bonne",
                "interpretation": "Les deux dernieres semaines ont ete tres humides, avec un contexte favorable a la pluie ou au brouillard.",
            }
        elif temp_delta >= 3 and humidity_last <= 55 and abs(pressure_delta) <= 2:
            trend = {
                "state": "eclaircie",
                "situation": "Temperature qui augmente vite + humidite basse + pression stable",
                "confidence": "moyenne",
                "interpretation": "La periode observee tend vers un temps plus doux et plus lumineux.",
            }
        elif temp_delta <= -3 and wind_last >= 22 and humidity_last >= 70:
            trend = {
                "state": "front_froid",
                "situation": "Temperature qui chute + vent fort + humidite elevee",
                "confidence": "moyenne",
                "interpretation": "L historique evoque un passage plus froid et venteux, dans une ambiance humide.",
            }

        trend["signals"] = {
            "configured_history_days": self._history_days,
            "available_history_days": round(coverage_days, 1),
            "required_history_days": round(minimum_required_days, 1),
            "bucket_hours": bucket_hours,
            "minimum_bucket_count": minimum_bucket_count,
            "temperature_samples": len(temperature["raw_values"]),
            "humidity_samples": len(humidity["raw_values"]),
            "pressure_samples": len(pressure["raw_values"]),
            "wind_samples": len(wind["raw_values"]),
            "temperature_buckets": len(temperature["series"]),
            "humidity_buckets": len(humidity["series"]),
            "pressure_buckets": len(pressure["series"]),
            "wind_buckets": len(wind["series"]),
            "pressure_avg_first_period": round(pressure_first, 1),
            "pressure_avg_last_period": round(pressure_last, 1),
            "pressure_delta": round(pressure_delta, 1),
            "humidity_avg_first_period": round(humidity_first, 1),
            "humidity_avg_last_period": round(humidity_last, 1),
            "humidity_delta": round(humidity_delta, 1),
            "temperature_avg_first_period": round(temp_first, 1),
            "temperature_avg_last_period": round(temp_last, 1),
            "temperature_delta": round(temp_delta, 1),
            "wind_avg_first_period": round(wind_first, 1),
            "wind_avg_last_period": round(wind_last, 1),
            "wind_delta": round(wind_delta, 1),
        }
        return trend

    def _aggregate_numeric_states(
        self,
        states: list[State],
        start,
        end,
        bucket_hours: int,
    ) -> dict[str, Any]:
        """Aggregate history into regular time buckets to reduce recorder bias."""
        bucket_seconds = bucket_hours * 3600
        buckets: dict[int, list[float]] = defaultdict(list)
        raw_values: list[float] = []
        timestamps = []

        for state in states:
            try:
                value = float(state.state)
            except (TypeError, ValueError):
                continue

            if not state.last_updated:
                continue

            timestamps.append(state.last_updated)
            raw_values.append(value)

            elapsed = (state.last_updated - start).total_seconds()
            if elapsed < 0:
                continue

            index = int(elapsed // bucket_seconds)
            buckets[index].append(value)

        timestamps.sort()
        window_bucket_count = max(
            1,
            int(((end - start).total_seconds() + bucket_seconds - 1) // bucket_seconds),
        )
        series = [
            mean(buckets[index])
            for index in range(window_bucket_count)
            if buckets.get(index)
        ]

        return {
            "series": series,
            "raw_values": raw_values,
            "timestamps": timestamps,
        }

    @staticmethod
    def _covered_days(partitioned_states: dict[str, Any]) -> float:
        """Return the effective number of covered days for a sensor history."""
        timestamps = partitioned_states.get("timestamps", [])
        if len(timestamps) < 2:
            return 0.0

        return (timestamps[-1] - timestamps[0]).total_seconds() / 86400

    def _minimum_required_coverage_days(self) -> float:
        """Return the minimum real coverage required for the configured window."""
        if self._history_days <= 1:
            return 0.5
        if self._history_days == 2:
            return 1.0
        return max(1.5, self._history_days - 1)

    def _bucket_hours(self) -> int:
        """Return the aggregation granularity suited to the configured window."""
        if self._history_days <= 2:
            return 6
        if self._history_days <= 7:
            return 12
        return 24

    def _minimum_bucket_count(self) -> int:
        """Return the minimum number of aggregated buckets required."""
        if self._history_days <= 1:
            return 3
        if self._history_days <= 2:
            return 4
        if self._history_days <= 7:
            return 5
        return 7

    @staticmethod
    def _series_edge_mean(series: list[float], at_start: bool) -> float:
        """Average the first or last third of a regularized series."""
        edge_size = max(2, len(series) // 3)
        edge = series[:edge_size] if at_start else series[-edge_size:]
        return mean(edge)
