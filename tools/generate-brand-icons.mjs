import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

// All browser and installed-app assets derive from the same editable SVG.
const source = await readFile(
  new URL("../public/brand/barhoppr-mark.svg", import.meta.url),
);
const directory = new URL("../public/icons/", import.meta.url);
await mkdir(directory, { recursive: true });

for (const size of [192, 512]) {
  const icon = await sharp(source)
    .resize(size, size)
    .flatten({ background: "#F7B725" })
    .png()
    .toBuffer();
  await writeFile(new URL(`icon-${size}.png`, directory), icon);
}
await sharp(source)
  .resize(180, 180)
  .flatten({ background: "#F7B725" })
  .png()
  .toBuffer()
  .then((buffer) =>
    writeFile(new URL("apple-touch-icon.png", directory), buffer),
  );

// Keep the entire symbol inside the central maskable-icon safe area.
const maskable = await sharp(source)
  .resize(384, 384)
  .extend({ top: 64, bottom: 64, left: 64, right: 64, background: "#F7B725" })
  .flatten({ background: "#F7B725" })
  .png()
  .toBuffer();
await writeFile(new URL("icon-maskable-512.png", directory), maskable);

// ICO supports embedded PNG frames; provide crisp 16, 32, and 48 px variants.
const sizes = [16, 32, 48];
const frames = await Promise.all(
  sizes.map((size) => sharp(source).resize(size, size).png().toBuffer()),
);
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
for (const [index, frame] of frames.entries()) {
  const entry = 6 + index * 16;
  header[entry] = sizes[index];
  header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(frame.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
}
await writeFile(
  new URL("../src/app/favicon.ico", import.meta.url),
  Buffer.concat([header, ...frames]),
);
console.log(
  "Generated favicon, Apple touch icon, and app icons from the BarHoppr mark.",
);
