import type { BuildingMeta, Contacts } from './types';

// ⚠️ PLACEHOLDERS — replace with real values when the client provides them.
export const contacts: Contacts = {
  email: 'CHANGEME@example.com',
  phone: '+84 92 442 22 99',
  whatsapp: '+84 92 442 22 99',
  facebook: 'https://facebook.com/CHANGEME',
  motorbikeUrl: 'https://vinhphatmotorbikes.com',
};

export const buildings: BuildingMeta[] = [
  {
    slug: 'gilda-hotel',
    folder: 'Gilda-Hotel',
    name: 'Gilda Hotel',
    address: '89 Cao Bá Quát, An Hải, Đà Nẵng 550000, Vietnam',
    googleMapsUrl: 'https://maps.google.com/?q=89+Cao+Ba+Quat+Da+Nang',
    blurb: {
      en: 'Boutique rooms in An Hải, steps from the beach.',
      vi: 'Phòng boutique tại An Hải, cách bãi biển vài bước chân.',
      ko: '해변에서 몇 걸음 거리, 안하이의 부티크 객실.',
      'zh-Hans': '安海区精品客房，离海滩仅几步之遥。',
      ru: 'Бутик-номера в Анхай, в нескольких шагах от пляжа.',
    },
    alt: {
      en: 'Exterior and rooms at Gilda Hotel in Da Nang',
      vi: 'Bên ngoài và các phòng tại Gilda Hotel ở Đà Nẵng',
      ko: '다낭 Gilda Hotel의 외관과 객실',
      'zh-Hans': '岘港 Gilda Hotel 的外观和客房',
      ru: 'Фасад и номера Gilda Hotel в Дананге',
    },
    sortOrder: 1,
    rooms: [
      { slug: '1-bedroom', name: { en: '1 Bedroom', vi: '1 Phòng ngủ', ko: '원룸', 'zh-Hans': '一居室', ru: '1 спальня' }, price: '$— / month', blurb: { en: 'Description coming soon.', vi: 'Mô tả sắp có.', ko: '설명 준비 중입니다.', 'zh-Hans': '描述即将公布。', ru: 'Описание скоро появится.' }, status: 'available', alt: { en: '1-bedroom apartment at Gilda Hotel', vi: 'Căn hộ 1 phòng ngủ tại Gilda Hotel', ko: 'Gilda Hotel의 원룸 아파트', 'zh-Hans': 'Gilda Hotel 的一居室公寓', ru: 'Апартаменты с 1 спальней в Gilda Hotel' } },
      { slug: '2-bedroom', name: { en: '2 Bedroom', vi: '2 Phòng ngủ', ko: '투룸', 'zh-Hans': '两居室', ru: '2 спальни' }, price: '$— / month', blurb: { en: 'Description coming soon.', vi: 'Mô tả sắp có.', ko: '설명 준비 중입니다.', 'zh-Hans': '描述即将公布。', ru: 'Описание скоро появится.' }, status: 'available', alt: { en: '2-bedroom apartment at Gilda Hotel', vi: 'Căn hộ 2 phòng ngủ tại Gilda Hotel', ko: 'Gilda Hotel의 투룸 아파트', 'zh-Hans': 'Gilda Hotel 的两居室公寓', ru: 'Апартаменты с 2 спальнями в Gilda Hotel' } },
    ],
  },
  {
    slug: 'azure-apartments',
    folder: 'Azure-Apartments',
    name: 'Azure Apartments',
    address: 'Da Nang, Vietnam',
    googleMapsUrl: 'https://maps.google.com/?q=Da+Nang',
    blurb: { en: 'Details coming soon.', vi: 'Thông tin sắp có.', ko: '세부 정보 준비 중입니다.', 'zh-Hans': '详情即将公布。', ru: 'Подробности скоро.' },
    alt: { en: 'Azure Apartments in Da Nang', vi: 'Azure Apartments ở Đà Nẵng', ko: '다낭의 Azure Apartments', 'zh-Hans': '岘港的 Azure Apartments', ru: 'Azure Apartments в Дананге' },
    sortOrder: 2,
    comingSoon: true,
    rooms: [],
  },
];

/** Nav-safe building list (excludes hidden), sorted. Building names are single-source. */
export function buildingNav(): { slug: string; name: string; comingSoon: boolean }[] {
  return buildings
    .filter((b) => !b.hidden)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((b) => ({ slug: b.slug, name: b.name, comingSoon: !!b.comingSoon }));
}
