/**
 * Generates electron/icon.ico (multi-resolution) from the BonPrinter app icon,
 * used as the Windows executable / window icon for the desktop build.
 *
 * @module
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const root = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(root, "..", "public", "pos-demo", "app.png");
const OUT = path.join(root, "..", "electron", "icon.ico");
/** Icon resolutions packed into the .ico. */
const SIZES = [16, 32, 48, 64, 128, 256];
/** Transparent background for the square padding. */
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

const buffers = await Promise.all(
  SIZES.map((size) => sharp(SRC).resize(size, size, { fit: "contain", background: TRANSPARENT }).png().toBuffer()),
);
await writeFile(OUT, await pngToIco(buffers));
console.log(`Wrote ${OUT} (${SIZES.join(", ")} px)`);
