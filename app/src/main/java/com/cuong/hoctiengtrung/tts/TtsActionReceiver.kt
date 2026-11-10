package com.cuong.hoctiengtrung.tts

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** Nhận action "Nghe" từ thông báo nhắc học rồi phát âm qua [TtsService]. */
class TtsActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == TtsService.ACTION_SPEAK) {
            val text = intent.getStringExtra(TtsService.EXTRA_TEXT) ?: return
            TtsService.start(context, text)
        }
    }
}
