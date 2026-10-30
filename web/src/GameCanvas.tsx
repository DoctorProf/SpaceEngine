import { useEffect, useRef } from "react";
import { Assets, type Texture } from "pixi.js";
import { createPixelApp, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from "./game/render/PixelApp";
import { SolarSystem } from "./game/scene/SolarSystem";
import { Camera } from "./game/engine/Camera";
import { startGameLoop } from "./game/engine/GameLoop";
import { useGameStore } from "./state/gameStore";

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
        useGameStore.getState().selectBody(name);
      };

      const onDblClick = (e: MouseEvent) => {
        const { vx, vy } = toVirtual(e);
        const world = camera.screenToWorld(vx, vy);
        const name = solarSystem.pickSelection(world.x, world.y, 12 / camera.zoom);
        if (name) {
          useGameStore.getState().focusBody(name);
          const pos = solarSystem.getBodyWorldPos(name);
          if (pos) camera.followOn(name, pos, 16);
        }
      };

      // Обработка focusRequest из PlanetList (с защитой от рекурсии)
      const unsubscribe = useGameStore.subscribe((state) => {
        const req = state.focusRequest;
        if (!req) return;

        // Очищаем СИНХРОННО до вызова focusBody —
        // setState сразу триггерит subscribe, но req уже null → выходим.
        useGameStore.setState({ focusRequest: null });

        const pos = solarSystem.getBodyWorldPos(req.name);
        if (pos) {
          useGameStore.getState().focusBody(req.name);
          camera.followOn(req.name, pos, req.zoom);
        }
      });

      app.canvas.addEventListener("mousedown", onDown);
      app.canvas.addEventListener("mouseup", onUp);
      app.canvas.addEventListener("dblclick", onDblClick);

      cleanup = () => {
        unsubscribe();
        app.canvas.removeEventListener("mousedown", onDown);
        app.canvas.removeEventListener("mouseup", onUp);
        app.canvas.removeEventListener("dblclick", onDblClick);
        app.destroy(true, { children: true });
      };
    })();

    return () => { cancelled = true; cleanup?.(); };
  }, []);

  return <div ref={containerRef} className="game-canvas-container" />;
}