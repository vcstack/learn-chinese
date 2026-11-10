package com.cuong.hoctiengtrung.tts

import android.content.Context
import android.speech.tts.TextToSpeech
import com.cuong.hoctiengtrung.util.Prefs
import java.util.Locale

/**
 * Phát âm tiếng Trung dùng TextToSpeech có sẵn của máy (giọng zh).
 * Máy cần có dữ liệu giọng tiếng Trung (thường là Google TTS). Nếu chưa có,
 * người dùng cần cài trong Cài đặt hệ thống > Text-to-speech.
 */
object TtsManager {
    private var tts: TextToSpeech? = null
    private var ready = false
    private var langOk = false

    fun init(context: Context, onReady: (() -> Unit)? = null) {
        if (tts != null) {
            onReady?.invoke()
            return
        }
        tts = TextToSpeech(context.applicationContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val res = tts?.setLanguage(Locale.CHINESE) ?: TextToSpeech.LANG_NOT_SUPPORTED
                langOk = res == TextToSpeech.LANG_AVAILABLE ||
                    res == TextToSpeech.LANG_COUNTRY_AVAILABLE ||
                    res == TextToSpeech.LANG_COUNTRY_VAR_AVAILABLE
                ready = true
            }
            onReady?.invoke()
        }
    }

    fun isLangAvailable(): Boolean = langOk

    fun speak(context: Context, text: String) {
        val engine = tts
        if (engine == null || !ready) {
            init(context) { speak(context, text) }
            return
        }
        engine.setSpeechRate(Prefs.getRate(context))
        engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, "utt_${System.currentTimeMillis()}")
    }

    /** Đọc liền nhiều câu, mỗi câu một lượt. */
    fun speakAll(context: Context, texts: List<String>) {
        val engine = tts
        if (engine == null || !ready) {
            init(context) { speakAll(context, texts) }
            return
        }
        engine.setSpeechRate(Prefs.getRate(context))
        engine.speak(texts.first(), TextToSpeech.QUEUE_FLUSH, null, "utt_0")
        for ((i, t) in texts.drop(1).withIndex()) {
            engine.speak(t, TextToSpeech.QUEUE_ADD, null, "utt_${i + 1}")
        }
    }

    fun stop() {
        tts?.stop()
    }
}
