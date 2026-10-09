import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.kotlin.spring) apply false
    alias(libs.plugins.spring.boot) apply false
    alias(libs.plugins.spring.dependency.management) apply false
}

allprojects {
    group = "com.vendorconnect"
    version = "0.1.0"

    repositories {
        mavenCentral()
    }
}

// Recovered files that do not compile yet because types they need were never recovered. They sit in their final
// module and package but are left out of compilation; remove a line once the file builds. -PincludePending compiles all.
val pendingRecovered: Map<String, List<String>> = file("recovered-pending.txt").takeIf { it.exists() && !hasProperty("includePending") }
    ?.readLines().orEmpty()
    .map { it.trim() }.filter { it.isNotEmpty() && !it.startsWith("#") }
    .groupBy({ it.substringBefore(':') }, { it.substringAfter(':') })

subprojects {
    apply(plugin = "org.jetbrains.kotlin.jvm")

    // Spring's dependency management would otherwise pin Kotlin's own libraries to the older version in its BOM.
    extra["kotlin.version"] = rootProject.libs.versions.kotlin.get()
    extra["sqlite-jdbc.version"] = rootProject.libs.versions.sqlite.jdbc.get()

    extensions.configure<JavaPluginExtension> {
        toolchain { languageVersion.set(JavaLanguageVersion.of(21)) }
    }

    tasks.withType<KotlinCompile> {
        pendingRecovered[project.name]?.let { exclude(it) }
        compilerOptions {
            freeCompilerArgs.add("-Xjsr305=strict")
            jvmTarget.set(JvmTarget.JVM_21)
        }
    }

    tasks.withType<Test> {
        useJUnitPlatform()
    }
}
