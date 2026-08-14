/**
 * Собирает public/favicon.ico из public/favicon.svg.
 *
 * sharp умеет растрировать SVG, но кодировщика ICO у него нет: вызов
 * .toFile("...ico") молча пишет обычный PNG под расширением .ico. Поэтому
 * PNG-кадры здесь упаковываются в настоящий контейнер ICO вручную —
 * формат допускает PNG внутри записи, начиная с Windows Vista.
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const ICONDIR_SIZE = 6;
const ICONDIRENTRY_SIZE = 16;

const ornate = readFileSync("public/favicon.svg");

/**
 * Оптический вариант для 16 пикселей: двойная рамка и ромбы на этом размере
 * сливаются в кашу, поэтому здесь одна толстая рамка и крупная римская I.
 */
const compact = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
     <rect width="32" height="32" rx="4" fill="#1A0A0A"/>
     <rect x="6.4" y="2.6" width="19.2" height="26.8" rx="2" fill="#221212"
           stroke="#C8973A" stroke-width="2.2"/>
     <g fill="#E8C87A">
       <rect x="14.7" y="10.4" width="2.6" height="11.2"/>
       <rect x="11.2" y="9" width="9.6" height="2.4" rx="0.3"/>
       <rect x="11.2" y="20.6" width="9.6" height="2.4" rx="0.3"/>
     </g>
   </svg>`,
  "utf8",
);

const FRAMES = [
  { size: 16, source: compact },
  { size: 32, source: ornate },
];

const frames = await Promise.all(
  FRAMES.map(async ({ size, source }) => ({
    size,
    png: await sharp(source, { density: 384 }).resize(size, size).png().toBuffer(),
  })),
);

const header = Buffer.alloc(ICONDIR_SIZE);
header.writeUInt16LE(0, 0); // зарезервировано
header.writeUInt16LE(1, 2); // тип: 1 — значок
header.writeUInt16LE(frames.length, 4);

let offset = ICONDIR_SIZE + ICONDIRENTRY_SIZE * frames.length;

const entries = frames.map(({ size, png }) => {
  const entry = Buffer.alloc(ICONDIRENTRY_SIZE);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // ширина
  entry.writeUInt8(size === 256 ? 0 : size, 1); // высота
  entry.writeUInt8(0, 2); // палитра не используется
  entry.writeUInt8(0, 3); // зарезервировано
  entry.writeUInt16LE(1, 4); // цветовых плоскостей
  entry.writeUInt16LE(32, 6); // бит на пиксель
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});

const ico = Buffer.concat([header, ...entries, ...frames.map((f) => f.png)]);
writeFileSync("public/favicon.ico", ico);

console.log(
  `public/favicon.ico: ${ico.length} байт, кадры ${frames
    .map((f) => `${f.size}x${f.size}`)
    .join(" + ")}`,
);
