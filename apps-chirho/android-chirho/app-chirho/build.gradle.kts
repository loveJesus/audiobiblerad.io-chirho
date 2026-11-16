// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

plugins { id("com.android.application") }

android {
    namespace = "io.audiobiblerad.radiochirho"
    // Android 17, whose platform (android-37.0) is installed; gradle.properties forbids SDK downloads.
    compileSdk = 37
    // The installed build tools.
    buildToolsVersion = "36.0.0"
    defaultConfig {
        // Provisional local identifier. No Play application record exists.
        applicationId = "io.audiobiblerad.radiochirho"
        minSdk = 26
        targetSdk = 37
        versionCode = 1
        versionName = "0.1.0"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    // The shared catalogue snapshot and the staged effects, both generated from the web sources.
    sourceSets.getByName("main").assets.directories.add(rootProject.file("../shared-chirho").absolutePath)
    testOptions {
        unitTests.all { testChirho ->
            testChirho.systemProperty(
                "radio_catalogue_chirho",
                rootProject.file("../shared-chirho/catalogue_chirho.json").absolutePath
            )
        }
    }
    lint { warningsAsErrors = true }
}

kotlin { compilerOptions { allWarningsAsErrors.set(true) } }

dependencies {
    implementation("androidx.media3:media3-exoplayer:1.11.1")
    implementation("androidx.media3:media3-session:1.11.1")
    testImplementation("junit:junit:4.13.2")
    // Android's org.json is a stub off the device, so the JVM tests read JSON with the real one.
    testImplementation("org.json:json:20260814")
}
