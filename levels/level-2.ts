import { Level } from '@/types/game';

// Level 2: Feed the hungry cat - The trick is the cat wants fish, not cat food!
export const level2: Level = {
  id: 2,
  title: "Hungry Cat",
  titleAr: "القطة الجائعة",
  description: "Feed the hungry cat",
  descriptionAr: "أطعم القطة الجائعة",
  background: "/assets/backgrounds/kitchen.svg",
  items: [
    {
      id: "cat",
      name: "Hungry Cat",
      nameAr: "القطة الجائعة",
      image: "/assets/characters/hungry-cat.svg",
      position: { x: 60, y: 55 },
      draggable: false,
      visible: true,
      zIndex: 2,
      states: {
        hungry: {},
        happy: { image: "/assets/characters/happy-cat.svg" },
        angry: { image: "/assets/characters/angry-cat.svg" },
      },
      currentState: "hungry",
    },
    {
      id: "cat_food",
      name: "Cat Food",
      nameAr: "طعام القطط",
      image: "/assets/items/cat-food.svg",
      position: { x: 15, y: 60 },
      draggable: true,
      visible: true,
      zIndex: 3,
    },
    {
      id: "fish",
      name: "Fish",
      nameAr: "سمكة",
      image: "/assets/items/fish.svg",
      position: { x: 85, y: 20 },
      draggable: true,
      visible: false,
      zIndex: 3,
    },
    {
      id: "fridge",
      name: "Fridge",
      nameAr: "الثلاجة",
      image: "/assets/items/fridge-closed.svg",
      position: { x: 75, y: 15 },
      draggable: false,
      clickable: true,
      visible: true,
      zIndex: 1,
      states: {
        closed: { image: "/assets/items/fridge-closed.svg" },
        open: { image: "/assets/items/fridge-open.svg" },
      },
      currentState: "closed",
    },
    {
      id: "bowl",
      name: "Food Bowl",
      nameAr: "وعاء الطعام",
      image: "/assets/items/bowl.svg",
      position: { x: 45, y: 70 },
      draggable: false,
      visible: true,
      zIndex: 1,
    },
  ],
  zones: [
    {
      id: "cat_zone",
      bounds: { x: 40, y: 50, width: 35, height: 40 },
      acceptsItems: ["cat_food", "fish"],
    },
    {
      id: "fridge_zone",
      bounds: { x: 70, y: 10, width: 25, height: 50 },
      onClick: "open_fridge",
    },
  ],
  solution: [
    {
      action: 'click',
      target: 'fridge',
      effects: [
        { type: 'changeState', target: 'fridge', value: 'open' },
        { type: 'show', target: 'fish' },
        { type: 'sound', target: 'pop', value: null },
      ],
    },
    {
      action: 'drag',
      target: 'fish',
      destination: 'cat_zone',
      effects: [
        { type: 'hide', target: 'fish' },
        { type: 'changeState', target: 'cat', value: 'happy' },
        { type: 'sound', target: 'correct', value: null },
      ],
    },
  ],
  hints: [
    "Cats can be picky eaters...",
    "Maybe check what's in the fridge?",
    "Fish is a cat's favorite treat! 🐟",
  ],
  hintsAr: [
    "القطط قد تكون صعبة الإرضاء...",
    "ربما تفقد ما في الثلاجة؟",
    "السمك هو الطعام المفضل للقطط! 🐟",
  ],
  successMessage: "Purrrfect! The cat is happy now! 😺",
  successMessageAr: "ممتاز! القطة سعيدة الآن! 😺",
};

export default level2;
