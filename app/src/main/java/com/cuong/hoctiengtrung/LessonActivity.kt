package com.cuong.hoctiengtrung

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Button
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.TextView
import com.cuong.hoctiengtrung.data.LessonRepo
import com.cuong.hoctiengtrung.tts.TtsManager
import com.cuong.hoctiengtrung.util.Prefs

class LessonActivity : Activity() {

    companion object {
        const val EXTRA_LESSON_ID = "lesson_id"
    }

    private var lessonId: Int = 1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lesson)
        lessonId = intent.getIntExtra(EXTRA_LESSON_ID, 1)
        val lesson = LessonRepo.load(this).first { it.id == lessonId }
        actionBar?.title = "Bài ${lesson.id}"
        actionBar?.setDisplayHomeAsUpEnabled(true)

        findViewById<TextView>(R.id.lesson_title).text = lesson.title
        findViewById<TextView>(R.id.lesson_title_vi).text = lesson.titleVi

        val inflater = LayoutInflater.from(this)

        val vocabBox = findViewById<LinearLayout>(R.id.vocab_container)
        for (w in lesson.vocab) {
            val row = inflater.inflate(R.layout.item_vocab, vocabBox, false)
            row.findViewById<TextView>(R.id.row_zh).text = w.zh
            row.findViewById<TextView>(R.id.row_py).text = w.py
            row.findViewById<TextView>(R.id.row_vi).text = w.vi
            row.findViewById<ImageButton>(R.id.row_speak).setOnClickListener {
                TtsManager.speak(this, w.zh)
            }
            vocabBox.addView(row)
        }

        val sentBox = findViewById<LinearLayout>(R.id.sentence_container)
        for (s in lesson.sentences) {
            val row = inflater.inflate(R.layout.item_sentence, sentBox, false)
            row.findViewById<TextView>(R.id.row_zh).text = s.zh
            row.findViewById<TextView>(R.id.row_py).text = s.py
            row.findViewById<TextView>(R.id.row_vi).text = s.vi
            row.findViewById<ImageButton>(R.id.row_speak).setOnClickListener {
                TtsManager.speak(this, s.zh)
            }
            sentBox.addView(row)
        }

        val dlgBox = findViewById<LinearLayout>(R.id.dialogue_container)
        for (d in lesson.dialogue) {
            val row = inflater.inflate(R.layout.item_dialogue, dlgBox, false)
            row.findViewById<TextView>(R.id.row_sp).text = d.sp
            row.findViewById<TextView>(R.id.row_zh).text = d.zh
            row.findViewById<TextView>(R.id.row_py).text = d.py
            row.findViewById<TextView>(R.id.row_vi).text = d.vi
            row.findViewById<ImageButton>(R.id.row_speak).setOnClickListener {
                TtsManager.speak(this, d.zh)
            }
            dlgBox.addView(row)
        }

        val speedBtn = findViewById<Button>(R.id.btn_speed)
        fun refreshSpeedLabel() {
            speedBtn.text = if (Prefs.getRate(this) < 0.9f) "Tốc độ: Chậm" else "Tốc độ: Vừa"
        }
        refreshSpeedLabel()
        speedBtn.setOnClickListener {
            val next = if (Prefs.getRate(this) < 0.9f) 1.0f else 0.7f
            Prefs.setRate(this, next)
            refreshSpeedLabel()
        }

        findViewById<Button>(R.id.btn_play_all).setOnClickListener {
            TtsManager.speakAll(this, lesson.dialogue.map { it.zh })
        }

        findViewById<Button>(R.id.btn_practice).setOnClickListener {
            startActivity(Intent(this, PracticeActivity::class.java).apply {
                putExtra(EXTRA_LESSON_ID, lessonId)
            })
        }
    }

    override fun onNavigateUp(): Boolean {
        finish()
        return true
    }
}
