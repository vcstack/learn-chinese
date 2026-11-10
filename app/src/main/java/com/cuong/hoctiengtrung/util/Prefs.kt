package com.cuong.hoctiengtrung.util

import android.content.Context
import android.content.SharedPreferences

object Prefs {
    private const val NAME = "hoc_tieng_trung"
    private const val KEY_INTERVAL_HOURS = "reminder_interval_hours"
    private const val KEY_RATE = "tts_rate"
    private const val KEY_WIDGET_ZH = "widget_zh"
    private const val KEY_WIDGET_PY = "widget_py"
    private const val KEY_WIDGET_VI = "widget_vi"

    private fun prefs(context: Context): SharedPreferences =
        context.getSharedPreferences(NAME, Context.MODE_PRIVATE)

    /** Khoảng nhắc học theo giờ. 0 = tắt. Mặc định 2 giờ. */
    fun getIntervalHours(context: Context): Int = prefs(context).getInt(KEY_INTERVAL_HOURS, 2)

    fun setIntervalHours(context: Context, hours: Int) {
        prefs(context).edit().putInt(KEY_INTERVAL_HOURS, hours).apply()
    }

    /** Tốc độ đọc: 0.7f = chậm, 1.0f = vừa. */
    fun getRate(context: Context): Float = prefs(context).getFloat(KEY_RATE, 1.0f)

    fun setRate(context: Context, rate: Float) {
        prefs(context).edit().putFloat(KEY_RATE, rate).apply()
    }

    fun setWidgetWord(context: Context, zh: String, py: String, vi: String) {
        prefs(context).edit()
            .putString(KEY_WIDGET_ZH, zh)
            .putString(KEY_WIDGET_PY, py)
            .putString(KEY_WIDGET_VI, vi)
            .apply()
    }

    fun getWidgetWord(context: Context): Triple<String, String, String> {
        val p = prefs(context)
        return Triple(
            p.getString(KEY_WIDGET_ZH, "你好") ?: "你好",
            p.getString(KEY_WIDGET_PY, "nǐ hǎo") ?: "nǐ hǎo",
            p.getString(KEY_WIDGET_VI, "xin chào") ?: "xin chào"
        )
    }
}
