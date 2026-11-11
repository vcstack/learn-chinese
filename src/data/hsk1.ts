import type { Vocab } from '../types';

/**
 * Nội dung HSK1: ngữ pháp + mẫu câu giao tiếp theo chủ đề.
 * Nguồn: bộ tài liệu HSK1 của Cương (7 tờ tổng hợp ngữ pháp & mẫu câu).
 * Mọi mục đều có chữ Hán (zh), pinyin (py), nghĩa tiếng Việt (vi) để
 * phát âm bằng expo-speech như các bài học hiện có.
 */

export interface GrammarLesson {
  id: number;
  title: string;
  /** Giải thích ngắn bằng tiếng Việt (1–2 câu). */
  explanation: string;
  examples: Vocab[];
}

export interface PatternTopic {
  id: number;
  title: string;
  patterns: Vocab[];
}

// ---------------------------------------------------------------------------
// Ngữ pháp HSK1 — 10 bài
// ---------------------------------------------------------------------------

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: 1,
    title: 'Trật tự câu cơ bản',
    explanation:
      'Câu tiếng Trung thường theo thứ tự Chủ ngữ + Động từ + Tân ngữ; trạng ngữ thời gian/địa điểm đứng trước động từ.',
    examples: [
      { zh: '我吃苹果.', py: 'Wǒ chī píngguǒ.', vi: 'Tôi ăn táo.' },
      { zh: '他看书.', py: 'Tā kàn shū.', vi: 'Anh ấy đọc sách.' },
      { zh: '我是学生.', py: 'Wǒ shì xuésheng.', vi: 'Tôi là học sinh.' },
      { zh: '我在学校.', py: 'Wǒ zài xuéxiào.', vi: 'Tôi ở trường.' },
      { zh: '我今天去学校.', py: 'Wǒ jīntiān qù xuéxiào.', vi: 'Hôm nay tôi đi học.' },
      { zh: '他在家看书.', py: 'Tā zài jiā kàn shū.', vi: 'Anh ấy ở nhà đọc sách.' },
    ],
  },
  {
    id: 2,
    title: 'Câu khẳng định, phủ định, câu hỏi 吗',
    explanation:
      'Phủ định dùng 不 (không), 不是 (không phải là), 没有 (không có); câu hỏi yes/no thêm 吗 ở cuối câu.',
    examples: [
      { zh: '我学习.', py: 'Wǒ xuéxí.', vi: 'Tôi học.' },
      { zh: '他很高.', py: 'Tā hěn gāo.', vi: 'Anh ấy rất cao.' },
      { zh: '我不喝咖啡.', py: 'Wǒ bù hē kāfēi.', vi: 'Tôi không uống cà phê.' },
      { zh: '她不忙.', py: 'Tā bù máng.', vi: 'Cô ấy không bận.' },
      { zh: '你是学生吗?', py: 'Nǐ shì xuésheng ma?', vi: 'Bạn là học sinh phải không?' },
      { zh: '他去学校吗?', py: 'Tā qù xuéxiào ma?', vi: 'Anh ấy đi học phải không?' },
    ],
  },
  {
    id: 3,
    title: 'Câu hỏi với từ nghi vấn',
    explanation:
      'Từ nghi vấn đứng đúng vị trí của từ được hỏi, không cần đảo ngữ như tiếng Anh.',
    examples: [
      { zh: '这是什么?', py: 'Zhè shì shénme?', vi: 'Đây là cái gì?' },
      { zh: '那是谁?', py: 'Nà shì shéi?', vi: 'Kia là ai?' },
      { zh: '你在哪儿?', py: 'Nǐ zài nǎr?', vi: 'Bạn ở đâu?' },
      { zh: '这个多少钱?', py: 'Zhège duōshao qián?', vi: 'Cái này bao nhiêu tiền?' },
      { zh: '现在几点?', py: 'Xiànzài jǐ diǎn?', vi: 'Bây giờ mấy giờ?' },
      { zh: '你怎么去?', py: 'Nǐ zěnme qù?', vi: 'Bạn đi bằng cách nào?' },
      { zh: '你为什么学习汉语?', py: 'Nǐ wèishénme xuéxí Hànyǔ?', vi: 'Tại sao bạn học tiếng Trung?' },
    ],
  },
  {
    id: 4,
    title: 'Động từ năng nguyện 想, 要, 会, 能',
    explanation:
      '想 là muốn, 要 là cần/muốn, 会 là biết/có thể (kỹ năng đã học), 能 là có thể (điều kiện cho phép).',
    examples: [
      { zh: '我想喝水.', py: 'Wǒ xiǎng hē shuǐ.', vi: 'Tôi muốn uống nước.' },
      { zh: '我要一杯咖啡.', py: 'Wǒ yào yì bēi kāfēi.', vi: 'Tôi muốn một ly cà phê.' },
      { zh: '我会说汉语.', py: 'Wǒ huì shuō Hànyǔ.', vi: 'Tôi biết nói tiếng Trung.' },
      { zh: '我能去吗?', py: 'Wǒ néng qù ma?', vi: 'Tôi có thể đi không?' },
    ],
  },
  {
    id: 5,
    title: 'Tính từ',
    explanation:
      'Tính từ đứng sau 很 (rất) hoặc 不 (không); 一点儿 nghĩa là hơi.',
    examples: [
      { zh: '他很高.', py: 'Tā hěn gāo.', vi: 'Anh ấy rất cao.' },
      { zh: '她不忙.', py: 'Tā bù máng.', vi: 'Cô ấy không bận.' },
      { zh: '我有一点儿累.', py: 'Wǒ yǒu yìdiǎnr lèi.', vi: 'Tôi hơi mệt.' },
      { zh: '这个很漂亮.', py: 'Zhège hěn piàoliang.', vi: 'Cái này rất đẹp.' },
    ],
  },
  {
    id: 6,
    title: 'Từ chỉ thời gian và địa điểm',
    explanation:
      'Từ chỉ thời gian (今天, 明天, 昨天, 现在...) và địa điểm (在, 上, 下, 里, 前, 后...) thường đứng trước động từ.',
    examples: [
      { zh: '我今天在学校学习.', py: 'Wǒ jīntiān zài xuéxiào xuéxí.', vi: 'Hôm nay tôi học ở trường.' },
      { zh: '书在桌子上.', py: 'Shū zài zhuōzi shàng.', vi: 'Sách ở trên bàn.' },
      { zh: '我在家里.', py: 'Wǒ zài jiā lǐ.', vi: 'Tôi ở trong nhà.' },
    ],
  },
  {
    id: 7,
    title: 'Lượng từ',
    explanation:
      'Danh từ tiếng Trung thường đi kèm lượng từ, dạng Số + Lượng từ + Danh từ.',
    examples: [
      { zh: '一个人', py: 'yí gè rén', vi: 'một người.' },
      { zh: '一本书', py: 'yì běn shū', vi: 'một quyển sách.' },
      { zh: '一张纸', py: 'yì zhāng zhǐ', vi: 'một tờ giấy.' },
      { zh: '一杯水', py: 'yì bēi shuǐ', vi: 'một ly nước.' },
      { zh: '一块钱', py: 'yí kuài qián', vi: 'một đồng.' },
      { zh: '一只猫', py: 'yì zhī māo', vi: 'một con mèo.' },
      { zh: '一件衣服', py: 'yí jiàn yīfu', vi: 'một cái áo.' },
      { zh: '一部手机', py: 'yí bù shǒujī', vi: 'một chiếc điện thoại.' },
    ],
  },
  {
    id: 8,
    title: 'Câu so sánh',
    explanation:
      'A 比 B + Tính từ nghĩa là A hơn B; A 没有 B + Tính từ nghĩa là A không bằng B.',
    examples: [
      { zh: '他比我高.', py: 'Tā bǐ wǒ gāo.', vi: 'Anh ấy cao hơn tôi.' },
      { zh: '我没有他高.', py: 'Wǒ méiyǒu tā gāo.', vi: 'Tôi không cao bằng anh ấy.' },
      { zh: '这个比那个贵.', py: 'Zhège bǐ nàge guì.', vi: 'Cái này đắt hơn cái kia.' },
    ],
  },
  {
    id: 9,
    title: 'Cấu trúc hữu ích',
    explanation: 'Các cấu trúc nối câu thường gặp ở trình độ HSK1.',
    examples: [
      { zh: '因为下雨, 所以我不去.', py: 'Yīnwèi xià yǔ, suǒyǐ wǒ bú qù.', vi: 'Vì trời mưa nên tôi không đi.' },
      { zh: '我学习的时候, 他在看书.', py: 'Wǒ xuéxí de shíhou, tā zài kàn shū.', vi: 'Khi tôi học, anh ấy đang đọc sách.' },
      { zh: '除了汉语, 我还学英语.', py: 'Chúle Hànyǔ, wǒ hái xué Yīngyǔ.', vi: 'Ngoài tiếng Trung, tôi còn học tiếng Anh.' },
      { zh: '越学越有意思.', py: 'Yuè xué yuè yǒu yìsi.', vi: 'Càng học càng thú vị.' },
      { zh: '她又漂亮又聪明.', py: 'Tā yòu piàoliang yòu cōngming.', vi: 'Cô ấy vừa đẹp vừa thông minh.' },
    ],
  },
  {
    id: 10,
    title: 'Cách diễn đạt khác',
    explanation:
      '有 (có), 是...的 (nhấn mạnh), 已经 (đã), 了 (hoàn thành/thay đổi), 用 (dùng), 坐 (đi bằng phương tiện).',
    examples: [
      { zh: '我有一支笔.', py: 'Wǒ yǒu yì zhī bǐ.', vi: 'Tôi có một cây bút.' },
      { zh: '我是中国人.', py: 'Wǒ shì Zhōngguó rén.', vi: 'Tôi là người Trung Quốc.' },
      { zh: '我已经吃了.', py: 'Wǒ yǐjīng chī le.', vi: 'Tôi đã ăn rồi.' },
      { zh: '我用筷子吃饭.', py: 'Wǒ yòng kuàizi chī fàn.', vi: 'Tôi dùng đũa ăn cơm.' },
      { zh: '我坐地铁去学校.', py: 'Wǒ zuò dìtiě qù xuéxiào.', vi: 'Tôi đi tàu điện ngầm đến trường.' },
      { zh: '我们一起去吧!', py: 'Wǒmen yìqǐ qù ba!', vi: 'Chúng ta cùng đi nhé!' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Mẫu câu giao tiếp theo chủ đề — 12 chủ đề, mỗi chủ đề 4 mẫu câu
// ---------------------------------------------------------------------------

export const PATTERN_TOPICS: PatternTopic[] = [
  {
    id: 1,
    title: 'Giới thiệu bản thân',
    patterns: [
      { zh: '我叫......', py: 'Wǒ jiào......', vi: 'Tôi tên là......' },
      { zh: '我是学生.', py: 'Wǒ shì xuésheng.', vi: 'Tôi là học sinh.' },
      { zh: '我今年......岁.', py: 'Wǒ jīnnián......suì.', vi: 'Năm nay tôi......tuổi.' },
      { zh: '我来自......', py: 'Wǒ láizì......', vi: 'Tôi đến từ......' },
    ],
  },
  {
    id: 2,
    title: 'Gia đình',
    patterns: [
      { zh: '我有一个......', py: 'Wǒ yǒu yí gè......', vi: 'Tôi có một......' },
      { zh: '这是我的爸爸.', py: 'Zhè shì wǒ de bàba.', vi: 'Đây là bố tôi.' },
      { zh: '这是我的妈妈.', py: 'Zhè shì wǒ de māma.', vi: 'Đây là mẹ tôi.' },
      { zh: '我家有......口人.', py: 'Wǒ jiā yǒu......kǒu rén.', vi: 'Nhà tôi có......người.' },
    ],
  },
  {
    id: 3,
    title: 'Trường học và học tập',
    patterns: [
      { zh: '我在......学习.', py: 'Wǒ zài......xuéxí.', vi: 'Tôi học ở......' },
      { zh: '我学汉语.', py: 'Wǒ xué Hànyǔ.', vi: 'Tôi học tiếng Trung.' },
      { zh: '我喜欢学习.', py: 'Wǒ xǐhuan xuéxí.', vi: 'Tôi thích học.' },
      { zh: '我每天学习......小时.', py: 'Wǒ měitiān xuéxí......xiǎoshí.', vi: 'Mỗi ngày tôi học......giờ.' },
    ],
  },
  {
    id: 4,
    title: 'Công việc',
    patterns: [
      { zh: '我是一名老师.', py: 'Wǒ shì yì míng lǎoshī.', vi: 'Tôi là một giáo viên.' },
      { zh: '他在公司工作.', py: 'Tā zài gōngsī gōngzuò.', vi: 'Anh ấy làm việc ở công ty.' },
      { zh: '我每天上班.', py: 'Wǒ měitiān shàngbān.', vi: 'Mỗi ngày tôi đi làm.' },
      { zh: '我喜欢我的工作.', py: 'Wǒ xǐhuan wǒ de gōngzuò.', vi: 'Tôi thích công việc của mình.' },
    ],
  },
  {
    id: 5,
    title: 'Sở thích',
    patterns: [
      { zh: '我喜欢......', py: 'Wǒ xǐhuan......', vi: 'Tôi thích......' },
      { zh: '我不喜欢......', py: 'Wǒ bù xǐhuan......', vi: 'Tôi không thích......' },
      { zh: '我喜欢看书.', py: 'Wǒ xǐhuan kàn shū.', vi: 'Tôi thích đọc sách.' },
      { zh: '我喜欢运动.', py: 'Wǒ xǐhuan yùndòng.', vi: 'Tôi thích thể thao.' },
    ],
  },
  {
    id: 6,
    title: 'Ăn uống',
    patterns: [
      { zh: '我喜欢吃......', py: 'Wǒ xǐhuan chī......', vi: 'Tôi thích ăn......' },
      { zh: '我不吃......', py: 'Wǒ bù chī......', vi: 'Tôi không ăn......' },
      { zh: '我喝......', py: 'Wǒ hē......', vi: 'Tôi uống......' },
      { zh: '我想喝水.', py: 'Wǒ xiǎng hē shuǐ.', vi: 'Tôi muốn uống nước.' },
    ],
  },
  {
    id: 7,
    title: 'Mua sắm',
    patterns: [
      { zh: '这个多少钱?', py: 'Zhège duōshao qián?', vi: 'Cái này bao nhiêu tiền?' },
      { zh: '我想买......', py: 'Wǒ xiǎng mǎi......', vi: 'Tôi muốn mua......' },
      { zh: '我买一件......', py: 'Wǒ mǎi yí jiàn......', vi: 'Tôi mua một......' },
      { zh: '有......吗?', py: 'Yǒu......ma?', vi: 'Có......không?' },
    ],
  },
  {
    id: 8,
    title: 'Đi lại',
    patterns: [
      { zh: '我去学校.', py: 'Wǒ qù xuéxiào.', vi: 'Tôi đi học.' },
      { zh: '我坐地铁去.', py: 'Wǒ zuò dìtiě qù.', vi: 'Tôi đi tàu điện ngầm.' },
      { zh: '我坐公交车.', py: 'Wǒ zuò gōngjiāochē.', vi: 'Tôi đi xe buýt.' },
      { zh: '我步行去.', py: 'Wǒ bùxíng qù.', vi: 'Tôi đi bộ.' },
    ],
  },
  {
    id: 9,
    title: 'Thời gian',
    patterns: [
      { zh: '现在几点?', py: 'Xiànzài jǐ diǎn?', vi: 'Bây giờ mấy giờ?' },
      { zh: '今天是星期......', py: 'Jīntiān shì xīngqī......', vi: 'Hôm nay là thứ......' },
      { zh: '明天......', py: 'Míngtiān......', vi: 'Ngày mai......' },
      { zh: '我......去......', py: 'Wǒ......qù......', vi: 'Tôi......đi......' },
    ],
  },
  {
    id: 10,
    title: 'Thời tiết',
    patterns: [
      { zh: '今天天气怎么样?', py: 'Jīntiān tiānqì zěnmeyàng?', vi: 'Hôm nay thời tiết thế nào?' },
      { zh: '今天天气很好.', py: 'Jīntiān tiānqì hěn hǎo.', vi: 'Hôm nay thời tiết rất tốt.' },
      { zh: '今天很热.', py: 'Jīntiān hěn rè.', vi: 'Hôm nay rất nóng.' },
      { zh: '今天下雨了.', py: 'Jīntiān xià yǔ le.', vi: 'Hôm nay trời mưa rồi.' },
    ],
  },
  {
    id: 11,
    title: 'Sức khỏe',
    patterns: [
      { zh: '你昨天好吗?', py: 'Nǐ zuótiān hǎo ma?', vi: 'Hôm qua bạn khỏe không?' },
      { zh: '我有点累.', py: 'Wǒ yǒudiǎn lèi.', vi: 'Tôi hơi mệt.' },
      { zh: '我生病了.', py: 'Wǒ shēngbìng le.', vi: 'Tôi bị ốm rồi.' },
      { zh: '你要多休息.', py: 'Nǐ yào duō xiūxi.', vi: 'Bạn cần nghỉ ngơi nhiều.' },
    ],
  },
  {
    id: 12,
    title: 'Lời mời và đề nghị',
    patterns: [
      { zh: '我们一起去......吧!', py: 'Wǒmen yìqǐ qù......ba!', vi: 'Chúng ta cùng đi......nhé!' },
      { zh: '你想喝咖啡吗?', py: 'Nǐ xiǎng hē kāfēi ma?', vi: 'Bạn muốn uống cà phê không?' },
      { zh: '我们去看电影, 好吗?', py: 'Wǒmen qù kàn diànyǐng, hǎo ma?', vi: 'Chúng ta đi xem phim nhé?' },
      { zh: '好的!', py: 'Hǎo de!', vi: 'Được!' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getGrammarById(id: number): GrammarLesson | undefined {
  return GRAMMAR_LESSONS.find((g) => g.id === id);
}

export function getPatternTopicById(id: number): PatternTopic | undefined {
  return PATTERN_TOPICS.find((t) => t.id === id);
}

/** Tổng số ví dụ ngữ pháp + mẫu câu giao tiếp. */
export function getHsk1Totals(): { grammarLessons: number; grammarExamples: number; topics: number; patterns: number } {
  return {
    grammarLessons: GRAMMAR_LESSONS.length,
    grammarExamples: GRAMMAR_LESSONS.reduce((n, g) => n + g.examples.length, 0),
    topics: PATTERN_TOPICS.length,
    patterns: PATTERN_TOPICS.reduce((n, t) => n + t.patterns.length, 0),
  };
}
