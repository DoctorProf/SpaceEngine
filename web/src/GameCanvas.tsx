import { useEffect, useRef } from "react";
import { Assets, type Texture } from "pixi.js";
import { createPixelApp, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from "./game/render/PixelApp";
import { SolarSystem } from "./game/scene/SolarSystem";
import { Camera } from "./game/engine/Camera";
import { startGameLoop } from "./game/engine/GameLoop";
import { useGameStore } from "./state/gameStore";
import { focusZoomFor } from "./game/focus";
import { KM_PER_UNIT } from "./game/physics/Scales";

const pngModules = import.meta.glob<string>("./assets/sprites/bodies/*.png", {
  eager: true, query: "?url", import: "default",
});
const jpgModules = import.meta.glob<string>("./assets/sprites/bodies/*.jpg", {
  eager: true, query: "?url", import: "default",
});
const spriteModules: Record<string, string> = { ...pngModules, ...jpgModules };

async function loadTextures(): Promise<Map<string, Texture>> {
  const textures = new Map<string, Texture>();
  for (const [path, url] of Object.entries(spriteModules)) {
    const base = path.split("/").pop()!.replace(/\.(png|jpg|jpeg)$/i, "").toLowerCase();
    try { textures.set(base, await Assets.load<Texture>(url)); }
    catch (e) { console.warn(`[sprites] failed: "${base}"`, e); }
  }
  console.log(`[sprites] loaded ${textures.size}:`, [...textures.keys()].sort());
  return textures;
}

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const app = await createPixelApp();
      if (cancelled) { app.destroy(true); return; }
      const container = containerRef.current!;
      container.appendChild(app.canvas);

      const textures = await loadTextures();
      if (cancelled) { app.destroy(true); return; }

      const solarSystem = new SolarSystem(textures);
      const camera = new Camera(solarSystem.view);
      camera.attach(app.canvas);

      app.stage.addChild(solarSystem.view);
      startGameLoop(app.ticker, solarSystem, camera);

      let downX = 0, downY = 0;
      let lastHoverName: string | null = null;
      let lastHoverX = -1000, lastHoverY = -1000;

      const toVirtual = (e: MouseEvent) => {
        const rect = app.canvas.getBoundingClientRect();
        return {
          vx: ((e.clientX - rect.left) / rect.width) * VIRTUAL_WIDTH,
          vy: ((e.clientY - rect.top) / rect.height) * VIRTUAL_HEIGHT,
        };
      };

      const onDown = (e: MouseEvent) => {
        if (e.button === 0) { downX = e.clientX; downY = e.clientY; }
      };

      const onUp = (e: MouseEvent) => {
        if (e.button !== 0) return;
        if (Math.hypot(e.clientX - downX, e.clientY - downY) > 4) return;
        
        const { vx, vy } = toVirtual(e);
        const world = camera.screenToWorld(vx, vy);
        const name = solarSystem.pickSelection(world.x, world.y, 10 / camera.zoom);
        if (name) {
          useGameStore.getState().requestFocus(name, focusZoomFor(name));
        } else {
          useGameStore.getState().selectBody(null);
          camera.clearFollow();
        }
      };

      const onMouseMove = (e: MouseEvent) => {
        const { vx, vy } = toVirtual(e);
        const world = camera.screenToWorld(vx, vy);
        const name = solarSystem.pickSelection(world.x, world.y, 10 / camera.zoom);

        const dx = e.clientX - lastHoverX;
        const dy = e.clientY - lastHoverY;
        if (name === lastHoverName && Math.hypot(dx, dy) < 8) return;

        lastHoverName = name;
        lastHoverX = e.clientX;
        lastHoverY = e.clientY;

        if (name) {
          const body = solarSystem.getBody(name);
          const selectedName = useGameStore.getState().selectedBody;
          
          if (body) {
            const info = body.getInfo(useGameStore.getState().simTime);
            
            // Считаем расстояние до выбранной планеты, если она есть и это не она сама
            let distToSelectedKm: number | undefined = undefined;
            if (selectedName && selectedName !== name) {
              const selectedBody = solarSystem.getBody(selectedName);
              if (selectedBody) {
                const p1 = body.getWorldPos();
                const p2 = selectedBody.getWorldPos();
                const dxWorld = p2.x - p1.x;
                const dyWorld = p2.y - p1.y;
                const distUnits = Math.sqrt(dxWorld * dxWorld + dyWorld * dyWorld);
                distToSelectedKm = distUnits * KM_PER_UNIT;
              }
            }

            useGameStore.getState().setHovered({
              name,
              screenX: e.clientX,
              screenY: e.clientY,
              radiusKm: info.radiusKm,
              parentName: info.parentName,
              distanceKm: info.currentDistanceKm,
              color: body.data.color,
              distToSelectedKm,
            });
            return;
          }
        }
        useGameStore.getState().setHovered(null);
      };

      const onMouseLeave = () => {
        lastHoverName = null;
        useGameStore.getState().setHovered(null);
      };

      const unsubscribe = useGameStore.subscribe((state) => {
      const req = state.focusRequest;

      if (req) {
        useGameStore.setState({ focusRequest: null });

        const pos = solarSystem.getBodyWorldPos(req.name);
        const body = solarSystem.getBody(req.name);

        if (pos && body) {
          useGameStore.getState().focusBody(req.name);

          // Радиус тела переводим из километров в единицы мира.
          const radiusUnits = body.data.radiusKm / KM_PER_UNIT;

          // Точка фокуса смещена к нижней поверхности тела.
          const surfaceOffset = {
            x: 0,
            y: -radiusUnits,
          };

          camera.followOn(
            req.name,
            pos,
            req.zoom,
            surfaceOffset,
          );
        }
      }
    });

      app.canvas.addEventListener("mousedown", onDown);
      app.canvas.addEventListener("mouseup", onUp);
      app.canvas.addEventListener("mousemove", onMouseMove);
      app.canvas.addEventListener("mouseleave", onMouseLeave);

      cleanup = () => {
        unsubscribe();
        app.canvas.removeEventListener("mousedown", onDown);
        app.canvas.removeEventListener("mouseup", onUp);
        app.canvas.removeEventListener("mousemove", onMouseMove);
        app.canvas.removeEventListener("mouseleave", onMouseLeave);
        app.destroy(true, { children: true });
      };
    })();

    return () => { cancelled = true; cleanup?.(); };
  }, []);

  return <div ref={containerRef} className="game-canvas-container" />;
}