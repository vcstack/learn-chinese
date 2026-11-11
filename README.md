# Học Tiếng Trung — React Native (Expo)

App học tiếng Trung: 20 bài học (200 từ vựng, 100 câu mẫu, 110 dòng hội
thoại), phát âm TTS, luyện nói (flashcard + trắc nghiệm + luyện nghe),
nhắc học bằng thông báo. Thêm ngữ pháp HSK1 (10 bài, 52 ví dụ) và mẫu
câu giao tiếp (12 chủ đề, 48 mẫu câu). Bản viết lại bằng React Native
của app Android native v1.1.

## Tính năng

- **Màn hình chính**: danh sách 20 bài học dạng thẻ, header gradient xanh lá
  với thống kê 20 bài • 200 từ • 100 câu. Thêm card thống kê học tập
  (chuỗi ngày liên tiếp, ngày đã học, lượt đã luyện, bài đã mở), card
  "Ôn tập hôm nay", card "Từ yêu thích", card "Ngữ pháp HSK1" và card
  "Mẫu câu giao tiếp".
- **Chi tiết bài học**: từ vựng, câu mẫu, hội thoại — mỗi dòng có chữ Hán,
  pinyin, nghĩa tiếng Việt và nút nghe phát âm. Nút "Nghe cả đoạn",
  "Luyện nói", đổi tốc độ đọc (chậm/vừa/nhanh).
- **Phát âm**: dùng `expo-speech`. App tự quét giọng tiếng Trung có sẵn trên
  máy (`getAvailableVoicesAsync`); nếu máy chưa có giọng (thường gặp trên
  Xiaomi/MIUI) thì hiện banner/hộp thoại hướng dẫn cài giọng Google TTS thay
  vì im lặng.
- **Luyện nói**: Flashcard (hiện nghĩa tiếng Việt → hiện đáp án chữ Hán +
  pinyin + nút nghe), Trắc nghiệm (chọn nghĩa đúng trong 4 đáp án, tính
  điểm) và Luyện nghe (nghe phát âm rồi chọn nghĩa tiếng Việt hoặc chữ
  Hán đúng trong 4 đáp án, 2 dạng câu hỏi luân phiên).
- **Từ yêu thích**: bấm sao ⭐ ở bất kỳ dòng từ vựng/câu mẫu/hội thoại nào
  để lưu; màn hình "Từ yêu thích" xem lại toàn bộ, mỗi dòng có nút nghe
  và nút bỏ lưu.
- **Chuỗi ngày học + thống kê**: mở app mỗi ngày ghi nhận 1 ngày; học liên
  tiếp thì streak +1, nghỉ quá 1 ngày thì reset về 1. Hiện trên màn hình
  chính: ngày liên tiếp, ngày đã học, lượt đã luyện, bài đã mở.
- **Ôn tập lặp lại ngắt quãng (SRS)**: mỗi từ có mức nhớ 0–5 và ngày ôn
  tiếp theo (đúng: +1 mức, dời lịch 1/2/4/7/14/30 ngày; sai: về mức 0,
  ôn lại hôm nay). Màn hình "Ôn tập hôm nay" mở flashcard chỉ với các từ
  đến hạn, bấm "Nhớ rồi" / "Chưa nhớ" để ghi lại.
- **Ngữ pháp HSK1**: 10 bài (trật tự câu, khẳng định/phủ định/câu hỏi 吗,
  từ nghi vấn, động từ năng nguyện, tính từ, thời gian & địa điểm, lượng
  từ, câu so sánh, cấu trúc hữu ích, cách diễn đạt khác), mỗi bài có giải
  thích tiếng Việt + ví dụ có nút nghe.
- **Mẫu câu giao tiếp**: 12 chủ đề (giới thiệu bản thân, gia đình, trường
  học, công việc, sở thích, ăn uống, mua sắm, đi lại, thời gian, thời
  tiết, sức khỏe, lời mời), mỗi chủ đề 4 mẫu câu có nút nghe.
- **Nhắc học**: `expo-notifications` lên lịch thông báo mỗi 1/2/4 giờ (mặc
  định 2 giờ, đổi được trong Cài đặt), mỗi lần nhắc là một từ vựng ngẫu nhiên
  khác nhau (chữ Hán + pinyin + nghĩa).
- **Cài đặt**: chọn khoảng nhắc học, gửi thử 1 từ, kiểm tra trạng thái giọng
  tiếng Trung, nút cài giọng / mở cài đặt TTS hệ thống.

