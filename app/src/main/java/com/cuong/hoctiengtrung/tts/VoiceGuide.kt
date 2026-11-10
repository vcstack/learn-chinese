package com.cuong.hoctiengtrung.tts

import android.app.Activity
import android.app.AlertDialog

/** Hộp thoại hướng dẫn khi máy chưa có giọng đọc tiếng Trung. */
object VoiceGuide {
    fun showNoVoiceDialog(activity: Activity) {
        AlertDialog.Builder(activity)
            .setTitle("Chưa có giọng tiếng Trung")
            .setMessage(
                "Máy của bạn chưa có giọng đọc tiếng Trung nên nút Nghe chưa phát ra tiếng.\n\n" +
                    "Cần cài giọng Google TTS tiếng Trung (miễn phí, làm một lần duy nhất):\n" +
                    "1. Bấm \"Cài giọng ngay\" để tải Google TTS.\n" +
                    "2. Mở Google TTS → Cài đặt → Cài đặt dữ liệu giọng nói → Tiếng Trung (Trung Quốc) → Tải về.\n" +
                    "3. Quay lại app, bấm Nghe là đọc được."
            )
            .setPositiveButton("Cài giọng ngay") { _, _ ->
                TtsManager.openGoogleTtsInstall(activity)
            }
            .setNeutralButton("Mở cài đặt giọng") { _, _ ->
                TtsManager.openTtsSettings(activity)
            }
            .setNegativeButton("Để sau", null)
            .show()
    }
}
