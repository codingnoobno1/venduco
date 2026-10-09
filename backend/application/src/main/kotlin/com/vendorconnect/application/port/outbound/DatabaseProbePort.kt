package com.vendorconnect.application.port.outbound

/** Asks the active persistence provider whether it can be reached, without naming which one it is. */
interface DatabaseProbePort {
    /** A short description of the database that answered. Throws when it cannot be reached. */
    fun describe(): String
}
