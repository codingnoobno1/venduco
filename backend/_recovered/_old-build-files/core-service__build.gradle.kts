plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    kotlin("plugin.jpa")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

// JPA entities must be open so Hibernate can create lazy-loading proxies.
allOpen {
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.MappedSuperclass")
    annotation("jakarta.persistence.Embeddable")
}

dependencies {
    // ── Spring Boot Core ──
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // ── Admin console: server-rendered pages, no client-side code ──
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")

    // ── Kotlin ──
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // ── Database: Phase 1 = SQLite, Phase 2+ = PostgreSQL ──
    runtimeOnly("org.xerial:sqlite-jdbc:3.49.1.0")
    implementation("org.hibernate.orm:hibernate-community-dialects:6.6.13.Final")
    // Uncomment for Phase 2:
    // runtimeOnly("org.postgresql:postgresql")

    // ── Database Migrations ──
    implementation("org.flywaydb:flyway-core")

    // ── JWT Authentication ──
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    // ── Shared Library ──
    implementation(project(":shared-lib"))

    // ── Testing ──
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
}

// Local runs use the dev profile (dev JWT secret, non-secure cookies) unless told otherwise.
tasks.named<org.springframework.boot.gradle.tasks.run.BootRun>("bootRun") {
    environment("SPRING_PROFILES_ACTIVE", System.getenv("SPRING_PROFILES_ACTIVE") ?: "dev")
}
