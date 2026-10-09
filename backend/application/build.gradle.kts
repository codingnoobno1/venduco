// Use cases and ports. Depends on the domain only: no database or web types.
// The recovered use cases carry Spring's @Service and @Transactional, so the two Spring libraries that
// define them are allowed here until those annotations are moved out to the bootstrap wiring.
plugins {
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.spring.dependency.management)
}

dependencyManagement {
    imports { mavenBom(org.springframework.boot.gradle.plugin.SpringBootPlugin.BOM_COORDINATES) }
}

dependencies {
    api(project(":domain"))
    implementation(libs.spring.boot.starter)
    implementation(libs.spring.tx)
}
