// Готовит фото работ Анны для сайта: обрезает по центру в квадрат для сетки,
// сжимает в формат webp и кладёт в img/ под именами, которые ждёт index.html.
//
// Запуск (нужен Node 18+ и пакет sharp):
//   npm install sharp
//   node tools/podgotovit-foto.mjs путь/к/папке/с/фото
//
// Фото берутся в алфавитном порядке имён: 01.jpg, 02.jpg, ... — так проще задать порядок.
// Для каждого фото получается два файла:
//   img/rabota-NN-malaya.webp — квадрат 600×600 для сетки (~40–70 КБ)
//   img/rabota-NN.webp        — до 1600 px по длинной стороне для просмотра (~150–250 КБ)
// После запуска замените в index.html «.svg» на «.webp» в строках галереи.

import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const src = process.argv[2];
if (!src) {
  console.error('Укажите папку с фото: node tools/podgotovit-foto.mjs папка');
  process.exit(1);
}

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'img');
await mkdir(out, { recursive: true });

const files = (await readdir(src))
  .filter((f) => /\.(jpe?g|png|webp|heic|heif)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, 'ru', { numeric: true }));

if (files.length < 9 || files.length > 12) {
  console.warn(`Внимание: фото ${files.length}, по заданию нужно от 9 до 12.`);
}

for (const [i, f] of files.entries()) {
  const nn = String(i + 1).padStart(2, '0');
  const input = sharp(path.join(src, f)).rotate(); // rotate() — учитывает поворот с телефона

  await input.clone()
    .resize(600, 600, { fit: 'cover', position: 'attention' })
    .webp({ quality: 72 })
    .toFile(path.join(out, `rabota-${nn}-malaya.webp`));

  await input.clone()
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(path.join(out, `rabota-${nn}.webp`));

  console.log(`${f} → rabota-${nn}`);
}
