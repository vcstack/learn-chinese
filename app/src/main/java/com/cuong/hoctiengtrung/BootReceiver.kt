package com.cuong.hoctiengtrung

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.cuong.hoctiengtrung.util.Prefs
import com.cuong.hoctiengtrung.widget.VocabWidget

/** Sau khi máy khởi động lại: lên lịch nhắc học và làm mới widget. */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            AlarmScheduler.schedule(context, Prefs.getIntervalHours(context))
            VocabWidget.updateAll(context)
        }
    }
}
