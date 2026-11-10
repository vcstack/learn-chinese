package com.cuong.hoctiengtrung

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.LayoutInflater
import android.view.Menu
import android.view.MenuItem
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import com.cuong.hoctiengtrung.data.LessonRepo
import com.cuong.hoctiengtrung.tts.TtsManager
import com.cuong.hoctiengtrung.util.Prefs

class MainActivity : Activity() {

    companion object {
        private const val REQUEST_NOTIF = 2001
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        actionBar?.title = getString(R.string.app_name)

        TtsManager.init(this)
        AlarmScheduler.schedule(this, Prefs.getIntervalHours(this))
        askNotificationPermission()

        val lessons = LessonRepo.load(this)
        val container = findViewById<LinearLayout>(R.id.lesson_container)
        val inflater = LayoutInflater.from(this)
        for (lesson in lessons) {
            val row = inflater.inflate(R.layout.item_lesson, container, false)
            row.findViewById<TextView>(R.id.item_title).text = "Bài ${lesson.id}: ${lesson.title}"
            row.findViewById<TextView>(R.id.item_subtitle).text = lesson.titleVi
            row.setOnClickListener {
                startActivity(Intent(this, LessonActivity::class.java).apply {
                    putExtra(LessonActivity.EXTRA_LESSON_ID, lesson.id)
                })
            }
            container.addView(row)
        }
    }

    private fun askNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), REQUEST_NOTIF)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_NOTIF &&
            (grantResults.isEmpty() || grantResults[0] != PackageManager.PERMISSION_GRANTED)
        ) {
            Toast.makeText(this, "Bật quyền thông báo để nhận từ vựng nhắc học", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_settings -> {
                startActivity(Intent(this, SettingsActivity::class.java))
                true
            }
            R.id.action_test_word -> {
                AlarmScheduler.triggerNow(this)
                Toast.makeText(this, "Đã gửi thử 1 từ vựng", Toast.LENGTH_SHORT).show()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
