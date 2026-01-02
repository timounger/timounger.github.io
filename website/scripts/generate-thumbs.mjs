/**
 * Generates square thumbnail variants of the hero gallery images.
 *
 * For each source image in public/img it creates a center-cropped,
 * THUMB_SIZE x THUMB_SIZE WebP thumbnail next to it (named *_thumb.webp) and
 * then prints the resulting directory listing.
 *
 * @module
 */
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

/** Absolute path to the public image directory. */
const IMG_DIR = new URL("../public/img/", import.meta.url).pathname.replace(/^\//, "");
/** Source image filenames to generate thumbnails for. */
const SOURCES = [
  "bonprinterbox_front.webp",
  "article_view.webp",
  "staff.webp",
  "printer.webp",
  "nfc.webp",
  "sumup.webp",
];
/** Edge length in pixels of the generated square thumbnails. */
const THUMB_SIZE = 200;

for (const file of SOURCES) {
  const src = join(IMG_DIR, file);
  const out = join(IMG_DIR, file.replace(/\.webp$/, "_thumb.webp"));
  await sharp(src)
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: "cover", position: "centre" })
    .webp({ quality: 80 })
    .toFile(out);
  console.log(`${file} -> ${file.replace(/\.webp$/, "_thumb.webp")}`);
}

console.log("\nDone. Thumbnails saved to public/img/*_thumb.webp");
console.log("Existing files in folder:");
for (const f of (await readdir(IMG_DIR)).sort()) console.log("  " + f);