## Giao diện

Dùng **React Native Paper (Material Design 3)** với custom theme xanh lá
(`src/theme.ts` — màu chủ đạo `#15803D`, dùng đúng hệ thống
`colors.primary / secondary / surface / onSurface` của Paper). Các màn hình
dùng Appbar, Card, Button, FAB (nút nghe tròn xanh lá), Chip, List,
SegmentedButtons, RadioButton, Banner, Dialog, Snackbar của Paper — đồng bộ
toàn app, không hard-code màu lung tung.

## Chạy thử

```bash
npm install
npx expo start
```

Mở bằng **Expo Go** trên điện thoại (quét mã QR). Lưu ý: sau khi thêm thư
viện native (`expo-speech`, `expo-notifications`), Expo Go có thể không đủ
module — lúc đó cần build bản dev (`eas build --profile development`) rồi
cài file dev build lên máy.

## Build APK bằng EAS (cloud)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

File APK tải về từ trang build của EAS. Lần đầu cần chạy `eas build:configure`
để tạo `eas.json` (chưa có sẵn trong repo).

> **Giới hạn:** build APK **không chạy được trên máy dev hiện tại** vì Gradle
> bị chặn (sandbox chặn kết nối TCP của Java nên daemon Gradle không giao
> tiếp được). Vì vậy dùng EAS cloud build hoặc build trên máy của bạn
> (cần Android Studio + JDK).

## Lưu ý

- **Widget màn hình chính không hỗ trợ trong Expo managed workflow.** App
  native cũ có widget hiện từ vựng; bản React Native này không có widget
  (muốn có widget phải chuyển sang bare workflow + viết native module,
  nằm ngoài phạm vi bản này).
- **Nhắc học:** Expo không có AlarmManager như Android native. App lên lịch
  trước 12 lần nhắc tới (mỗi lần một từ khác nhau) và tự nạp thêm mỗi khi
  mở app. Nếu lâu không mở app, lịch nhắc sẽ hết sau ~1 ngày (ở mức nhắc
  mỗi 2 giờ) — mở app là được nạp lại.
- **Phát âm:** chất lượng giọng phụ thuộc giọng TTS tiếng Trung trên máy.
  Muốn giọng chuẩn cố định thì cần gen file MP3 cho 200 từ + 100 câu
  (bước sau, không chặn bản này).

## Cấu trúc

```
App.tsx                    Entry: PaperProvider + Navigation (stack)
src/
  theme.ts                 Theme MD3 tùy chỉnh (Paper) + navigation theme
  types.ts                 Kiểu dữ liệu bài học, tốc độ đọc, khoảng nhắc,
                           thống kê học tập, SRS
  data/lessons.ts          Nạp assets/lessons.json + hàm tiện ích
  data/hsk1.ts             Ngữ pháp HSK1 (10 bài) + mẫu câu giao tiếp
                           (12 chủ đề)
  storage.ts               Lưu cài đặt + yêu thích + thống kê + SRS
                           (AsyncStorage)
  speech/tts.ts            Phát âm expo-speech + kiểm tra giọng Trung
  notifications/
    reminders.ts           Lên lịch / hủy / gửi thử thông báo nhắc học
  components/
    SpeakFab.tsx           Nút nghe tròn xanh lá (Paper FAB)
    EntryRow.tsx           Dòng từ vựng / câu mẫu / hội thoại
    VoiceBanner.tsx        Banner cảnh báo chưa có giọng Trung
    NoVoiceDialog.tsx      Hộp thoại hướng dẫn cài giọng
    PaperHeader.tsx        Header stack bằng Paper Appbar
  screens/
    HomeScreen.tsx         Danh sách 20 bài + hero gradient + thống kê
                           + ôn tập + yêu thích + ngữ pháp + mẫu câu
    LessonScreen.tsx       Chi tiết bài học
    PracticeScreen.tsx     Flashcard + trắc nghiệm + luyện nghe
    FavoritesScreen.tsx    Danh sách từ yêu thích
    ReviewScreen.tsx       Ôn tập hôm nay (flashcard SRS)
    GrammarScreen.tsx      Ngữ pháp HSK1 (danh sách + chi tiết)
    PatternsScreen.tsx     Mẫu câu giao tiếp theo chủ đề
    SettingsScreen.tsx     Cài đặt nhắc học + giọng đọc
assets/
  lessons.json             20 bài học (giữ nguyên từ app native)
```
