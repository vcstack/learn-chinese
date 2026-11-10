plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.cuong.hoctiengtrung"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.cuong.hoctiengtrung"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

// Không dùng thêm thư viện ngoài: app chỉ dùng API có sẵn của Android
// (Activity, AlarmManager, TextToSpeech, AppWidget) + Kotlin stdlib.
dependencies {
}
