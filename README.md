# Học Tiếng Trung

App Android học tiếng Trung giao tiếp (20 bài đầu).

## Tải về

Tải file APK bản mới nhất ở [Releases](https://github.com/vcstack/learn-chinese/releases) — bản **v1.1** (`HocTiengTrung-v1.1.apk`). Cài đè lên bản cũ được, không cần gỡ.

## Tính năng

- **20 bài học**: mỗi bài có Từ vựng, Câu mẫu, Hội thoại — chữ Hán + pinyin + nghĩa tiếng Việt.
- **Phát âm**: nút 🔊 ở mọi từ/câu/đoạn hội thoại, dùng TextToSpeech tiếng Trung của máy (cần cài giọng tiếng Trung của Google TTS). Có nút chuyển tốc độ Chậm / Vừa, và nút "Nghe cả đoạn".
- **Luyện nói**: Flashcard (nhìn nghĩa tiếng Việt, tự nói rồi bấm hiện đáp án để kiểm tra) và Trắc nghiệm (chọn nghĩa đúng).
- **Nhắc học**: AlarmManager gửi thông báo từ vựng ngẫu nhiên theo giờ (mặc định 2 giờ, chỉnh trong Cài đặt: 1/2/4 giờ hoặc tắt). Thông báo có nút "Nghe" để phát âm ngay.
- **Widget màn hình chính**: hiện 1 từ vựng, nút 🔊 nghe phát âm, nút ↻ đổi từ khác, chạm vào mở app.

App chỉ dùng API có sẵn của Android + Kotlin stdlib, **không dùng thêm thư viện ngoài** nên build nhanh và ít lỗi.

## Có gì mới ở v1.1

- Làm lại giao diện chuyên nghiệp: màn hình chính có banner gradient xanh + thống kê, bài học dạng thẻ, nút Nghe tròn xanh, flashcard/trắc nghiệm/cài đặt dạng thẻ.
- Sửa lỗi nút Nghe không phát ra tiếng: app thử nhiều giọng tiếng Trung (zh_CN, zh, zh_TW, zh_HK, zh_SG); nếu máy chưa có giọng tiếng Trung thì hiện banner + hộp thoại hướng dẫn cài giọng Google TTS (thường gặp trên máy Xiaomi/MIUI).

## Bản React Native

Ngoài bản Android native này, còn có bản viết lại bằng **React Native (Expo)** với theme React Native Paper (Material Design 3) — xem ở branch [`react-native`](https://github.com/vcstack/learn-chinese/tree/react-native). Bản React Native có đủ 20 bài, phát âm, luyện nói, nhắc học nhưng **không có widget màn hình chính** (Expo managed workflow không hỗ trợ widget).

## Dữ liệu bài học

- File gốc: `data/lessons.json` (20 bài, 200 từ vựng, 100 câu mẫu, 110 dòng hội thoại).
- File này được copy vào `app/src/main/assets/lessons.json` khi build.

**Thêm bài mới**: sửa `data/lessons.json` theo đúng cấu trúc cũ (id, title, titleVi, vocab/sentences/dialogue, mỗi mục có zh/py/vi), copy đè vào `app/src/main/assets/lessons.json`, rồi build lại.

## Build bằng Gradle (máy thường / Android Studio)

Cần JDK 17 + Android SDK (platform 34, build-tools 34.0.0).

```bash
./gradlew assembleDebug
```

APK ở `app/build/outputs/apk/debug/app-debug.apk`.

## Build thủ công (không cần Gradle)

Nếu máy không chạy được Gradle, dùng script `build-manual.sh` (dùng aapt2 + kotlinc + d8 có sẵn trong SDK):

```bash
export JAVA_HOME=/đường/dẫn/jdk17
export ANDROID_HOME=/đường/dẫn/android-sdk
export KOTLINC_HOME=/đường/dẫn/kotlinc
./build-manual.sh
```

Kết quả: `HocTiengTrung-v1.1.apk` (đã ký). Lần đầu chạy sẽ tự tạo `release.keystore` — **giữ file này cẩn thận, cần nó để ký các bản cập nhật sau** (Android yêu cầu cùng một key cho bản update).

## Cài lên máy

1. Chép file APK vào điện thoại, mở lên và cho phép "Cài đặt từ nguồn không xác định".
2. Mở app, cho phép quyền Thông báo để nhận từ vựng nhắc học.
3. Kiểm tra giọng tiếng Trung: Cài đặt trong app → nếu báo chưa có giọng, bấm "Mở cài đặt giọng đọc hệ thống" để cài giọng Google TTS tiếng Trung.
4. Thêm widget: nhấn giữ màn hình chính → Widget → "Từ vựng tiếng Trung".
