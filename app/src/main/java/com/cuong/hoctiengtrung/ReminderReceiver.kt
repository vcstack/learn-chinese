package com.cuong.hoctiengtrung

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import com.cuong.hoctiengtrung.data.LessonRepo
import com.cuong.hoctiengtrung.tts.TtsService
import com.cuong.hoctiengtrung.util.Prefs
import com.cuong.hoctiengtrung.widget.VocabWidget

/** Nhận báo thức nhắc học: chọn 1 từ ngẫu nhiên, hiện thông báo + đổi từ trên widget. */
class ReminderReceiver : BroadcastReceiver() {

    companion object {
        const val CHANNEL_ID = "remind_channel"
        private const val NOTIF_ID = 1
    }

    override fun onReceive(context: Context, intent: Intent) {
        val (word, _) = LessonRepo.randomWord(context)
        Prefs.setWidgetWord(context, word.zh, word.py, word.vi)
        VocabWidget.updateAll(context)
        showNotification(context, word.zh, word.py, word.vi)
    }

    private fun showNotification(context: Context, zh: String, py: String, vi: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) return

        createChannel(context)

        val openIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val openPi = PendingIntent.getActivity(
            context, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val speakIntent = Intent(context, com.cuong.hoctiengtrung.tts.TtsActionReceiver::class.java).apply {
            action = TtsService.ACTION_SPEAK
            putExtra(TtsService.EXTRA_TEXT, zh)
        }
        val speakPi = PendingIntent.getBroadcast(
            context, 1, speakIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notif: Notification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_btn_speak_now)
                .setContentTitle(zh)
                .setContentText("$py — $vi")
                .setStyle(Notification.BigTextStyle().bigText("$py\n$vi"))
                .setContentIntent(openPi)
                .setAutoCancel(true)
                .addAction(
                    Notification.Action.Builder(
                        android.R.drawable.ic_btn_speak_now, "🔊 Nghe", speakPi
                    ).build()
                )
                .build()
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(context)
                .setSmallIcon(android.R.drawable.ic_btn_speak_now)
                .setContentTitle(zh)
                .setContentText("$py — $vi")
                .setContentIntent(openPi)
                .setAutoCancel(true)
                .build()
        }

        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(NOTIF_ID, notif)
    }

    private fun createChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID, "Nhắc học tiếng Trung", NotificationManager.IMPORTANCE_DEFAULT
            ).apply { description = "Hiện từ vựng để ôn theo giờ" }
            val nm = context.getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(channel)
        }
    }
}
