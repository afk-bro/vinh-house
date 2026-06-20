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
    amenityIds: ['wifi', 'ac', 'frontDesk', 'parking', 'kitchen', 'laundry', 'balcony', 'garden', 'smokeFree', 'family', 'scooter'],
    landmarks: [
      { name: { en: 'My Khe Beach', vi: 'Bãi biển Mỹ Khê', ko: '미케 해변', 'zh-Hans': '美溪海滩', ru: 'Пляж Мьякхе' }, distance: '0.4 km' },
      { name: { en: 'Dragon Bridge', vi: 'Cầu Rồng', ko: '드래곤 브리지', 'zh-Hans': '龙桥', ru: 'Мост Дракон' }, distance: '1.7 km' },
      { name: { en: 'Han River Bridge', vi: 'Cầu Sông Hàn', ko: '한강교', 'zh-Hans': '韩江桥', ru: 'Мост через реку Хан' }, distance: '2.4 km' },
      { name: { en: 'Da Nang Cathedral', vi: 'Nhà thờ Đà Nẵng', ko: '다낭 대성당', 'zh-Hans': '岘港大教堂', ru: 'Кафедральный собор Дананга' }, distance: '3.0 km' },
      { name: { en: 'Da Nang Railway Station', vi: 'Ga Đà Nẵng', ko: '다낭 기차역', 'zh-Hans': '岘港火车站', ru: 'Железнодорожный вокзал Дананга' }, distance: '4.5 km' },
      { name: { en: 'Da Nang International Airport (DAD)', vi: 'Sân bay Quốc tế Đà Nẵng (DAD)', ko: '다낭 국제공항 (DAD)', 'zh-Hans': '岘港国际机场 (DAD)', ru: 'Международный аэропорт Дананга (DAD)' }, distance: '5.0 km' },
      { name: { en: 'Marble Mountains (Ngũ Hành Sơn)', vi: 'Ngũ Hành Sơn', ko: '마블 마운틴 (응우한선)', 'zh-Hans': '五行山', ru: 'Мраморные горы (Нгуханьшон)' }, distance: '6.5 km' },
    ],
    rooms: [
      { slug: '1-bedroom', name: { en: '1 Bedroom', vi: '1 Phòng ngủ', ko: '원룸', 'zh-Hans': '一居室', ru: '1 спальня' }, price: '700,000₫', blurb: { en: 'A bright one-bedroom apartment with a fully equipped kitchenette, private bathroom, and in-room washing machine — a comfortable, self-contained stay in An Hải, just a short walk from the beach.', vi: 'Căn hộ một phòng ngủ sáng sủa với bếp nhỏ đầy đủ tiện nghi, phòng tắm riêng và máy giặt trong phòng — chỗ ở khép kín, thoải mái tại An Hải, chỉ cách bãi biển vài bước đi bộ.', ko: '완비된 간이주방, 전용 욕실, 객실 내 세탁기를 갖춘 밝은 원룸 아파트 — 안하이에 위치한 편안한 독립형 숙소로, 해변까지 도보로 잠깐이면 닿습니다.', 'zh-Hans': '明亮的一居室公寓，配有设备齐全的小厨房、独立卫浴和室内洗衣机——位于安海区，舒适独立，步行片刻即可到达海滩。', ru: 'Светлые апартаменты с одной спальней, полностью оборудованной мини-кухней, отдельной ванной и стиральной машиной в номере — уютное автономное жильё в Анхай, в нескольких минутах ходьбы от пляжа.' }, status: 'available', alt: { en: '1-bedroom apartment at Gilda Hotel', vi: 'Căn hộ 1 phòng ngủ tại Gilda Hotel', ko: 'Gilda Hotel의 원룸 아파트', 'zh-Hans': 'Gilda Hotel 的一居室公寓', ru: 'Апартаменты с 1 спальней в Gilda Hotel' } },
      { slug: '2-bedroom', name: { en: '2 Bedroom', vi: '2 Phòng ngủ', ko: '투룸', 'zh-Hans': '两居室', ru: '2 спальни' }, price: '700,000₫', blurb: { en: 'A spacious two-bedroom apartment with a full kitchen, a living area with TV, and in-room laundry — ideal for families or small groups, moments from the beach and the cafés of An Hải.', vi: 'Căn hộ hai phòng ngủ rộng rãi với bếp đầy đủ, khu vực phòng khách có TV và máy giặt trong phòng — lý tưởng cho gia đình hoặc nhóm nhỏ, chỉ cách bãi biển và các quán cà phê ở An Hải vài phút.', ko: '완비된 주방, TV가 있는 거실 공간, 객실 내 세탁 시설을 갖춘 넓은 투룸 아파트 — 가족이나 소규모 일행에게 안성맞춤이며, 해변과 안하이의 카페까지 잠깐이면 닿습니다.', 'zh-Hans': '宽敞的两居室公寓，配有齐全厨房、带电视的起居区和室内洗衣设施——非常适合家庭或小团体，距离海滩和安海区的咖啡馆仅几分钟路程。', ru: 'Просторные апартаменты с двумя спальнями, полноценной кухней, гостиной зоной с телевизором и стиральной машиной в номере — идеально для семей или небольших компаний, в нескольких минутах от пляжа и кафе Анхай.' }, status: 'available', alt: { en: '2-bedroom apartment at Gilda Hotel', vi: 'Căn hộ 2 phòng ngủ tại Gilda Hotel', ko: 'Gilda Hotel의 투룸 아파트', 'zh-Hans': 'Gilda Hotel 的两居室公寓', ru: 'Апартаменты с 2 спальнями в Gilda Hotel' } },
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
