package com.vendorconnect.persistence.jpa.dialect

import org.hibernate.community.dialect.SQLiteDialect
import java.sql.Types

/**
 * SQLite dialect that treats all integral column types as interchangeable during `ddl-auto: validate`.
 *
 * SQLite has a single 64-bit INTEGER storage class, so a column declared `INTEGER` (e.g. money in paise)
 * can safely back a `Long`/BIGINT attribute. Without this, Hibernate rejects the schema ("found integer,
 * expecting bigint") and the only way to pass validation was to map `Long` fields as INTEGER, which makes
 * the JDBC driver read them with `getInt()` and silently overflow above 2^31 (≈ ₹2.1 crore in paise).
 */
class VendorConnectSQLiteDialect : SQLiteDialect() {

    override fun equivalentTypes(typeCode1: Int, typeCode2: Int): Boolean =
        super.equivalentTypes(typeCode1, typeCode2) || (isIntegral(typeCode1) && isIntegral(typeCode2))

    private fun isIntegral(typeCode: Int) =
        typeCode == Types.INTEGER || typeCode == Types.BIGINT || typeCode == Types.SMALLINT || typeCode == Types.TINYINT
}
