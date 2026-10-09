package com.vendorconnect.persistence.jpa.adapter

import com.vendorconnect.application.port.outbound.DatabaseProbePort
import org.springframework.jdbc.core.ConnectionCallback
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class JdbcDatabaseProbeAdapter(private val jdbc: JdbcTemplate) : DatabaseProbePort {
    override fun describe(): String =
        jdbc.execute(ConnectionCallback { connection ->
            val meta = connection.metaData
            "${meta.databaseProductName} ${meta.databaseProductVersion}"
        }) ?: "unknown database"
}
