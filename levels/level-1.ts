import { Level } from '@/types/game';

// Level 1: Help the man wake up - The trick is that the alarm clock doesn't work!
export const level1: Level = {
  id: 1,
  title: "Wake Up!",
  titleAr: "استيقظ!",
  description: "Help the man wake up for work",
  descriptionAr: "ساعد الرجل على الاستيقاظ للعمل",
  background: "/assets/backgrounds/bedroom.svg",
  items: [
    {
      id: "sleeping_man",
      name: "Sleeping Man",
      nameAr: "الرجل النائم",
      image: "/assets/characters/sleeping-man.svg",
      position: { x: 25, y: 40 },
      draggable: false,
      visible: true,
      zIndex: 2,
      states: {
        sleeping: {},
        awake: { image: "/assets/characters/awake-man.svg" },
        wet: { image: "/assets/characters/wet-man.svg" },
      },
      currentState: "sleeping",
    },
    {
      id: "alarm_clock",
      name: "Alarm Clock",
      nameAr: "المنبه",
      image: "/assets/items/alarm-clock.svg",
      position: { x: 75, y: 25 },
      draggable: true,
      visible: true,
      zIndex: 3,
    },
    {
      id: "water_bucket",
      name: "Water Bucket",
      nameAr: "دلو الماء",
      image: "/assets/items/bucket.svg",
      position: { x: 10, y: 70 },
      draggable: true,
      visible: true,
      zIndex: 3,
    },
    {
      id: "curtain",
      name: "Curtain",
      nameAr: "الستارة",
      image: "/assets/items/curtain.svg",
      position: { x: 70, y: 5 },
      draggable: false,
      clickable: true,
      visible: true,
      zIndex: 4,
    },
    {
      id: "sun",
      name: "Sun",
      nameAr: "الشمس",
      image: "/assets/items/sun.svg",
      position: { x: 80, y: 8 },
      draggable: false,
      visible: false,
      zIndex: 1,
    },
    {
      id: "splash",
      name: "Splash",
      nameAr: "الرشة",
      image: "/assets/items/splash.svg",
      position: { x: 30, y: 35 },
      draggable: false,
      visible: false,
      zIndex: 5,
    },
  ],
  zones: [
    {
      id: "man_zone",
      bounds: { x: 20, y: 35, width: 30, height: 45 },
      acceptsItems: ["water_bucket", "alarm_clock"],
    },
    {
      id: "window_zone",
      bounds: { x: 65, y: 0, width: 30, height: 40 },
      acceptsItems: [],
    },
  ],
  solution: [
    {
      action: 'drag',
      target: 'water_bucket',
      destination: 'man_zone',
      effects: [
        { type: 'hide', target: 'water_bucket' },
        { type: 'show', target: 'splash' },
        { type: 'changeState', target: 'sleeping_man', value: 'wet' },
        { type: 'sound', target: 'swoosh', value: null },
      ],
    },
  ],
  hints: [
    "The alarm clock looks broken...",
    "What else could wake someone up suddenly?",
    "Try something more... refreshing! 💦",
  ],
  hintsAr: [
    "المنبه يبدو معطلاً...",
    "ما الذي يمكن أن يوقظ شخصاً فجأة؟",
    "جرب شيئاً أكثر انتعاشاً! 💦",
  ],
  successMessage: "He's awake now! (and a bit wet 😅)",
  successMessageAr: "لقد استيقظ! (ومبلل قليلاً 😅)",
};

export default level1;
