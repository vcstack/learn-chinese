package com.cuong.hoctiengtrung.tts

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.cuong.hoctiengtrung.R
import com.cuong.hoctiengtrung.util.Prefs
import java.util.Locale

/**
 * Foreground service đọc một đoạn tiếng Trung (dùng cho nút 🔊 ở widget
 * và action "Nghe" trong thông báo nhắc học). Đọc xong tự dừng.
 */
class TtsService : Service() {

    companion object {
        const val ACTION_SPEAK = "com.cuong.hoctiengtrung.ACTION_SPEAK"
        const val EXTRA_TEXT = "text"
        private const val CHANNEL_ID = "tts_channel"
        private const val NOTIF_ID = 2

        fun start(context: Context, text: String) {
            val intent = Intent(context, TtsService::class.java).apply {
                action = ACTION_SPEAK
                putExtra(EXTRA_TEXT, text)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }

    private var tts: TextToSpeech? = null
    private var pendingText: String? = null
    private val handler = Handler(Looper.getMainLooper())

    override fun onCreate() {
        super.onCreate()
        createChannel()
        startForeground(NOTIF_ID, buildNotification("Đang phát âm…"))
        tts = TextToSpeech(this) { status ->
            if (status == TextToSpeech.SUCCESS) {
                if (trySetChineseLanguage()) {
                    pendingText?.let { speakNow(it) }
                    pendingText = null
                } else {
                    // Máy không có giọng tiếng Trung: dừng, không phát ra tiếng.
                    stopSelf()
                }
            } else {
                stopSelf()
            }
        }
    }

    /** Thử từng locale tiếng Trung, trả về true nếu có ít nhất một giọng dùng được. */
    private fun trySetChineseLanguage(): Boolean {
        val engine = tts ?: return false
        val locales = listOf(
            Locale.SIMPLIFIED_CHINESE,
            Locale.CHINESE,
            Locale.TRADITIONAL_CHINESE,
            Locale("zh", "HK"),
            Locale("zh", "SG")
        )
        for (locale in locales) {
            try {
                val res = engine.setLanguage(locale)
                if (res == TextToSpeech.LANG_AVAILABLE ||
                    res == TextToSpeech.LANG_COUNTRY_AVAILABLE ||
                    res == TextToSpeech.LANG_COUNTRY_VAR_AVAILABLE
                ) {
                    return true
                }
            } catch (e: Exception) {
            }
        }
        return false
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val text = intent?.getStringExtra(EXTRA_TEXT)
        if (text.isNullOrBlank()) {
            stopSelf()
            return START_NOT_STICKY
        }
        if (tts == null) {
            pendingText = text
        } else {
            speakNow(text)
        }
        return START_NOT_STICKY
    }

    private fun speakNow(text: String) {
        val engine = tts ?: run { stopSelf(); return }
        engine.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}
            override fun onDone(utteranceId: String?) { stopSelf() }
            override fun onError(utteranceId: String?) { stopSelf() }
        })
        engine.setSpeechRate(Prefs.getRate(this))
        engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, "utt")
        // An toàn: dừng sau tối đa 20 giây dù có sự cố.
        handler.postDelayed({ stopSelf() }, 20_000)
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID, "Phát âm", NotificationManager.IMPORTANCE_LOW
            )
            val nm = getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(text: String): Notification {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(text)
                .setSmallIcon(android.R.drawable.ic_btn_speak_now)
                .setOngoing(true)
                .build()
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(text)
                .setSmallIcon(android.R.drawable.ic_btn_speak_now)
                .setOngoing(true)
                .build()
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }
}
