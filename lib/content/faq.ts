// lib/content/faq.ts
import type { Locale } from '@/i18n/routing';
import type { Localized } from './localize';
import { pick } from './localize';

export type FaqItem = { id: string; q: Localized<string>; a: Localized<string> };
export type ResolvedFaq = { id: string; q: string; a: string };

// Global FAQ. Stable ids allow per-building overrides later (not used in v1).
export const FAQ: FaqItem[] = [
  {
    id: 'checkInOut',
    q: { en: 'What are check-in and check-out times?', vi: 'Giờ nhận phòng và trả phòng là khi nào?', ko: '체크인 및 체크아웃 시간은 언제인가요?', 'zh-Hans': '入住和退房时间是几点？', ru: 'Каковы часы заезда и выезда?' },
    a: { en: 'Check-in is from 2:00 PM and check-out is by 12:00 PM. Early check-in or late check-out may be available on request.', vi: 'Nhận phòng từ 14:00 và trả phòng trước 12:00. Có thể nhận phòng sớm hoặc trả phòng muộn theo yêu cầu.', ko: '체크인은 오후 2시부터, 체크아웃은 정오 12시까지입니다. 요청 시 얼리 체크인 또는 레이트 체크아웃이 가능할 수 있습니다.', 'zh-Hans': '入住时间为下午 2:00，退房时间为中午 12:00。可应要求提前入住或延迟退房。', ru: 'Заезд с 14:00, выезд до 12:00. Ранний заезд или поздний выезд возможны по запросу.' },
  },
  {
    id: 'beachDistance',
    q: { en: 'How far is the beach?', vi: 'Bãi biển cách bao xa?', ko: '해변까지 얼마나 먼가요?', 'zh-Hans': '海滩有多远？', ru: 'Как далеко до пляжа?' },
    a: { en: 'My Khe Beach is about a 5-minute walk (around 400 m) from the property.', vi: 'Bãi biển Mỹ Khê cách chỗ ở khoảng 5 phút đi bộ (khoảng 400 m).', ko: '미케 해변까지 도보 약 5분(약 400m) 거리입니다.', 'zh-Hans': '美溪海滩距离住所步行约 5 分钟（约 400 米）。', ru: 'Пляж Мьякхе примерно в 5 минутах ходьбы (около 400 м) от жилья.' },
  },
  {
    id: 'scooterRental',
    q: { en: 'Do you rent scooters or bikes?', vi: 'Có cho thuê xe máy hoặc xe đạp không?', ko: '스쿠터나 자전거를 대여하나요?', 'zh-Hans': '可以租摩托车或自行车吗？', ru: 'Сдаёте ли вы скутеры или велосипеды?' },
    a: { en: 'Yes — scooter and bicycle rental is available on request, so you can explore Da Nang at your own pace.', vi: 'Có — chúng tôi cho thuê xe máy và xe đạp theo yêu cầu để bạn tự do khám phá Đà Nẵng.', ko: '네, 요청 시 스쿠터와 자전거를 대여해 드리므로 자유롭게 다낭을 둘러보실 수 있습니다.', 'zh-Hans': '可以——可应要求租赁摩托车和自行车，让您自在游览岘港。', ru: 'Да — аренда скутеров и велосипедов доступна по запросу, чтобы вы могли исследовать Дананг в своём темпе.' },
  },
  {
    id: 'wifi',
    q: { en: 'Is Wi-Fi free?', vi: 'Wi-Fi có miễn phí không?', ko: 'Wi-Fi는 무료인가요?', 'zh-Hans': 'Wi-Fi 免费吗？', ru: 'Wi-Fi бесплатный?' },
    a: { en: 'Yes, free reliable high-speed Wi-Fi is included throughout the property.', vi: 'Có, Wi-Fi miễn phí tốc độ cao và ổn định được phủ khắp khuôn viên.', ko: '네, 전 구역에서 안정적인 무료 고속 Wi-Fi를 제공합니다.', 'zh-Hans': '是的，整个物业均提供免费稳定的高速 Wi-Fi。', ru: 'Да, бесплатный стабильный высокоскоростной Wi-Fi доступен на всей территории.' },
  },
  {
    id: 'parking',
    q: { en: 'Is there parking?', vi: 'Có chỗ đỗ xe không?', ko: '주차장이 있나요?', 'zh-Hans': '有停车位吗？', ru: 'Есть ли парковка?' },
    a: { en: 'Yes, free on-site parking is available for cars and scooters.', vi: 'Có, bãi đỗ xe miễn phí tại chỗ cho ô tô và xe máy.', ko: '네, 자동차와 스쿠터를 위한 무료 현장 주차가 가능합니다.', 'zh-Hans': '有，提供免费的现场停车位，可停放汽车和摩托车。', ru: 'Да, бесплатная парковка на территории для автомобилей и скутеров.' },
  },
  {
    id: 'frontDesk',
    q: { en: 'Is there a 24-hour front desk?', vi: 'Có lễ tân 24 giờ không?', ko: '24시간 프런트 데스크가 있나요?', 'zh-Hans': '有 24 小时前台吗？', ru: 'Есть ли круглосуточная стойка регистрации?' },
    a: { en: 'Yes, our front desk is staffed 24 hours a day.', vi: 'Có, lễ tân của chúng tôi phục vụ 24 giờ mỗi ngày.', ko: '네, 프런트 데스크는 하루 24시간 운영됩니다.', 'zh-Hans': '是的，我们的前台 24 小时有人值守。', ru: 'Да, наша стойка регистрации работает круглосуточно.' },
  },
  {
    id: 'foodNearby',
    q: { en: 'Are there cafés or restaurants nearby?', vi: 'Gần đó có quán cà phê hoặc nhà hàng không?', ko: '근처에 카페나 식당이 있나요?', 'zh-Hans': '附近有咖啡馆或餐厅吗？', ru: 'Есть ли поблизости кафе или рестораны?' },
    a: { en: 'Plenty — An Hải has many cafés and restaurants within a short walk.', vi: 'Rất nhiều — khu An Hải có nhiều quán cà phê và nhà hàng chỉ cách vài bước chân.', ko: '많습니다 — 안하이에는 도보 거리 내에 카페와 식당이 많습니다.', 'zh-Hans': '很多——安海区步行不远即有众多咖啡馆和餐厅。', ru: 'Множество — в районе Анхай много кафе и ресторанов в пешей доступности.' },
  },
  {
    id: 'airportDistance',
    q: { en: 'How far is Da Nang airport?', vi: 'Sân bay Đà Nẵng cách bao xa?', ko: '다낭 공항까지 얼마나 먼가요?', 'zh-Hans': '岘港机场有多远？', ru: 'Как далеко аэропорт Дананга?' },
    a: { en: 'Da Nang International Airport is about 5 km away — roughly a 15-minute drive.', vi: 'Sân bay Quốc tế Đà Nẵng cách khoảng 5 km — chừng 15 phút lái xe.', ko: '다낭 국제공항까지 약 5km로, 차로 약 15분 거리입니다.', 'zh-Hans': '岘港国际机场约 5 公里，车程约 15 分钟。', ru: 'Международный аэропорт Дананга примерно в 5 км — около 15 минут на машине.' },
  },
  {
    id: 'smokeFreeFamily',
    q: { en: 'Is the property smoke-free and family-friendly?', vi: 'Chỗ ở có không hút thuốc và thân thiện với gia đình không?', ko: '금연이며 가족 친화적인가요?', 'zh-Hans': '物业是否无烟且适合家庭入住？', ru: 'Курение запрещено и подходит ли жильё для семей?' },
    a: { en: 'Yes. The property is entirely smoke-free, and family rooms are available.', vi: 'Có. Toàn bộ khuôn viên không hút thuốc và có phòng gia đình.', ko: '네. 전 구역이 금연이며 가족실도 이용 가능합니다.', 'zh-Hans': '是的。物业全面无烟，并提供家庭房。', ru: 'Да. Курение запрещено на всей территории, доступны семейные номера.' },
  },
  {
    id: 'languages',
    q: { en: 'What languages do you speak?', vi: 'Bạn nói được những ngôn ngữ nào?', ko: '어떤 언어로 응대하나요?', 'zh-Hans': '你们会说哪些语言？', ru: 'На каких языках вы говорите?' },
    a: { en: "We can help in English and Vietnamese, and you're welcome to message us in your own language on WhatsApp.", vi: 'Chúng tôi hỗ trợ bằng tiếng Anh và tiếng Việt, và bạn có thể nhắn tin cho chúng tôi bằng ngôn ngữ của mình qua WhatsApp.', ko: '영어와 베트남어로 도와드리며, WhatsApp으로 원하시는 언어로 메시지를 보내셔도 됩니다.', 'zh-Hans': '我们可以用英语和越南语为您服务，您也可以通过 WhatsApp 用您的语言留言。', ru: 'Мы помогаем на английском и вьетнамском, и вы можете написать нам на своём языке в WhatsApp.' },
  },
];

/** Resolve the global FAQ for a locale (en fallback). Stable ids allow future per-building overrides. */
export function getFaq(locale: Locale): ResolvedFaq[] {
  return FAQ.map((f) => ({ id: f.id, q: pick(f.q, locale), a: pick(f.a, locale) }));
}
