export interface BodyData {
  name: string;
  radiusKm: number;
  color: number;
  parentMu?: number;
  orbit?: {
    aKm: number;
    e: number;
    omega: number;
    M0: number;
  };
  children?: BodyData[];
}

export const SUN_MU = 1.32712440018e11;
export const EARTH_MU = 3.986004418e5;

export const SOLAR_SYSTEM: BodyData = {
  name: "Sun",
  radiusKm: 696_000,
  color: 0xffcc33,
  children: [
    {
      name: "Mercury",
      radiusKm: 2440,
      color: 0xb0a99c,
      parentMu: SUN_MU,
      orbit: { aKm: 5.791e7, e: 0.2056, omega: 1.352, M0: 1.0 },
    },
    {
      name: "Venus",
      radiusKm: 6052,
      color: 0xe8c678,
      parentMu: SUN_MU,
      orbit: { aKm: 1.082e8, e: 0.0068, omega: 2.297, M0: 2.0 },
    },
    {
      name: "Earth",
      radiusKm: 6371,
      color: 0x5a8fff,
      parentMu: SUN_MU,
      orbit: { aKm: 1.496e8, e: 0.0167, omega: 1.796, M0: 0 },
      children: [
        {
          name: "Moon",
          radiusKm: 1737,
          color: 0xcccccc,
          parentMu: EARTH_MU,
          orbit: { aKm: 384_400, e: 0.0549, omega: 0, M0: 0 },
        },
      ],
    },
    {
      name: "Mars",
      radiusKm: 3390,
      color: 0xff6644,
      parentMu: SUN_MU,
      orbit: { aKm: 2.279e8, e: 0.0934, omega: 5.865, M0: 0.5 },
    },
    {
      name: "Jupiter",
      radiusKm: 69911,
      color: 0xc79a6b,
      parentMu: SUN_MU,
      orbit: { aKm: 7.785e8, e: 0.0489, omega: 0.257, M0: 3.0 },
    },
    {
      name: "Saturn",
      radiusKm: 58232,
      color: 0xe8d49a,
      parentMu: SUN_MU,
      orbit: { aKm: 1.434e9, e: 0.0565, omega: 1.613, M0: 4.0 },
    },
    {
      name: "Uranus",
      radiusKm: 25362,
      color: 0x8de0e5,
      parentMu: SUN_MU,
      orbit: { aKm: 2.871e9, e: 0.0457, omega: 2.984, M0: 5.0 },
    },
    {
      name: "Neptune",
      radiusKm: 24622,
      color: 0x4466cc,
      parentMu: SUN_MU,
      orbit: { aKm: 4.495e9, e: 0.0113, omega: 0.785, M0: 6.0 },
    },
  ],
};