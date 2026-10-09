package com.vendorconnect.persistence.jpa.jdbc

import com.vendorconnect.application.port.outbound.PlatformSettingsPort
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.UUID

@Component
class PlatformSettingsAdapter(private val jdbc: JdbcTemplate) : PlatformSettingsPort {

    override fun findAll(): Map<String, String> = buildMap {
        jdbc.query("SELECT setting_key, setting_value FROM platform_settings") { rs ->
            put(rs.getString("setting_key"), rs.getString("setting_value"))
        }
    }

    override fun put(key: String, value: String, updatedBy: UUID?) {
        jdbc.update(
            """INSERT INTO platform_settings (setting_key, setting_value, updated_at, updated_by) VALUES (?, ?, ?, ?)
               ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value,
                   updated_at = excluded.updated_at, updated_by = excluded.updated_by""",
            key, value, Instant.now().toString(), updatedBy?.toString()
        )
    }
}
