package com.vendorconnect.bootstrap

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.test.context.ActiveProfiles
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = ["spring.datasource.url=jdbc:sqlite::memory:"])
@ActiveProfiles("test")
class ConnectivityTest {
    @Autowired
    lateinit var http: TestRestTemplate

    @Test
    fun `a request passes through every layer and reaches the database`() {
        val response = http.getForEntity("/api/v1/connectivity", Map::class.java)

        assertEquals(200, response.statusCode.value())
        assertEquals("CONNECTED", response.body!!["status"])
        val layers = (response.body!!["layers"] as List<*>).map { (it as Map<*, *>)["layer"] }
        assertEquals(listOf("web", "application", "domain", "persistence"), layers)
        assertTrue((response.body!!["layers"] as List<*>).all { (it as Map<*, *>)["reachable"] == true })
    }
}
