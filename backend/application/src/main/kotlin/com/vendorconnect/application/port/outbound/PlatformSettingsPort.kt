package com.vendorconnect.application.port.outbound

import java.util.UUID

/** Key-value store for settings changed at runtime. Absent means "never changed". */
interface PlatformSettingsPort {
    fun findAll(): Map<String, String>
    fun put(key: String, value: String, updatedBy: UUID?)
}
