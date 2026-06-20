import path from "node:path";
import { mkdir } from "node:fs/promises";

import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "assets", "illustrations", "onboarding");
await mkdir(outputDir, { recursive: true });

const crops = [
  {
    name: "home-entry.png",
    source: path.join(root, "assets", "illustrations", "home-hero.png"),
    yRatio: 0,
  },
  {
    name: "chapters-entry.png",
    source: path.join(root, "assets", "illustrations", "chapters-panorama.png"),
    yRatio: 0.08,
  },
  {
    name: "journal-entry.png",
    source: path.join(root, "assets", "illustrations", "journal-hero.png"),
    yRatio: 0,
  },
  {
    name: "memory-garden-entry.png",
    source: path.join(root, "assets", "illustrations", "memory-garden-hero.png"),
    yRatio: 0,
  },
  {
    name: "profile-entry.png",
    source: path.join(root, "assets", "illustrations", "profile-hero.png"),
    yRatio: 0.09,
  },
];

for (const crop of crops) {
  const image = sharp(crop.source);
  const metadata = await image.metadata();
  const width = metadata.width ?? 900;
  const height = metadata.height ?? 900;
  const cropHeight = Math.min(height, Math.round(width / 1.72));
  const top = Math.max(0, Math.min(height - cropHeight, Math.round(height * crop.yRatio)));

  await image
    .extract({ left: 0, top, width, height: cropHeight })
    .resize({ width: 1200, height: 698, fit: "cover", position: "top" })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, crop.name));
}
