export type MissionType = "visit" | "focus";

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: string;         // имя тела в bodies.ts
  type: MissionType;      // "visit" = выбрал тело, "focus" = зафокусился двойным кликом
}

export const MISSIONS: Mission[] = [
  {
    id: "visit_mercury",
    title: "Близкий взгляд на Меркурий",
    description: "Выберите Меркурий, чтобы изучить его вытянутую орбиту (e = 0.206) — самую эксцентричную среди планет.",
    target: "Mercury",
    type: "visit",
  },
  {
    id: "visit_venus",
    title: "Утренняя звезда",
    description: "Изучите Венеру — планету с самой плотной атмосферой и температурой поверхности ~464 °C.",
    target: "Venus",
    type: "visit",
  },
  {
    id: "focus_moon",
    title: "Наш спутник",
    description: "Приблизьтесь к Луне (двойной клик) и рассмотрите её орбиту вокруг Земли.",
    target: "Moon",
    type: "focus",
  },
  {
    id: "focus_phobos",
    title: "Спутник Марса",
    description: "Приблизьтесь к Фобосу. Его орбита в 41 раз ближе к Марсу, чем Луна к Земле — это надо увидеть.",
    target: "Phobos",
    type: "focus",
  },
  {
    id: "visit_jupiter",
    title: "Газовый гигант",
    description: "Выберите Юпитер — самую массивную планету Солнечной системы (в 2.5 раза тяжелее всех остальных планет вместе).",
    target: "Jupiter",
    type: "visit",
  },
  {
    id: "focus_europa",
    title: "Ледяной мир",
    description: "Приблизьтесь к Европе — под её ледяной корой скрывается океан жидкой воды.",
    target: "Europa",
    type: "focus",
  },
  {
    id: "visit_saturn",
    title: "Властелин колец",
    description: "Выберите Сатурн — его плотность (0.687 г/см³) меньше плотности воды, он мог бы плавать.",
    target: "Saturn",
    type: "visit",
  },
  {
    id: "visit_uranus",
    title: "На боку",
    description: "Изучите Уран — его ось наклонена на 98°, он буквально катится по орбите.",
    target: "Uranus",
    type: "visit",
  },
  {
    id: "visit_neptune",
    title: "Край системы",
    description: "Выберите Нептун — самую дальнюю планету (30 AU от Солнца), открытую математически до наблюдения.",
    target: "Neptune",
    type: "visit",
  },
  {
    id: "focus_ganymede",
    title: "Крупнейший спутник",
    description: "Ганимед больше Меркурия — приблизьтесь к нему и сравните размеры.",
    target: "Ganymede",
    type: "focus",
  },
];