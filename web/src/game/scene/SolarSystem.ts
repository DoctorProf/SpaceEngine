import { Container, Graphics } from "pixi.js";
import { positionAt, type Orbit } from "../physics/Orbit";
import { SOLAR_SYSTEM, type BodyData } from "../data/bodies";
import { orbitKmPerUnit, bodyRadiusUnits } from "../physics/Scales";
import { useGameStore } from "../../state/gameStore";

interface OrbitRecord {
  graphics: Graphics;
  orbit: Orbit;
  kmPerUnit: number;
}

function drawOrbitRing(
  g: Graphics,
  orbit: Orbit,
  kmPerUnit: number,
  strokeWidth: number,
  color: number,
) {
  const period = 2 * Math.PI * Math.sqrt(orbit.a ** 3 / orbit.mu);
  const steps = 240;
  g.clear();
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * period;
    const p = positionAt(orbit, t);
    const x = p.x / kmPerUnit;
    const y = p.y / kmPerUnit;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke({ width: strokeWidth, color });
}

export class Body {
  readonly container = new Container();
  readonly childrenLayer = new Container();
  readonly children: Body[] = [];
  readonly data: BodyData;
  readonly parent?: Body;
  readonly radiusUnits: number;
  readonly sprite: Graphics;
  readonly orbitRecord?: OrbitRecord;

  private readonly orbit?: Orbit;
  private readonly kmPerUnit: number;

  constructor(data: BodyData, parent?: Body) {
    this.data = data;
    this.parent = parent;
    this.kmPerUnit = parent ? orbitKmPerUnit(parent.data.name) : 1;
    this.radiusUnits = bodyRadiusUnits(data.radiusKm, data.name);

    this.container.addChild(this.childrenLayer);

    this.sprite = new Graphics();
    this.sprite.circle(0, 0, this.radiusUnits).fill(data.color);
    this.container.addChild(this.sprite);

    if (parent && data.orbit && data.parentMu !== undefined) {
      this.orbit = {
        a: data.orbit.aKm,
        e: data.orbit.e,
        omega: data.orbit.omega,
        M0: data.orbit.M0,
        mu: data.parentMu,
      };
      const ring = new Graphics();
      drawOrbitRing(ring, this.orbit, this.kmPerUnit, 1, 0x335577);
      parent.childrenLayer.addChildAt(ring, 0);
      this.orbitRecord = {
        graphics: ring,
        orbit: this.orbit,
        kmPerUnit: this.kmPerUnit,
      };

      parent.container.addChild(this.container);
      parent.children.push(this);
    }

    for (const child of data.children ?? []) {
      new Body(child, this);
    }
  }

  isVisible(): boolean {
    let cur: Body | undefined = this.parent;
    while (cur) {
      if (!cur.childrenLayer.visible) return false;
      cur = cur.parent;
    }
    return true;
  }

  getWorldPos(): { x: number; y: number } {
    let x = this.container.x;
    let y = this.container.y;
    let p = this.parent;
    while (p) {
      x += p.container.x;
      y += p.container.y;
      p = p.parent;
    }
    return { x, y };
  }

  update(simTime: number) {
    if (this.orbit) {
      const p = positionAt(this.orbit, simTime);
      this.container.x = p.x / this.kmPerUnit;
      this.container.y = p.y / this.kmPerUnit;
    }
    for (const child of this.children) child.update(simTime);
  }

  updateSelection(selectedName: string | null) {
    const showChildren =
      this.parent === undefined || this.data.name === selectedName;
    this.childrenLayer.visible = showChildren;
    for (const child of this.children) child.updateSelection(selectedName);
  }
}

export class SolarSystem {
  readonly view = new Container();
  readonly root: Body;
  private readonly allBodies: Body[] = [];
  private readonly highlight: Graphics;
  private currentZoom = 1;
  private currentSelected: string | null = null;

  constructor() {
    this.root = new Body(SOLAR_SYSTEM);
    this.view.addChild(this.root.container);
    this.collectBodies(this.root);

    this.highlight = new Graphics();
    this.view.addChild(this.highlight);

    useGameStore.subscribe((state) => {
      if (state.zoom !== this.currentZoom) {
        this.currentZoom = state.zoom;
        this.setZoom(state.zoom);
      }
      if (state.selectedBody !== this.currentSelected) {
        this.currentSelected = state.selectedBody;
        this.setSelected(state.selectedBody);
      }
    });
  }

  private collectBodies(b: Body) {
    this.allBodies.push(b);
    for (const c of b.children) this.collectBodies(c);
  }

  setZoom(zoom: number) {
    this.currentZoom = zoom;
    const w = 1 / zoom;
    for (const b of this.allBodies) {
      if (b.orbitRecord) {
        drawOrbitRing(
          b.orbitRecord.graphics,
          b.orbitRecord.orbit,
          b.orbitRecord.kmPerUnit,
          w,
          0x335577,
        );
      }
    }
    if (this.currentSelected) this.updateHighlight(this.currentSelected);
  }

  setSelected(name: string | null) {
    this.root.updateSelection(name);
    this.updateHighlight(name);
  }

  private updateHighlight(name: string | null) {
    this.highlight.clear();
    if (!name) return;
    const body = this.allBodies.find((b) => b.data.name === name);
    if (!body) return;
    const p = body.getWorldPos();
    const ringR = Math.max(body.radiusUnits * 2.5, 5 / this.currentZoom);
    this.highlight
      .circle(p.x, p.y, ringR)
      .stroke({ width: 1 / this.currentZoom, color: 0x00ffcc });
  }

  pickSelection(wx: number, wy: number, tolerance: number): string | null {
    let best: Body | null = null;
    let bestDist = Infinity;
    for (const b of this.allBodies) {
      if (b === this.root) continue;
      if (!b.isVisible()) continue;
      const p = b.getWorldPos();
      const dx = wx - p.x;
      const dy = wy - p.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const r = Math.max(b.radiusUnits, tolerance);
      if (d <= r && d < bestDist) {
        bestDist = d;
        best = b;
      }
    }
    if (!best) return null;
    if (best.parent === this.root) return best.data.name;
    if (best.parent?.parent === this.root) return best.parent.data.name;
    return null;
  }

  update(simTime: number) {
    this.root.update(simTime);
    if (this.currentSelected) this.updateHighlight(this.currentSelected);
  }
}