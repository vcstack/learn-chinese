import * as Notifications from 'expo-notifications';
import { getRandomVocab } from '../data/lessons';
import type { ReminderInterval } from '../types';

/**
 * Nhắc học bằng expo-notifications.
 *
 * Một thông báo lặp lại sẽ luôn hiện cùng một nội dung, nên để mỗi lần nhắc
 * là một từ khác nhau, app lên lịch trước một loạt thông báo theo giờ (mỗi
 * cái một từ ngẫu nhiên) và tự "nạp thêm" mỗi khi mở app. Vì vậy danh sách
 * nhắc chỉ duy trì trong ~1 ngày tới — mở app là được nạp lại.
 */

const KEEP_AHEAD = 12; // luôn giữ sẵn 12 lần nhắc tới
const CHANNEL_ID = 'hoc-tieng-trung';

let handlerSet = false;

/** Cấu hình handler thông báo — gọi một lần khi app khởi động. */
export function setupNotifications(): void {
  if (handlerSet) return;
  handlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Hủy toàn bộ lịch nhắc đã lên. */
export async function cancelReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function vocabContent() {
  const w = getRandomVocab();
  return {
    title: w.zh,
    body: `${w.py} • ${w.vi}`,
    data: { type: 'vocab', zh: w.zh },
  };
}

/**
 * Lên lịch nhắc học mỗi `hours` giờ. hours = 0 nghĩa là tắt.
 * Giữ sẵn KEEP_AHEAD lần nhắc tới, mỗi lần một từ ngẫu nhiên khác nhau.
 */
export async function ensureReminders(hours: ReminderInterval): Promise<void> {
  setupNotifications();
  await cancelReminders();
  if (hours === 0) return;

  const granted = await requestPermission();
  if (!granted) return;

  const intervalMs = hours * 60 * 60 * 1000;
  const now = Date.now();
  for (let i = 0; i < KEEP_AHEAD; i++) {
    const at = new Date(now + intervalMs * (i + 1));
    await Notifications.scheduleNotificationAsync({
      content: vocabContent(),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: at,
        channelId: CHANNEL_ID,
      },
    });
  }
}

/** Gửi thử ngay 1 từ vựng lên thanh thông báo. */
export async function sendTestWord(): Promise<boolean> {
  setupNotifications();
  const granted = await requestPermission();
  if (!granted) return false;
  await Notifications.scheduleNotificationAsync({
    content: vocabContent(),
    trigger: null,
  });
  return true;
}
