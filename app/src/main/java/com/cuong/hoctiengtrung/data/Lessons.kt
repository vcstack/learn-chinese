package com.cuong.hoctiengtrung.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class Word(val zh: String, val py: String, val vi: String)
data class Sentence(val zh: String, val py: String, val vi: String)
data class DialogueLine(val sp: String, val zh: String, val py: String, val vi: String)
data class Lesson(
    val id: Int,
    val title: String,
    val titleVi: String,
    val vocab: List<Word>,
    val sentences: List<Sentence>,
    val dialogue: List<DialogueLine>
)

object LessonRepo {
    private var cached: List<Lesson>? = null

    fun load(context: Context): List<Lesson> {
        cached?.let { return it }
        val json = context.assets.open("lessons.json").bufferedReader(Charsets.UTF_8).use { it.readText() }
        val root = JSONObject(json)
        val arr = root.getJSONArray("lessons")
        val list = ArrayList<Lesson>(arr.length())
        for (i in 0 until arr.length()) {
            list.add(parseLesson(arr.getJSONObject(i)))
        }
        cached = list
        return list
    }

    private fun parseLesson(o: JSONObject): Lesson {
        fun words(a: JSONArray): List<Word> {
            val out = ArrayList<Word>(a.length())
            for (i in 0 until a.length()) {
                val w = a.getJSONObject(i)
                out.add(Word(w.getString("zh"), w.getString("py"), w.getString("vi")))
            }
            return out
        }
        fun sentences(a: JSONArray): List<Sentence> {
            val out = ArrayList<Sentence>(a.length())
            for (i in 0 until a.length()) {
                val s = a.getJSONObject(i)
                out.add(Sentence(s.getString("zh"), s.getString("py"), s.getString("vi")))
            }
            return out
        }
        fun dialogue(a: JSONArray): List<DialogueLine> {
            val out = ArrayList<DialogueLine>(a.length())
            for (i in 0 until a.length()) {
                val d = a.getJSONObject(i)
                out.add(DialogueLine(d.getString("sp"), d.getString("zh"), d.getString("py"), d.getString("vi")))
            }
            return out
        }
        return Lesson(
            id = o.getInt("id"),
            title = o.getString("title"),
            titleVi = o.getString("titleVi"),
            vocab = words(o.getJSONArray("vocab")),
            sentences = sentences(o.getJSONArray("sentences")),
            dialogue = dialogue(o.getJSONArray("dialogue"))
        )
    }

    /** Tất cả từ vựng kèm id bài học chứa nó. */
    fun allWords(context: Context): List<Pair<Word, Int>> {
        val out = ArrayList<Pair<Word, Int>>()
        for (lesson in load(context)) {
            for (w in lesson.vocab) out.add(w to lesson.id)
        }
        return out
    }

    fun randomWord(context: Context): Pair<Word, Int> {
        val all = allWords(context)
        return all[(Math.random() * all.size).toInt()]
    }
}
