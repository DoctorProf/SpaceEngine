import { useEffect, useRef } from "react";
import { createPixelApp, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from "./game/render/PixelApp";
import { SolarSystem } from "./game/scene/SolarSystem";
import { Camera } from "./game/engine/Camera";
import { startGameLoop } from "./game/engine/GameLoop";
import { useGameStore } from "./state/gameStore";

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const app = await createPixelApp();
      if (cancelled) {
        app.destroy(true);
        return;
      }

      const container = containerRef.current!;
      container.appendChild(app.canvas);

      const solarSystem = new SolarSystem();
      const camera = new Camera(solarSystem.view);
      camera.attach(app.canvas);

      app.stage.addChild(solarSystem.view);
      startGameLoop(app.ticker, solarSystem);

      let downX = 0;
      let downY = 0;

      const onDown = (e: MouseEvent) => {
        if (e.button === 0) {
          downX = e.clientX;
          downY = e.clientY;
        }
      };

      const onUp = (e: MouseEvent) => {
        if (e.button !== 0) return;
        const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
        if (moved > 4) return;

        const rect = app.canvas.getBoundingClientRect();
        const vx = ((e.clientX - rect.left) / rect.width) * VIRTUAL_WIDTH;
        const vy = ((e.clientY - rect.top) / rect.height) * VIRTUAL_HEIGHT;
        const world = camera.screenToWorld(vx, vy);
        const name = solarSystem.pickSelection(
          world.x,
          world.y,
          8 / camera.zoom,
        );
        useGameStore.setState({ selectedBody: name });
      };

      app.canvas.addEventListener("mousedown", onDown);
      app.canvas.addEventListener("mouseup", onUp);

      cleanup = () => {
        app.canvas.removeEventListener("mousedown", onDown);
        app.canvas.removeEventListener("mouseup", onUp);
        app.destroy(true, { children: true });
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <div ref={containerRef} className="game-canvas-container" />;
}