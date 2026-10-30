import { Container, Graphics, Sprite, Texture } from "pixi.js";
import {
  positionAt, speedAt, orbitalPeriod, periapsis, apoapsis,
  computeM0FromEphemeris, deg2rad,
  type Orbit,
} from "../physics/Orbit";
import { SOLAR_SYSTEM, type BodyData, SUN_MU } from "../data/bodies";
import {
  KM_PER_UNIT, bodyRadiusUnits,
  soiRadiusPlanetKm, soiRadiusMoonKm,
} from "../physics/Scales";
import { useGameStore, type BodyInfo } from "../../state/gameStore";
import { polarFromXY, getOriginPlanetName } from "../physics/Transfer";

const ORBIT_MIN_PX = 15;
const MIN_RENDER_PX = 1.5;
const ARC_TARGET_PX = 1.5;
const SOI_MIN_PX = 3;
const SOI_MIN_PX_SELECTED = 6;

interface OrbitRecord {
  graphics: Graphics;
  orbit: Orbit;
}

function drawOrbitRing(
  g: Graphics, orbit: Orbit,
  strokeWidth: number, color: number, zoom: number,
) {
  const period = orbitalPeriod(orbit);
  const circumferencePx = 2 * Math.PI * (orbit.a / KM_PER_UNIT) * zoom;
  const steps = Math.max(128, Math.min(4096, Math.ceil(circumferencePx / 2)));

  g.clear();
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * period;
    const p = positionAt(orbit, t);
    const x = p.x / KM_PER_UNIT;
    const y = p.y / KM_PER_UNIT;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke({ width: strokeWidth, color });
}

function drawDashedCircle(
  g: Graphics, rUnits: number, strokeWidth: number, color: number, zoom: number,
) {
  const rPx = rUnits * zoom;
  if (rPx < 2) { g.clear(); return; }
  const circumferencePx = 2 * Math.PI * rPx;
  const steps = Math.max(64, Math.min(1024, Math.ceil(circumferencePx / 6)));
  const dashOn = 3;

  g.clear();
  let drawing = false;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const x = Math.cos(a) * rUnits;
    const y = Math.sin(a) * rUnits;
    if (i % (dashOn * 2) < dashOn) {
      if (!drawing) { g.moveTo(x, y); drawing = true; }
      else g.lineTo(x, y);
    } else {
      if (drawing) { g.stroke({ width: strokeWidth, color }); drawing = false; }
    }
  }
  if (drawing) g.stroke({ width: strokeWidth, color });
}

export class Body {
  readonly container = new Container();
  readonly childrenLayer = new Container();
  readonly children: Body[] = [];
  readonly data: BodyData;
  readonly parent?: Body;
  readonly radiusUnits: number;
  readonly sprite: Sprite | Graphics;
  readonly orbitRecord?: OrbitRecord;
  readonly soiGfx: Graphics;
  soiRadiusKm = 0;

  private readonly orbit?: Orbit;
  private spriteSegments = 0;

  constructor(data: BodyData, textures: Map<string, Texture>, parent?: Body) {
    this.data = data;
    this.parent = parent;
    this.radiusUnits = bodyRadiusUnits(data.radiusKm);

    this.container.addChild(this.childrenLayer);

    const tex = textures.get(data.name.toLowerCase());
    if (tex) {
      const sp = new Sprite(tex);
      sp.anchor.set(0.5);
      this.sprite = sp;
    } else {
      this.sprite = new Graphics();
    }
    this.container.addChild(this.sprite);

    this.soiGfx = new Graphics();
    this.soiGfx.visible = false;
    this.container.addChildAt(this.soiGfx, 0);

    if (parent && data.orbit && data.parentMu !== undefined) {
      const o = data.orbit;
      let M0: number, omega: number;
      if (o.meanLongitudeDeg !== undefined) {
        M0 = computeM0FromEphemeris({
          meanLongitudeDeg: o.meanLongitudeDeg,
          periLongitudeDeg: o.periLongitudeDeg!,
          periodDays: o.periodDays!,
        });
        omega = deg2rad(o.periLongitudeDeg!);
      } else {
        M0 = o.M0 ?? 0;
        omega = o.omega ?? 0;
      }

      this.orbit = { a: o.aKm, e: o.e, omega, M0, mu: data.parentMu };

      const ring = new Graphics();
      drawOrbitRing(ring, this.orbit, 1, 0x335577, 1);
      parent.childrenLayer.addChildAt(ring, 0);
      this.orbitRecord = { graphics: ring, orbit: this.orbit };

      if (parent.data.name === "Sun") {
        this.soiRadiusKm = soiRadiusPlanetKm(o.aKm, data.massKg);
      } else {
        this.soiRadiusKm = soiRadiusMoonKm(o.aKm, data.massKg, parent.data.massKg);
      }

      parent.container.addChild(this.container);
      parent.children.push(this);
    }

    // Стартовая инициализация размера
    this.updateSizeForZoom(1);
    for (const child of data.children ?? []) {
      new Body(child, textures, this);
    }
  }

