package com.cuong.hoctiengtrung.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.cuong.hoctiengtrung.MainActivity
import com.cuong.hoctiengtrung.R
import com.cuong.hoctiengtrung.data.LessonRepo
import com.cuong.hoctiengtrung.tts.TtsService
import com.cuong.hoctiengtrung.util.Prefs

/**
 * Widget màn hình chính: hiện 1 từ vựng (chữ Hán + pinyin + nghĩa),
 * nút 🔊 để nghe phát âm, nút ↻ đổi từ khác, chạm vào mở app.
 */
class VocabWidget : AppWidgetProvider() {

    companion object {
        private const val ACTION_NEXT = "com.cuong.hoctiengtrung.widget.NEXT"
        private const val ACTION_SPEAK = "com.cuong.hoctiengtrung.widget.SPEAK"

        fun updateAll(context: Context) {
            val mgr = AppWidgetManager.getInstance(context)
            val ids = mgr.getAppWidgetIds(ComponentName(context, VocabWidget::class.java))
            if (ids.isEmpty()) return
            val intent = Intent(context, VocabWidget::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
            }
            context.sendBroadcast(intent)
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (id in appWidgetIds) {
            updateOne(context, appWidgetManager, id)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        when (intent.action) {
            ACTION_NEXT -> {
                val (word, _) = LessonRepo.randomWord(context)
                Prefs.setWidgetWord(context, word.zh, word.py, word.vi)
                updateAll(context)
            }
            ACTION_SPEAK -> {
                val (zh, _, _) = Prefs.getWidgetWord(context)
                TtsService.start(context, zh)
            }
        }
    }

    private fun updateOne(
        context: Context,
        appWidgetManager: AppWidgetManager,
        widgetId: Int
    ) {
        val (zh, py, vi) = Prefs.getWidgetWord(context)
        val views = RemoteViews(context.packageName, R.layout.widget_vocab)
        views.setTextViewText(R.id.widget_zh, zh)
        views.setTextViewText(R.id.widget_py, py)
        views.setTextViewText(R.id.widget_vi, vi)

        val openPi = PendingIntent.getActivity(
            context, 0, Intent(context, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_root, openPi)

        val speakPi = PendingIntent.getBroadcast(
            context, 1, Intent(context, VocabWidget::class.java).apply { action = ACTION_SPEAK },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_speak, speakPi)

        val nextPi = PendingIntent.getBroadcast(
            context, 2, Intent(context, VocabWidget::class.java).apply { action = ACTION_NEXT },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_next, nextPi)

        appWidgetManager.updateAppWidget(widgetId, views)
    }
}
