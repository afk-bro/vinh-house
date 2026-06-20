// lib/content/amenities.ts
import type { Locale } from '@/i18n/routing';
import type { Localized } from './localize';
import { pick } from './localize';

export type Amenity = { id: string; icon: string; label: Localized<string> };
export type ResolvedAmenity = { icon: string; label: string };

export const AMENITIES: Amenity[] = [
  { id: 'wifi', icon: '📶', label: { en: 'Free reliable high-speed Wi-Fi', vi: 'Wi-Fi miễn phí, tốc độ cao và ổn định', ko: '안정적인 무료 고속 Wi-Fi', 'zh-Hans': '免费稳定高速 Wi-Fi', ru: 'Бесплатный стабильный высокоскоростной Wi-Fi' } },
  { id: 'ac', icon: '❄️', label: { en: 'Air conditioning', vi: 'Máy lạnh', ko: '에어컨', 'zh-Hans': '空调', ru: 'Кондиционер' } },
  { id: 'frontDesk', icon: '🛎️', label: { en: '24-hour front desk', vi: 'Lễ tân 24 giờ', ko: '24시간 프런트 데스크', 'zh-Hans': '24 小时前台', ru: 'Круглосуточная стойка регистрации' } },
  { id: 'parking', icon: '🚗', label: { en: 'Free on-site parking', vi: 'Bãi đỗ xe miễn phí tại chỗ', ko: '무료 현장 주차', 'zh-Hans': '免费现场停车', ru: 'Бесплатная парковка на территории' } },
  { id: 'kitchen', icon: '🍳', label: { en: 'Fully-equipped kitchen with cooking utensils', vi: 'Bếp đầy đủ tiện nghi kèm dụng cụ nấu ăn', ko: '조리도구가 완비된 주방', 'zh-Hans': '设备齐全的厨房及炊具', ru: 'Полностью оборудованная кухня с посудой' } },
  { id: 'laundry', icon: '🧺', label: { en: 'Washing machine', vi: 'Máy giặt', ko: '세탁기', 'zh-Hans': '洗衣机', ru: 'Стиральная машина' } },
  { id: 'balcony', icon: '🌿', label: { en: 'Balcony with city view', vi: 'Ban công nhìn ra thành phố', ko: '시내 전망 발코니', 'zh-Hans': '城市景观阳台', ru: 'Балкон с видом на город' } },
  { id: 'garden', icon: '🌳', label: { en: 'Garden', vi: 'Khu vườn', ko: '정원', 'zh-Hans': '花园', ru: 'Сад' } },
  { id: 'smokeFree', icon: '🚭', label: { en: 'Smoke-free property', vi: 'Toàn bộ khuôn viên không hút thuốc', ko: '전 구역 금연', 'zh-Hans': '无烟物业', ru: 'Курение запрещено на всей территории' } },
  { id: 'family', icon: '👨‍👩‍👧', label: { en: 'Family rooms available', vi: 'Có phòng gia đình', ko: '가족실 이용 가능', 'zh-Hans': '提供家庭房', ru: 'Доступны семейные номера' } },
  { id: 'scooter', icon: '🛵', label: { en: 'Scooter & bicycle rental on request', vi: 'Cho thuê xe máy & xe đạp theo yêu cầu', ko: '요청 시 스쿠터 및 자전거 대여', 'zh-Hans': '可应要求租赁摩托车和自行车', ru: 'Аренда скутеров и велосипедов по запросу' } },
];

const BY_ID = new Map(AMENITIES.map((a) => [a.id, a]));

/** Resolve a building's amenity ids into ordered {icon, label} for a locale. */
export function resolveAmenities(ids: string[], locale: Locale): ResolvedAmenity[] {
  return ids
    .map((id) => BY_ID.get(id))
    .filter((a): a is Amenity => Boolean(a))
    .map((a) => ({ icon: a.icon, label: pick(a.label, locale) }));
}
