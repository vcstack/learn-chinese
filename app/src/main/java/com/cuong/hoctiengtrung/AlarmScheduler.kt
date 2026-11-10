package com.cuong.hoctiengtrung

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import com.cuong.hoctiengtrung.util.Prefs

/**
 * Lên lịch nhắc học bằng AlarmManager (không cần thư viện ngoài):
 * cứ mỗi N giờ lại gửi broadcast cho [ReminderReceiver] hiện 1 từ vựng.
 */
object AlarmScheduler {
    private const val REQUEST_CODE = 1001

    fun schedule(context: Context, intervalHours: Int) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pi = pendingIntent(context)
        am.cancel(pi)
        if (intervalHours <= 0) return
        val interval = intervalHours * AlarmManager.INTERVAL_HOUR
        val first = SystemClock.elapsedRealtime() + interval
        am.setInexactRepeating(
            AlarmManager.ELAPSED_REALTIME_WAKEUP, first, interval, pi
        )
    }

    /** Gửi nhắc ngay lập tức (dùng cho nút "Gửi thử 1 từ"). */
    fun triggerNow(context: Context) {
        context.sendBroadcast(
            Intent(context, ReminderReceiver::class.java)
        )
    }

    private fun pendingIntent(context: Context): PendingIntent {
        val intent = Intent(context, ReminderReceiver::class.java)
        return PendingIntent.getBroadcast(
            context, REQUEST_CODE, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}
