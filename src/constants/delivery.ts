export const DELIVERY_OPTIONS = {
  PICKUP: {
    id: 'pickup' as const,
    title: 'Samovyzdvihnutie',
    description: 'Vyzdvihnite si objednávku v našej predajni',
    price: 0,
    time: 'Dnes do 2 hodín'
  },
  DELIVERY: {
    id: 'delivery' as const,
    title: 'Doručenie domov',
    description: 'Doručíme vám objednávku priamo k vám domov',
    price: 0, // Будет вычисляться динамически
    time: 'Dnes do 4 hodín'
  }
} as const;

export const STORE_INFO = {
  address: 'Hlavná 123, 12345 Bratislava',
  workingHours: 'Pondelok - Piatok: 8:00 - 20:00, Sobota: 9:00 - 18:00',
  phone: '+421 123 456 789'
} as const;

export const DELIVERY_INFO = {
  timeRange: '9:00 - 21:00',
  area: 'Bratislava a okolie',
  contactNote: 'Kurier vás bude kontaktovať pred doručením'
} as const;

export const TIME_SLOTS = {
  PICKUP: [
    '09:00 - 11:00',
    '11:00 - 13:00',
    '13:00 - 15:00',
    '15:00 - 17:00',
    '17:00 - 19:00'
  ],
  DELIVERY: [
    '09:00 - 12:00',
    '12:00 - 15:00',
    '15:00 - 18:00',
    '18:00 - 21:00'
  ]
} as const;
