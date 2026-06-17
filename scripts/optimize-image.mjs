// Usage: node scripts/optimize-image.mjs <src> <dest> <maxWidth>
// Resizes (never upscales) to maxWidth and writes optimized JPEG.
import sharp from 'sharp';

const [, , src, dest, maxWidth] = process.argv;
if (!src || !dest || !maxWidth) {
  console.error('Usage: node scripts/optimize-image.mjs <src> <dest> <maxWidth>');
  process.exit(1);
}
await sharp(src)
  .rotate() // honor EXIF orientation
  .resize({ width: Number(maxWidth), withoutEnlargement: true })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(dest);
console.log(`✓ ${dest}`);