  updateSizeForZoom(zoom: number) {
    const minUnits = MIN_RENDER_PX / zoom;
    const displayR = Math.max(this.radiusUnits, minUnits);

    if (this.sprite instanceof Sprite) {
      this.sprite.width = displayR * 2;
      this.sprite.height = displayR * 2;
    } else {
      this.redrawCircle(displayR);
    }
  }

  private redrawCircle(displayR: number) {
    const g = this.sprite as Graphics;
    const radiusPx = displayR * 1000;
    const segments = Math.max(24, Math.min(256,
      Math.ceil((Math.PI * 2 * Math.min(radiusPx, 100)) / ARC_TARGET_PX)));
    if (segments === this.spriteSegments) return;
    g.clear();
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const x = Math.cos(a) * displayR;
      const y = Math.sin(a) * displayR;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fill(this.data.color);
    this.spriteSegments = segments;
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
    let x = this.container.x, y = this.container.y, p = this.parent;
    while (p) { x += p.container.x; y += p.container.y; p = p.parent; }
    return { x, y };
  }

  update(simTime: number) {
    if (this.orbit) {
      const p = positionAt(this.orbit, simTime);
      this.container.x = p.x / KM_PER_UNIT;
      this.container.y = p.y / KM_PER_UNIT;
    }
    for (const child of this.children) child.update(simTime);
  }

  private hasInSubtree(name: string | null): boolean {
    if (!name) return false;
    if (this.data.name === name) return true;
    for (const c of this.children) if (c.hasInSubtree(name)) return true;
    return false;
  }

  updateSelection(selectedName: string | null) {
    const showChildren =
      this.parent === undefined || this.hasInSubtree(selectedName);
    this.childrenLayer.visible = showChildren;
    for (const child of this.children) child.updateSelection(selectedName);
  }

  updateVisibility(zoom: number) {
    if (this.parent) {
      const parentLayerVisible = this.parent.childrenLayer.visible;
      this.sprite.visible = parentLayerVisible;

      if (this.orbitRecord && this.orbit) {
        const orbitPx = (this.orbit.a / KM_PER_UNIT) * zoom;
        this.orbitRecord.graphics.visible =
          parentLayerVisible && orbitPx >= ORBIT_MIN_PX;
      }
    }
    for (const c of this.children) c.updateVisibility(zoom);
  }

  updateSOI(show: boolean, zoom: number, selectedName: string | null) {
    const isPlanet = this.parent?.data.name === "Sun";
    const hasSOI = this.soiRadiusKm > 0 && isPlanet;

    if (!show || !hasSOI) {
      this.soiGfx.visible = false;
      for (const c of this.children) c.updateSOI(show, zoom, selectedName);
      return;
    }

    const rUnits = this.soiRadiusKm / KM_PER_UNIT;
    const rPx = rUnits * zoom;
    const isSelected = this.data.name === selectedName;

    if (rPx < SOI_MIN_PX && !isSelected) {
      this.soiGfx.visible = false;
      for (const c of this.children) c.updateSOI(show, zoom, selectedName);
      return;
    }

    const displayR = isSelected
      ? Math.max(rUnits, SOI_MIN_PX_SELECTED / zoom)
      : rUnits;

    this.soiGfx.visible = true;
    const color = isSelected ? 0x00ffcc : 0x556688;
    const thickness = isSelected ? 2 / zoom : 1 / zoom;
    drawDashedCircle(this.soiGfx, displayR, thickness, color, zoom);

    for (const c of this.children) c.updateSOI(show, zoom, selectedName);
  }

  getInfo(simTime: number): BodyInfo {
    const info: BodyInfo = {
      name: this.data.name,
      radiusKm: this.data.radiusKm,
      massKg: this.data.massKg,
      parentName: this.parent?.data.name ?? null,
      soiRadiusKm: this.soiRadiusKm > 0 ? this.soiRadiusKm : undefined,
    };
    if (this.orbit && this.parent) {
      const p = positionAt(this.orbit, simTime);
      const r = Math.sqrt(p.x * p.x + p.y * p.y);
      info.aKm = this.orbit.a;
      info.e = this.orbit.e;
      info.periapsisKm = periapsis(this.orbit);
      info.apoapsisKm = apoapsis(this.orbit);
      info.periodSeconds = orbitalPeriod(this.orbit);
      info.currentDistanceKm = r;
      info.currentSpeedKmS = speedAt(this.orbit, r);
    }
    return info;
  }

  getPolarFromParent(): { rKm: number; angle: number } | null {
    if (!this.parent || !this.orbit) return null;
    return polarFromXY(
      this.container.x * KM_PER_UNIT,
      this.container.y * KM_PER_UNIT,
    );
  }
}

export class SolarSystem {
  readonly view = new Container();
  readonly root: Body;
  private readonly allBodies: Body[] = [];
  private readonly highlight: Graphics;
  private readonly transferGfx: Graphics;
  private currentZoom = 0.25;
  private currentSelected: string | null = null;
  private currentTransferTarget: string | null = null;
  private currentShowSOI = false;

