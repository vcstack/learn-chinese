package com.cuong.hoctiengtrung

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.RadioGroup
import android.widget.TextView
import android.widget.Toast
import com.cuong.hoctiengtrung.tts.TtsManager
import com.cuong.hoctiengtrung.util.Prefs

class SettingsActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)
        actionBar?.title = "Cài đặt"
        actionBar?.setDisplayHomeAsUpEnabled(true)

        val group = findViewById<RadioGroup>(R.id.interval_group)
        when (Prefs.getIntervalHours(this)) {
            0 -> group.check(R.id.interval_off)
            1 -> group.check(R.id.interval_1h)
            2 -> group.check(R.id.interval_2h)
            4 -> group.check(R.id.interval_4h)
            else -> group.check(R.id.interval_2h)
        }
        group.setOnCheckedChangeListener { _, checkedId ->
            val hours = when (checkedId) {
                R.id.interval_off -> 0
                R.id.interval_1h -> 1
                R.id.interval_2h -> 2
                R.id.interval_4h -> 4
                else -> 2
            }
            Prefs.setIntervalHours(this, hours)
            AlarmScheduler.schedule(this, hours)
            Toast.makeText(
                this,
                if (hours == 0) "Đã tắt nhắc học" else "Nhắc học mỗi $hours giờ",
                Toast.LENGTH_SHORT
            ).show()
        }

        findViewById<Button>(R.id.btn_test_word).setOnClickListener {
            AlarmScheduler.triggerNow(this)
            Toast.makeText(this, "Đã gửi thử 1 từ vựng", Toast.LENGTH_SHORT).show()
        }

        val ttsStatus = findViewById<TextView>(R.id.tts_status)
        TtsManager.init(this) {
            ttsStatus.text = if (TtsManager.isLangAvailable()) {
                "Giọng tiếng Trung: đã sẵn sàng ✓"
            } else {
                "Chưa có giọng tiếng Trung trên máy. Bấm nút dưới để cài giọng Google TTS."
            }
        }

        findViewById<Button>(R.id.btn_tts_settings).setOnClickListener {
            // Mở màn hình cài đặt Text-to-speech của hệ thống
            // (hằng ACTION_TTS_SETTINGS bị ẩn trong SDK công khai nên dùng chuỗi trực tiếp).
            startActivity(Intent("android.settings.TTS_SETTINGS"))
        }
    }

    override fun onNavigateUp(): Boolean {
        finish()
        return true
    }
}
