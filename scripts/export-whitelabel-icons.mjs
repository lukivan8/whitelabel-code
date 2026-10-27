// @effect-diagnostics nodeBuiltinImport:off
import * as NodeFSP from "node:fs/promises";
import sharp from "sharp";
import { encodePngIco, WINDOWS_ICON_SIZES } from "./lib/icon-export.ts";

const directory = new URL("../assets/whitelabel/", import.meta.url);
const svg = await NodeFSP.readFile(new URL("icon.svg", directory));
for (const size of [16, 32, 180, 1024]) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(new URL(`icon-${size}.png`, directory).pathname);
}
const renditions = await Promise.all(
  WINDOWS_ICON_SIZES.map(async (size) => ({
    size,
    contents: await sharp(svg).resize(size, size).png().toBuffer(),
  })),
);
await NodeFSP.writeFile(new URL("icon.ico", directory), encodePngIco(renditions));
for (const [source, destination] of [
  ["icon.ico", "favicon.ico"],
  ["icon-16.png", "favicon-16x16.png"],
  ["icon-32.png", "favicon-32x32.png"],
  ["icon-180.png", "apple-touch-icon.png"],
]) {
  await NodeFSP.writeFile(
    new URL(`../apps/web/public/${destination}`, import.meta.url),
    await NodeFSP.readFile(new URL(source, directory)),
  );
}
