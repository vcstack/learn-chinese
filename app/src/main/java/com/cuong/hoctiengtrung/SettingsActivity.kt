package com.cuong.hoctiengtrung

import android.app.Activity
import android.os.Bundle
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
        val btnInstallVoice = findViewById<Button>(R.id.btn_install_voice)
        TtsManager.init(this) {
            if (TtsManager.isLangAvailable()) {
                ttsStatus.text = "Giọng tiếng Trung: đã sẵn sàng ✓\nNút Nghe sẽ phát âm được bình thường."
                btnInstallVoice.visibility = Button.GONE
            } else {
                ttsStatus.text = "Chưa có giọng tiếng Trung trên máy nên nút Nghe chưa phát ra tiếng. Bấm nút dưới để cài giọng Google TTS (miễn phí, một lần duy nhất)."
                btnInstallVoice.visibility = Button.VISIBLE
            }
        }

        btnInstallVoice.setOnClickListener {
            TtsManager.openGoogleTtsInstall(this)
        }

        findViewById<Button>(R.id.btn_tts_settings).setOnClickListener {
            TtsManager.openTtsSettings(this)
        }
    }

    override fun onNavigateUp(): Boolean {
        finish()
        return true
    }
}