  constructor(textures: Map<string, Texture>) {
    this.root = new Body(SOLAR_SYSTEM, textures);
    this.view.addChild(this.root.container);
    this.collectBodies(this.root);

    this.transferGfx = new Graphics();
    this.view.addChild(this.transferGfx);
    this.highlight = new Graphics();
    this.view.addChild(this.highlight);

    useGameStore.subscribe((state) => {
      if (state.zoom !== this.currentZoom) {
        this.currentZoom = state.zoom;
        this.setZoom(state.zoom);
      }
      if (state.selectedBody !== this.currentSelected) {
        this.setSelected(state.selectedBody);
      }
      if (state.transferTarget !== this.currentTransferTarget) {
        this.currentTransferTarget = state.transferTarget;
      }
      if (state.showSOI !== this.currentShowSOI) {
        this.currentShowSOI = state.showSOI;
        this.root.updateSOI(this.currentShowSOI, this.currentZoom, this.currentSelected);
      }
    });

    this.root.updateVisibility(this.currentZoom);
  }

  private collectBodies(b: Body) {
    this.allBodies.push(b);
    for (const c of b.children) this.collectBodies(c);
  }

  setZoom(zoom: number) {
    this.currentZoom = zoom;
    const w = 1 / zoom;

    for (const b of this.allBodies) {
      b.updateSizeForZoom(zoom);
      if (b.orbitRecord) {
        drawOrbitRing(b.orbitRecord.graphics, b.orbitRecord.orbit, w, 0x335577, zoom);
      }
    }

    this.root.updateVisibility(zoom);
    this.root.updateSOI(this.currentShowSOI, zoom, this.currentSelected);
    if (this.currentSelected) this.updateHighlight(this.currentSelected);
  }

  setSelected(name: string | null) {
    this.currentSelected = name;
    this.root.updateSelection(name);
    this.updateHighlight(name);
    this.root.updateSOI(this.currentShowSOI, this.currentZoom, name);
    if (!name) useGameStore.setState({ selectedInfo: null });
  }

  getBodyWorldPos(name: string): { x: number; y: number } | null {
    const body = this.allBodies.find((b) => b.data.name === name);
    return body ? body.getWorldPos() : null;
  }

  getBody(name: string): Body | undefined {
    return this.allBodies.find((b) => b.data.name === name);
  }

  private drawTransferPreview() {
    this.transferGfx.clear();
    const target = this.currentTransferTarget;
    if (!target) return;

    const originName = getOriginPlanetName(useGameStore.getState().selectedBody);
    if (originName === target) return;

    const origin = this.getBody(originName);
    const dest = this.getBody(target);
    if (!origin || !dest || !origin.orbit || !dest.orbit) return;
    if (origin.parent?.data.name !== "Sun" || dest.parent?.data.name !== "Sun") return;

    const r1 = origin.orbit.a;
    const r2 = dest.orbit.a;
    const aT = (r1 + r2) / 2;
    const eT = Math.abs(r2 - r1) / (r2 + r1);

    const originPos = origin.getPolarFromParent();
    if (!originPos) return;

    const outbound = r2 > r1;
    const omega = outbound ? originPos.angle : originPos.angle + Math.PI;
    const M0 = outbound ? 0 : Math.PI;
    const transferOrbit: Orbit = { a: aT, e: eT, omega, M0, mu: SUN_MU };

    const period = orbitalPeriod(transferOrbit);
    const steps = 360;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * period;
      const p = positionAt(transferOrbit, t);
      const x = p.x / KM_PER_UNIT;
      const y = p.y / KM_PER_UNIT;
      if (i === 0) this.transferGfx.moveTo(x, y);
      else this.transferGfx.lineTo(x, y);
    }
    this.transferGfx.stroke({ width: 1 / this.currentZoom, color: 0xffaa33 });
  }

  private updateHighlight(name: string | null) {
    this.highlight.clear();
    if (!name) return;
    const body = this.allBodies.find((b) => b.data.name === name);
    if (!body) return;
    const p = body.getWorldPos();
    const minWorld = 4 / this.currentZoom;
    const ringR = Math.max(
      Math.max(body.radiusUnits, MIN_RENDER_PX / this.currentZoom) * 1.5,
      minWorld,
    );
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
      if (!b.sprite.visible) continue;
      const p = b.getWorldPos();
      const dx = wx - p.x, dy = wy - p.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const r = Math.max(b.radiusUnits, tolerance);
      if (d <= r && d < bestDist) { bestDist = d; best = b; }
    }
    return best ? best.data.name : null;
  }

  update(simTime: number) {
    this.root.update(simTime);
    if (this.currentSelected) {
      this.updateHighlight(this.currentSelected);
      const body = this.allBodies.find((b) => b.data.name === this.currentSelected);
      if (body) useGameStore.setState({ selectedInfo: body.getInfo(simTime) });
    }
    this.drawTransferPreview();
  }
}