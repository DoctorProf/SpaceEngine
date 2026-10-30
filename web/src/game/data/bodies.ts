export interface BodyData {
  name: string;
  radiusKm: number;
  massKg: number;
  color: number;
  parentMu?: number;
  orbit?: {
    aKm: number;
    e: number;
    // Вариант A — эфемериды J2000 (планеты):
    meanLongitudeDeg?: number;
    periLongitudeDeg?: number;
    periodDays?: number;
    // Вариант B — прямые углы (спутники, искусственные):
    omega?: number;
    M0?: number;
  };
  children?: BodyData[];
}

export const SUN_MU = 1.32712440018e11;
export const EARTH_MU = 3.986004418e5;
export const MARS_MU = 4.282837e4;
export const JUPITER_MU = 1.26686534e8;

export const SOLAR_SYSTEM: BodyData = {
  name: "Sun",
  radiusKm: 696_000,
  massKg: 1.989e30,
  color: 0xffcc33,
  children: [
    {
      name: "Mercury",
      radiusKm: 2440,
      massKg: 3.301e23,
      color: 0xb0a99c,
      parentMu: SUN_MU,
      orbit: {
        aKm: 5.791e7, e: 0.2056,
        meanLongitudeDeg: 252.25084, periLongitudeDeg: 77.45645, periodDays: 87.969,
      },
    },
    {
      name: "Venus",
      radiusKm: 6052,
      massKg: 4.867e24,
      color: 0xe8c678,
      parentMu: SUN_MU,
      orbit: {
        aKm: 1.082e8, e: 0.0068,
        meanLongitudeDeg: 181.97973, periLongitudeDeg: 131.60247, periodDays: 224.701,
      },
    },
    {
      name: "Earth",
      radiusKm: 6371,
      massKg: 5.972e24,
      color: 0x5a8fff,
      parentMu: SUN_MU,
      orbit: {
        aKm: 1.496e8, e: 0.0167,
        meanLongitudeDeg: 100.46435, periLongitudeDeg: 102.93768, periodDays: 365.256,
      },
      children: [
        {
          name: "Moon",
          radiusKm: 1737,
          massKg: 7.342e22,
          color: 0xcccccc,
          parentMu: EARTH_MU,
          orbit: { aKm: 384_400, e: 0.0549, omega: 0, M0: 0 },
        },
      ],
    },
    {
      name: "Mars",
      radiusKm: 3390,
      massKg: 6.417e23,
      color: 0xff6644,
      parentMu: SUN_MU,
      orbit: {
        aKm: 2.279e8, e: 0.0934,
        meanLongitudeDeg: 355.45332, periLongitudeDeg: 336.04084, periodDays: 686.980,
      },
      children: [
        {
          name: "Phobos",
          radiusKm: 11.27,
          massKg: 1.0659e16,
          color: 0x8a7d6d,
          parentMu: MARS_MU,
          orbit: { aKm: 9376, e: 0.0151, omega: 2.6, M0: 0 },
        },
        {
          name: "Deimos",
          radiusKm: 6.2,
          massKg: 1.4762e15,
          color: 0x9a8f7f,
          parentMu: MARS_MU,
          orbit: { aKm: 23_463, e: 0.00033, omega: 4.5, M0: 1.5 },
        },
      ],
    },
    {
      name: "Jupiter",
      radiusKm: 69911,
      massKg: 1.898e27,
      color: 0xc79a6b,
      parentMu: SUN_MU,
      orbit: {
        aKm: 7.785e8, e: 0.0489,
        meanLongitudeDeg: 34.40438, periLongitudeDeg: 14.72848, periodDays: 4332.589,
      },
      children: [
        {
          name: "Io",
          radiusKm: 1821.6,
          massKg: 8.932e22,
          color: 0xd4b85a,
          parentMu: JUPITER_MU,
          orbit: { aKm: 421_700, e: 0.0041, omega: 0.5, M0: 0 },
        },
        {
          name: "Europa",
          radiusKm: 1560.8,
          massKg: 4.8e22,
          color: 0xc8dce0,
          parentMu: JUPITER_MU,
          orbit: { aKm: 671_034, e: 0.0094, omega: 1.2, M0: 1.7 },
        },
        {
          name: "Ganymede",
          radiusKm: 2634.1,
          massKg: 1.4819e23,
          color: 0x8a7a6a,
          parentMu: JUPITER_MU,
          orbit: { aKm: 1_070_412, e: 0.0013, omega: 2.5, M0: 3.4 },
        },
        {
          name: "Callisto",
          radiusKm: 2410.3,
          massKg: 1.0759e23,
          color: 0x6a5a4a,
          parentMu: JUPITER_MU,
          orbit: { aKm: 1_882_709, e: 0.0074, omega: 4.0, M0: 5.1 },
        },
      ],
    },
    {
      name: "Saturn",
      radiusKm: 58232,
      massKg: 5.683e26,
      color: 0xe8d49a,
      parentMu: SUN_MU,
      orbit: {
        aKm: 1.434e9, e: 0.0565,
        meanLongitudeDeg: 49.94432, periLongitudeDeg: 92.59888, periodDays: 10759.22,
      },
    },
    {
      name: "Uranus",
      radiusKm: 25362,
      massKg: 8.681e25,
      color: 0x8de0e5,
      parentMu: SUN_MU,
      orbit: {
        aKm: 2.871e9, e: 0.0457,
        meanLongitudeDeg: 313.23218, periLongitudeDeg: 170.95428, periodDays: 30685.4,
      },
    },
    {
      name: "Neptune",
      radiusKm: 24622,
      massKg: 1.024e26,
      color: 0x4466cc,
      parentMu: SUN_MU,
      orbit: {
        aKm: 4.495e9, e: 0.0113,
        meanLongitudeDeg: 304.88003, periLongitudeDeg: 44.96476, periodDays: 60189.0,
      },
    },
  ],
};