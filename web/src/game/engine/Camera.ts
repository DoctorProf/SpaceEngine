import type { Container } from "pixi.js";
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from "../render/PixelApp";
import { useGameStore } from "../../state/gameStore";

const ZOOM_LEVELS = [0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
const INITIAL_INDEX = 3;
const FIT_ALL_INDEX = 0;

export class Camera {
  private readonly world: Container;
  private zoomIndex = INITIAL_INDEX;
  private target = { x: 0, y: 0 };
  private followName: string | null = null;

  constructor(world: Container) {
    this.world = world;
    this.apply();
    this.syncStore();
  }

  get zoom(): number {
    return ZOOM_LEVELS[this.zoomIndex];
  }

  get following(): string | null {
    return this.followName;
  }

  screenToWorld(sx: number, sy: number) {
    return {
      x: this.target.x + (sx - VIRTUAL_WIDTH / 2) / this.zoom,
      y: this.target.y + (sy - VIRTUAL_HEIGHT / 2) / this.zoom,
    };
  }

  focusOn(worldX: number, worldY: number, targetZoom?: number) {
    this.followName = null;
    this.target.x = worldX;
    this.target.y = worldY;
    if (targetZoom !== undefined) {
      const idx = ZOOM_LEVELS.indexOf(targetZoom);
      if (idx >= 0) this.zoomIndex = idx;
    }
    this.apply();
    this.syncStore();
  }

  followOn(name: string, pos: { x: number; y: number }, targetZoom?: number) {
    this.followName = name;
    this.target.x = pos.x;
    this.target.y = pos.y;
    if (targetZoom !== undefined) {
      const idx = ZOOM_LEVELS.indexOf(targetZoom);
      if (idx >= 0) this.zoomIndex = idx;
    }
    this.apply();
    this.syncStore();
  }

  clearFollow() {
    this.followName = null;
  }

  tickFollow(pos: { x: number; y: number } | null) {
    if (!this.followName || !pos) return;
    this.target.x = pos.x;
    this.target.y = pos.y;
    this.apply();
  }

  attach(canvas: HTMLCanvasElement) {
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const dir = e.deltaY < 0 ? 1 : -1;

        // Если следуем за телом — зум вокруг него, фокус сохраняется.
        if (this.followName) {
          this.setZoomIndex(this.zoomIndex + dir);
        } else {
          const rect = canvas.getBoundingClientRect();
          const sx = ((e.clientX - rect.left) / rect.width) * VIRTUAL_WIDTH;
          const sy = ((e.clientY - rect.top) / rect.height) * VIRTUAL_HEIGHT;
          this.zoomAt(this.zoomIndex + dir, sx, sy);
        }
      },
      { passive: false },
    );

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener("mousedown", (e) => {
      this.clearFollow();
      if (e.button === 2) {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = VIRTUAL_WIDTH / rect.width;
      const scaleY = VIRTUAL_HEIGHT / rect.height;
      this.pan((e.clientX - lastX) * scaleX, (e.clientY - lastY) * scaleY);
      lastX = e.clientX;
      lastY = e.clientY;
    });

    const stop = () => {
      dragging = false;
    };
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("mouseleave", stop);

    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyR") {
        this.clearFollow();
        this.reset();
      }
      if (e.code === "KeyF") {
        this.clearFollow();
        this.fitAll();
      }
    });
  }

  private setZoomIndex(newIndex: number) {
    const clamped = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, newIndex));
    if (clamped === this.zoomIndex) return;
    this.zoomIndex = clamped;
    this.apply();
    this.syncStore();
  }

  private zoomAt(newIndex: number, screenX: number, screenY: number) {
    const clamped = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, newIndex));
    if (clamped === this.zoomIndex) return;

    const oldZoom = this.zoom;
    const wx = this.target.x + (screenX - VIRTUAL_WIDTH / 2) / oldZoom;
    const wy = this.target.y + (screenY - VIRTUAL_HEIGHT / 2) / oldZoom;

    this.zoomIndex = clamped;
    const newZoom = this.zoom;

    this.target.x = wx - (screenX - VIRTUAL_WIDTH / 2) / newZoom;
    this.target.y = wy - (screenY - VIRTUAL_HEIGHT / 2) / newZoom;

    this.apply();
    this.syncStore();
  }

  private pan(dxScreen: number, dyScreen: number) {
    this.target.x -= dxScreen / this.zoom;
    this.target.y -= dyScreen / this.zoom;
    this.apply();
  }

  private reset() {
    this.zoomIndex = INITIAL_INDEX;
    this.target.x = 0;
    this.target.y = 0;
    this.apply();
    this.syncStore();
  }

  private fitAll() {
    this.zoomIndex = FIT_ALL_INDEX;
    this.target.x = 0;
    this.target.y = 0;
    this.apply();
    this.syncStore();
  }

  private apply() {
    this.world.scale.set(this.zoom);
    this.world.x = VIRTUAL_WIDTH / 2 - this.target.x * this.zoom;
    this.world.y = VIRTUAL_HEIGHT / 2 - this.target.y * this.zoom;
  }

  private syncStore() {
    useGameStore.setState({ zoom: this.zoom });
  }
}