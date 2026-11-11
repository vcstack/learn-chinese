# Học Tiếng Trung — React Native (Expo)

App học tiếng Trung: 20 bài học (200 từ vựng, 100 câu mẫu, 110 dòng hội
thoại), phát âm TTS, luyện nói (flashcard + trắc nghiệm), nhắc học bằng
thông báo. Bản viết lại bằng React Native của app Android native v1.1.

## Tính năng

- **Màn hình chính**: danh sách 20 bài học dạng thẻ, header gradient xanh lá
  với thống kê 20 bài • 200 từ • 100 câu.
- **Chi tiết bài học**: từ vựng, câu mẫu, hội thoại — mỗi dòng có chữ Hán,
  pinyin, nghĩa tiếng Việt và nút nghe phát âm. Nút "Nghe cả đoạn",
  "Luyện nói", đổi tốc độ đọc (chậm/vừa/nhanh).
- **Phát âm**: dùng `expo-speech`. App tự quét giọng tiếng Trung có sẵn trên
  máy (`getAvailableVoicesAsync`); nếu máy chưa có giọng (thường gặp trên
  Xiaomi/MIUI) thì hiện banner/hộp thoại hướng dẫn cài giọng Google TTS thay
  vì im lặng.
- **Luyện nói**: Flashcard (hiện nghĩa tiếng Việt → hiện đáp án chữ Hán +
  pinyin + nút nghe) và Trắc nghiệm (chọn nghĩa đúng trong 4 đáp án, tính
  điểm).
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
  types.ts                 Kiểu dữ liệu bài học, tốc độ đọc, khoảng nhắc
  data/lessons.ts          Nạp assets/lessons.json + hàm tiện ích
  storage.ts               Lưu cài đặt (AsyncStorage)
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
    HomeScreen.tsx         Danh sách 20 bài + hero gradient
    LessonScreen.tsx       Chi tiết bài học
    PracticeScreen.tsx     Flashcard + trắc nghiệm
    SettingsScreen.tsx     Cài đặt nhắc học + giọng đọc
assets/
  lessons.json             20 bài học (giữ nguyên từ app native)
```
