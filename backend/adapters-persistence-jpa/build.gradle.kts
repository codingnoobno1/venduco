// The relational implementation of the persistence ports (SQLite now, PostgreSQL later).
plugins {
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.kotlin.jpa)
    alias(libs.plugins.spring.dependency.management)
}

// JPA entities must be open so Hibernate can create lazy-loading proxies.
allOpen {
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.MappedSuperclass")
    annotation("jakarta.persistence.Embeddable")
}

dependencyManagement {
    imports { mavenBom(org.springframework.boot.gradle.plugin.SpringBootPlugin.BOM_COORDINATES) }
}

dependencies {
    implementation(project(":application"))
    implementation(libs.spring.boot.starter.jdbc)
    implementation(libs.spring.boot.starter.data.jpa)
    implementation(libs.hibernate.community.dialects)
    implementation(libs.flyway.core)
    runtimeOnly(libs.sqlite.jdbc)
}
