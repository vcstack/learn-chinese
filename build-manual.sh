#!/usr/bin/env bash
# Build thủ công app Học Tiếng Trung (không cần Gradle).
# Dùng khi máy không build được bằng Gradle (vd: mạng chặn Gradle daemon).
# Yêu cầu: JDK 17, Android SDK (platform 34 + build-tools 34.0.0), kotlinc.
#
# Cách dùng:
#   export JAVA_HOME=/đường/dẫn/jdk17
#   export ANDROID_HOME=/đường/dẫn/android-sdk
#   export KOTLINC_HOME=/đường/dẫn/kotlinc
#   ./build-manual.sh
#
# Kết quả: HocTiengTrung-v1.apk (đã ký bằng release.keystore tự tạo lần đầu).
set -e
cd "$(dirname "$0")"

: "${JAVA_HOME:?cần đặt JAVA_HOME}"
: "${ANDROID_HOME:?cần đặt ANDROID_HOME}"
: "${KOTLINC_HOME:?cần đặt KOTLINC_HOME}"
export PATH="$JAVA_HOME/bin:$PATH"
export _JAVA_OPTIONS="-Xmx768m"

BT="$ANDROID_HOME/build-tools/34.0.0"
AJAR="$ANDROID_HOME/platforms/android-34/android.jar"
AAPT2="$BT/aapt2"

mkdir -p build/compiled_res build/gen build/classes build/dex

echo "== aapt2 compile =="
"$AAPT2" compile --dir app/src/main/res -o build/compiled_res.zip

echo "== aapt2 link =="
"$AAPT2" link -o build/base.apk \
  -I "$AJAR" \
  --manifest app/src/main/AndroidManifest.xml \
  --java build/gen \
  -A app/src/main/assets \
  --min-sdk-version 24 \
  --target-sdk-version 34 \
  --version-code 1 \
  --version-name 1.0 \
  build/compiled_res.zip --auto-add-overlay

echo "== kotlinc =="
"$KOTLINC_HOME/bin/kotlinc" \
  -cp "$AJAR" -d build/classes \
  $(find app/src/main/java -name "*.kt") \
  build/gen/com/cuong/hoctiengtrung/R.java

echo "== jar classes =="
(cd build/classes && jar cf ../app-classes.jar .)

echo "== d8 =="
"$BT/d8" --lib "$AJAR" --release --output build/dex \
  build/app-classes.jar "$KOTLINC_HOME/lib/kotlin-stdlib.jar"

echo "== package + zipalign =="
cp build/base.apk build/unsigned.apk
(cd build/dex && zip -q ../unsigned.apk classes.dex)
"$BT/zipalign" -f 4 build/unsigned.apk build/aligned.apk

echo "== sign =="
if [ ! -f release.keystore ]; then
  keytool -genkeypair -keystore release.keystore -alias cuong \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass cuong123 -keypass cuong123 \
    -dname "CN=Cuong, OU=HocTiengTrung, O=Personal, C=VN"
fi
"$BT/apksigner" sign --ks release.keystore \
  --ks-pass pass:cuong123 --key-pass pass:cuong123 \
  --out HocTiengTrung-v1.apk build/aligned.apk

echo "== verify =="
"$BT/apksigner" verify HocTiengTrung-v1.apk
"$AAPT2" dump badging HocTiengTrung-v1.apk | head -6
ls -la HocTiengTrung-v1.apk
