"""MWHA Weather integration for Home Assistant."""

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import slugify

from .const import CONF_LOCATION_NAME, DOMAIN
from .coordinator import MWHAWeatherCoordinator

PLATFORMS = ["weather", "sensor"]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up MWHA Weather from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    await _async_migrate_duplicated_entity_ids(hass, entry)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    coordinator = MWHAWeatherCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def _async_migrate_duplicated_entity_ids(
    hass: HomeAssistant, entry: ConfigEntry
) -> None:
    """Rename old duplicated entity_ids kept in the entity registry."""
    entity_registry = er.async_get(hass)
    entries = er.async_entries_for_config_entry(entity_registry, entry.entry_id)

    location = entry.data.get(CONF_LOCATION_NAME, "MWHA")
    location_slug = slugify(location)
    prefix = f"mwha_weather_{location_slug}"
    duplicated_prefix = f"{prefix}_{prefix}_"
    normal_prefix = f"{prefix}_"

    for registry_entry in entries:
        domain, object_id = registry_entry.entity_id.split(".", 1)
        if not object_id.startswith(duplicated_prefix):
            continue

        new_object_id = object_id.replace(duplicated_prefix, normal_prefix, 1)
        new_entity_id = f"{domain}.{new_object_id}"
        entity_registry.async_update_entity(
            registry_entry.entity_id,
            new_entity_id=new_entity_id,
        )


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def _async_update_listener(
    hass: HomeAssistant, entry: ConfigEntry
) -> None:
    """Reload the entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)
