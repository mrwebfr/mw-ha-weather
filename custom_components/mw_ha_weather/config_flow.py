"""Config flow for MWHA Weather integration."""

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE
from homeassistant.data_entry_flow import FlowResult
from homeassistant.core import callback

from .const import (
    CONF_HISTORY_DAYS,
    CONF_LOCATION_NAME,
    CONF_UPDATE_INTERVAL,
    DEFAULT_HISTORY_DAYS,
    DEFAULT_UPDATE_INTERVAL,
    DOMAIN,
)


class MWHAWeatherConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for MWHA Weather."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Create the options flow."""
        return MWHAWeatherOptionsFlow(config_entry)

    async def async_step_user(
        self, user_input: dict | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
            if not user_input.get(CONF_LATITUDE):
                user_input[CONF_LATITUDE] = self.hass.config.latitude
            if not user_input.get(CONF_LONGITUDE):
                user_input[CONF_LONGITUDE] = self.hass.config.longitude

            await self.async_set_unique_id(
                f"{user_input[CONF_LOCATION_NAME]}_{user_input[CONF_LATITUDE]}"
            )
            self._abort_if_unique_id_configured()

            return self.async_create_entry(
                title=user_input[CONF_LOCATION_NAME],
                data=user_input,
            )

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_LOCATION_NAME, default="Ma ville"
                ): str,
                vol.Optional(
                    CONF_LATITUDE,
                    description={"suggested_value": self.hass.config.latitude},
                ): vol.Coerce(float),
                vol.Optional(
                    CONF_LONGITUDE,
                    description={"suggested_value": self.hass.config.longitude},
                ): vol.Coerce(float),
                vol.Optional(
                    CONF_UPDATE_INTERVAL, default=DEFAULT_UPDATE_INTERVAL
                ): vol.In({5: "5 min", 10: "10 min", 15: "15 min", 30: "30 min"}),
                vol.Optional(
                    CONF_HISTORY_DAYS, default=DEFAULT_HISTORY_DAYS
                ): vol.All(vol.Coerce(int), vol.Range(min=1, max=365)),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Allow reconfiguring an existing entry from the UI."""
        entry = self._get_reconfigure_entry()

        if user_input is not None:
            if not user_input.get(CONF_LATITUDE):
                user_input[CONF_LATITUDE] = self.hass.config.latitude
            if not user_input.get(CONF_LONGITUDE):
                user_input[CONF_LONGITUDE] = self.hass.config.longitude

            return self.async_update_reload_and_abort(
                entry,
                data_updates={
                    CONF_LOCATION_NAME: user_input[CONF_LOCATION_NAME],
                    CONF_LATITUDE: user_input[CONF_LATITUDE],
                    CONF_LONGITUDE: user_input[CONF_LONGITUDE],
                    CONF_UPDATE_INTERVAL: user_input[CONF_UPDATE_INTERVAL],
                    CONF_HISTORY_DAYS: user_input[CONF_HISTORY_DAYS],
                },
            )

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_LOCATION_NAME,
                    default=entry.data.get(CONF_LOCATION_NAME, "Ma ville"),
                ): str,
                vol.Optional(
                    CONF_LATITUDE,
                    description={
                        "suggested_value": entry.data.get(
                            CONF_LATITUDE, self.hass.config.latitude
                        )
                    },
                ): vol.Coerce(float),
                vol.Optional(
                    CONF_LONGITUDE,
                    description={
                        "suggested_value": entry.data.get(
                            CONF_LONGITUDE, self.hass.config.longitude
                        )
                    },
                ): vol.Coerce(float),
                vol.Optional(
                    CONF_UPDATE_INTERVAL,
                    default=entry.options.get(
                        CONF_UPDATE_INTERVAL,
                        entry.data.get(
                            CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL
                        ),
                    ),
                ): vol.In({5: "5 min", 10: "10 min", 15: "15 min", 30: "30 min"}),
                vol.Optional(
                    CONF_HISTORY_DAYS,
                    default=entry.options.get(
                        CONF_HISTORY_DAYS,
                        entry.data.get(CONF_HISTORY_DAYS, DEFAULT_HISTORY_DAYS),
                    ),
                ): vol.All(vol.Coerce(int), vol.Range(min=1, max=365)),
            }
        )

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=schema,
        )


class MWHAWeatherOptionsFlow(config_entries.OptionsFlow):
    """Handle MWHA Weather options."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self._config_entry = config_entry

    async def async_step_init(
        self, user_input: dict | None = None
    ) -> FlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current_update_interval = self._config_entry.options.get(
            CONF_UPDATE_INTERVAL,
            self._config_entry.data.get(
                CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL
            ),
        )
        current_history_days = self._config_entry.options.get(
            CONF_HISTORY_DAYS,
            self._config_entry.data.get(
                CONF_HISTORY_DAYS, DEFAULT_HISTORY_DAYS
            ),
        )

        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_UPDATE_INTERVAL, default=current_update_interval
                ): vol.In({5: "5 min", 10: "10 min", 15: "15 min", 30: "30 min"}),
                vol.Optional(
                    CONF_HISTORY_DAYS, default=current_history_days
                ): vol.All(vol.Coerce(int), vol.Range(min=1, max=365)),
            }
        )

        return self.async_show_form(
            step_id="init",
            data_schema=schema,
        )
