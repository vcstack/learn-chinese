package com.cuong.hoctiengtrung

import android.app.Activity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.TextView
import com.cuong.hoctiengtrung.data.LessonRepo
import com.cuong.hoctiengtrung.data.Word
import com.cuong.hoctiengtrung.tts.TtsManager
import com.cuong.hoctiengtrung.tts.VoiceGuide

class PracticeActivity : Activity() {

    private data class Card(val zh: String, val py: String, val vi: String)

    private lateinit var cards: List<Card>
    private lateinit var vocab: List<Word>
    private var cardIndex = 0
    private var quizWord: Word? = null
    private var quizAnswered = false
    private var score = 0
    private var total = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_practice)
        val lessonId = intent.getIntExtra(LessonActivity.EXTRA_LESSON_ID, 1)
        val lesson = LessonRepo.load(this).first { it.id == lessonId }
        actionBar?.title = "Luyện nói — Bài ${lesson.id}"
        actionBar?.setDisplayHomeAsUpEnabled(true)

        vocab = lesson.vocab
        cards = (lesson.vocab.map { Card(it.zh, it.py, it.vi) } +
            lesson.sentences.map { Card(it.zh, it.py, it.vi) }).shuffled()

        val flashBox = findViewById<LinearLayout>(R.id.flash_container)
        val quizBox = findViewById<LinearLayout>(R.id.quiz_container)
        val btnFlash = findViewById<Button>(R.id.btn_mode_flash)
        val btnQuiz = findViewById<Button>(R.id.btn_mode_quiz)

        // --- Flashcard ---
        val flashVi = findViewById<TextView>(R.id.flash_vi)
        val flashZh = findViewById<TextView>(R.id.flash_zh)
        val flashPy = findViewById<TextView>(R.id.flash_py)
        val btnReveal = findViewById<Button>(R.id.btn_reveal)
        val btnFlashNext = findViewById<Button>(R.id.btn_flash_next)
        val btnFlashSpeak = findViewById<ImageButton>(R.id.btn_flash_speak)

        fun showCard() {
            val c = cards[cardIndex % cards.size]
            flashVi.text = c.vi
            flashZh.visibility = View.INVISIBLE
            flashPy.visibility = View.INVISIBLE
            btnFlashSpeak.visibility = View.INVISIBLE
            btnReveal.text = "Hiện đáp án"
        }
        showCard()
        btnReveal.setOnClickListener {
            val c = cards[cardIndex % cards.size]
            flashZh.text = c.zh
            flashPy.text = c.py
            flashZh.visibility = View.VISIBLE
            flashPy.visibility = View.VISIBLE
            btnFlashSpeak.visibility = View.VISIBLE
        }
        btnFlashSpeak.setOnClickListener {
            val c = cards[cardIndex % cards.size]
            if (!TtsManager.speak(this, c.zh)) {
                VoiceGuide.showNoVoiceDialog(this)
            }
        }
        btnFlashNext.setOnClickListener {
            cardIndex++
            if (cardIndex >= cards.size) {
                cards = cards.shuffled()
                cardIndex = 0
            }
            showCard()
        }

        // --- Quiz ---
        val quizZh = findViewById<TextView>(R.id.quiz_zh)
        val quizScore = findViewById<TextView>(R.id.quiz_score)
        val optBtns = listOf(
            findViewById<Button>(R.id.quiz_opt_0),
            findViewById<Button>(R.id.quiz_opt_1),
            findViewById<Button>(R.id.quiz_opt_2),
            findViewById<Button>(R.id.quiz_opt_3)
        )
        val btnQuizNext = findViewById<Button>(R.id.btn_quiz_next)

        fun nextQuiz() {
            quizAnswered = false
            val correct = vocab.random()
            quizWord = correct
            val distractors = vocab.filter { it.zh != correct.zh }.shuffled().take(3)
            val options = (distractors + correct).shuffled()
            quizZh.text = correct.zh
            for ((i, b) in optBtns.withIndex()) {
                b.text = options[i].vi
                b.setBackgroundResource(R.drawable.bg_card)
                b.setOnClickListener {
                    if (quizAnswered) return@setOnClickListener
                    quizAnswered = true
                    total++
                    if (options[i].zh == correct.zh) {
                        score++
                        b.setBackgroundResource(R.drawable.bg_opt_correct)
                    } else {
                        b.setBackgroundResource(R.drawable.bg_opt_wrong)
                        optBtns.first { it.text == correct.vi }
                            .setBackgroundResource(R.drawable.bg_opt_correct)
                    }
                    quizScore.text = "Điểm: $score / $total"
                }
            }
            quizScore.text = "Điểm: $score / $total"
        }
        btnQuizNext.setOnClickListener { nextQuiz() }

        // --- Chuyển chế độ ---
        btnFlash.setOnClickListener {
            flashBox.visibility = View.VISIBLE
            quizBox.visibility = View.GONE
        }
        btnQuiz.setOnClickListener {
            flashBox.visibility = View.GONE
            quizBox.visibility = View.VISIBLE
            if (quizWord == null) nextQuiz()
        }
    }

    override fun onNavigateUp(): Boolean {
        finish()
        return true
    }
}
