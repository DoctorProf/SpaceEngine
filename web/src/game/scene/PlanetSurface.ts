
import { Graphics } from "pixi.js";

function createRandom(seed: number): () => number {
  let value = seed;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function getSeed(name: string): number {
  let seed = 0;

  for (let i = 0; i < name.length; i++) {
    seed = (seed * 31 + name.charCodeAt(i)) | 0;
  }

  return Math.abs(seed) + 1;
}

function shadeColor(color: number, factor: number): number {
  const r = Math.min(255, ((color >> 16) & 255) * factor);
  const g = Math.min(255, ((color >> 8) & 255) * factor);
  const b = Math.min(255, (color & 255) * factor);

  return (
    (Math.round(r) << 16) |
    (Math.round(g) << 8) |
    Math.round(b)
  );
}

export class PlanetSurface {
  readonly graphics = new Graphics();

  private readonly radius: number;
  private readonly color: number;

  constructor(
    name: string,
    radiusUnits: number,
    color: number,
  ) {
    this.radius = radiusUnits;
    this.color = color;

    this.draw(name);
  }

  private draw(name: string) {
    const g = this.graphics;
    const random = createRandom(getSeed(name));

    // Основная форма планеты с небольшими неровностями.
    const segments = 180;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;

      const variation = 1 + (random() - 0.5) * 0.012;
      const radius = this.radius * variation;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        g.moveTo(x, y);
      } else {
        g.lineTo(x, y);
      }
    }

    g.closePath();
    g.fill({ color: this.color });

    // Цветовые участки грунта.
    const patchCount = 90;

    for (let i = 0; i < patchCount; i++) {
      const angle = random() * Math.PI * 2;
      const distance = Math.sqrt(random()) * this.radius * 0.88;
      const size = this.radius * (0.015 + random() * 0.055);

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      const points: number[] = [];
      const sides = 7;

      for (let j = 0; j < sides; j++) {
        const a = (j / sides) * Math.PI * 2;
        const r = size * (0.65 + random() * 0.7);

        points.push(
          x + Math.cos(a) * r,
          y + Math.sin(a) * r,
        );
      }

      const factor = random() > 0.5 ? 1.22 : 0.76;
      const patchColor = shadeColor(this.color, factor);

      g.poly(points).fill({
        color: patchColor,
        alpha: 0.35,
      });
    }
  }

  updateZoom(zoom: number): number {
    const radiusPixels = this.radius * zoom;

    // Плавное появление поверхности.
    const blend = Math.max(
      0,
      Math.min(1, (radiusPixels - 18) / 42),
    );

    this.graphics.alpha = blend;

    return blend;
  }
}
