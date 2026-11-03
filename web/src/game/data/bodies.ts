export interface BodyData {
  name: string;
  radiusKm: number;
  massKg: number;
  color: number;
  parentMu?: number;
  soiRadiusKm?: number;
  orbit?: {
    aKm: number;
    e: number;
    meanLongitudeDeg?: number;
    periLongitudeDeg?: number;
    periodDays?: number;
    omega?: number;
    M0?: number;
  };
  children?: BodyData[];
}

export const SUN_MU = 1.32712440018e11;
export const EARTH_MU = 3.986004418e5;
export const MARS_MU = 4.282837e4;
export const JUPITER_MU = 1.26686534e8;
export const SATURN_MU = 3.7931187e7;

export const SOLAR_SYSTEM: BodyData = {
  name: "Sun",
  radiusKm: 696_000,
  massKg: 1.989e30,
  color: 0xffcc33,
  soiRadiusKm: 1.9e13,
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
      children: [
        {
          name: "Mimas",
          radiusKm: 198.2,
          massKg: 3.75e19,
          color: 0x808080,
          parentMu: SATURN_MU,
          orbit: { aKm: 185_539, e: 0.0196, omega: 0.5, M0: 0 },
        },
        {
          name: "Enceladus",
          radiusKm: 252.1,
          massKg: 1.08e20,
          color: 0xf0f0f0,
          parentMu: SATURN_MU,
          orbit: { aKm: 237_948, e: 0.0047, omega: 1.5, M0: 1.2 },
        },
        {
          name: "Tethys",
          radiusKm: 531.1,
          massKg: 6.17e20,
          color: 0xc8d8e0,
          parentMu: SATURN_MU,
          orbit: { aKm: 294_619, e: 0.0001, omega: 2.5, M0: 2.8 },
        },
        {
          name: "Dione",
          radiusKm: 561.4,
          massKg: 1.095e21,
          color: 0x8a8a8a,
          parentMu: SATURN_MU,
          orbit: { aKm: 377_396, e: 0.0022, omega: 3.5, M0: 4.1 },
        },
        {
          name: "Rhea",
          radiusKm: 763.8,
          massKg: 2.306e21,
          color: 0x9a8a7a,
          parentMu: SATURN_MU,
          orbit: { aKm: 527_108, e: 0.0013, omega: 4.5, M0: 5.3 },
        },
        {
          name: "Titan",
          radiusKm: 2574.7,
          massKg: 1.3452e23,
          color: 0xd4a05a,
          parentMu: SATURN_MU,
          orbit: { aKm: 1_221_870, e: 0.0288, omega: 5.5, M0: 0.7 },
        },
      ],
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