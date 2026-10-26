import { Application, TextureStyle } from "pixi.js";

export const VIRTUAL_WIDTH = 480;
export const VIRTUAL_HEIGHT = 270;

TextureStyle.defaultOptions.scaleMode = "nearest";

export async function createPixelApp(): Promise<Application> {
  const app = new Application();
  await app.init({
    width: VIRTUAL_WIDTH,
    height: VIRTUAL_HEIGHT,
    antialias: false,
    resolution: 1,
    autoDensity: false,
    roundPixels: true,
    backgroundColor: 0x000010,
    preference: "webgl",
  });
  return app;
}