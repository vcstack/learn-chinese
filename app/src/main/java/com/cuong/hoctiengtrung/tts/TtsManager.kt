package com.cuong.hoctiengtrung.tts

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.speech.tts.TextToSpeech
import com.cuong.hoctiengtrung.util.Prefs
import java.util.Locale

/**
 * Phát âm tiếng Trung dùng TextToSpeech có sẵn của máy.
 *
 * Máy cần có dữ liệu giọng tiếng Trung. Nhiều máy (vd: Xiaomi/MIUI) mặc định
 * không có giọng này nên sẽ không phát ra tiếng — app sẽ phát hiện và hướng
 * dẫn người dùng cài giọng Google TTS tiếng Trung thay vì im lặng.
 */
object TtsManager {
    private var tts: TextToSpeech? = null
    private var ready = false
    private var langOk = false
    private var initializing = false
    private var pendingSpeak: String? = null
    private val pendingCallbacks = ArrayList<() -> Unit>()

    /** Các locale tiếng Trung thử theo thứ tự ưu tiên. */
    private val CHINESE_LOCALES = listOf(
        Locale.SIMPLIFIED_CHINESE, // zh_CN
        Locale.CHINESE,            // zh
        Locale.TRADITIONAL_CHINESE, // zh_TW
        Locale("zh", "HK"),
        Locale("zh", "SG")
    )

    fun init(context: Context, onReady: (() -> Unit)? = null) {
        if (ready) {
            onReady?.invoke()
            return
        }
        if (onReady != null) pendingCallbacks.add(onReady)
        if (initializing) return
        if (tts != null) return
        initializing = true
        tts = TextToSpeech(context.applicationContext) { status ->
            initializing = false
            if (status == TextToSpeech.SUCCESS) {
                langOk = trySetChineseLanguage()
                ready = true
                pendingSpeak?.let { text ->
                    pendingSpeak = null
                    if (langOk) speakNow(text, context)
                }
            } else {
                ready = true
                langOk = false
            }
            val cbs = pendingCallbacks.toList()
            pendingCallbacks.clear()
            for (cb in cbs) cb()
        }
    }

    /** Thử từng locale tiếng Trung, trả về true nếu có ít nhất một giọng dùng được. */
    private fun trySetChineseLanguage(): Boolean {
        val engine = tts ?: return false
        for (locale in CHINESE_LOCALES) {
            try {
                val res = engine.setLanguage(locale)
                if (res == TextToSpeech.LANG_AVAILABLE ||
                    res == TextToSpeech.LANG_COUNTRY_AVAILABLE ||
                    res == TextToSpeech.LANG_COUNTRY_VAR_AVAILABLE
                ) {
                    return true
                }
            } catch (e: Exception) {
                // Thử locale tiếp theo.
            }
        }
        return false
    }

    fun isReady(): Boolean = ready

    fun isLangAvailable(): Boolean = langOk

    /**
     * Phát âm. Trả về true nếu đã (hoặc sẽ) phát, false nếu máy không có
     * giọng tiếng Trung — lúc đó caller nên hiện hướng dẫn cài giọng.
     */
    fun speak(context: Context, text: String): Boolean {
        if (!ready) {
            pendingSpeak = text
            init(context)
            return true
        }
        if (!langOk) return false
        speakNow(text, context)
        return true
    }

    private fun speakNow(text: String, context: Context) {
        val engine = tts ?: return
        engine.setSpeechRate(Prefs.getRate(context))
        engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, "utt_${System.currentTimeMillis()}")
    }

    /** Đọc liền nhiều câu, mỗi câu một lượt. */
    fun speakAll(context: Context, texts: List<String>): Boolean {
        if (texts.isEmpty()) return true
        if (!ready) {
            init(context) { speakAll(context, texts) }
            return true
        }
        if (!langOk) return false
        val engine = tts ?: return false
        engine.setSpeechRate(Prefs.getRate(context))
        engine.speak(texts.first(), TextToSpeech.QUEUE_FLUSH, null, "utt_0")
        for ((i, t) in texts.drop(1).withIndex()) {
            engine.speak(t, TextToSpeech.QUEUE_ADD, null, "utt_${i + 1}")
        }
        return true
    }

    fun stop() {
        tts?.stop()
    }

    /** Mở màn hình cài đặt Text-to-speech của hệ thống. */
    fun openTtsSettings(context: Context) {
        val intent = Intent("android.settings.TTS_SETTINGS").apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    /** Mở trang Google TTS trên Play Store để cài giọng đọc. */
    fun openGoogleTtsInstall(context: Context) {
        val pkg = "com.google.android.tts"
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$pkg")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            val intent = Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://play.google.com/store/apps/details?id=$pkg")
            ).apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK }
            context.startActivity(intent)
        }
    }
}
