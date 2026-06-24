const path = require("node:path");
const fs = require("node:fs");

const localCache = path.join(process.cwd(), ".cache");
const localAppData = path.join(localCache, "localappdata");
const localHome = path.join(localCache, "home");
fs.mkdirSync(localCache, { recursive: true });
fs.mkdirSync(path.join(localAppData, "fontconfig", "cache"), { recursive: true });
fs.mkdirSync(path.join(localHome, ".cache", "fontconfig"), { recursive: true });
process.env.XDG_CACHE_HOME = localCache;
process.env.LOCALAPPDATA = localAppData;
process.env.HOME = localHome;
process.env.USERPROFILE = localHome;

const sharp = require("sharp");

const IVORY = "#E2DDD6";
const FOREST = "#3D5A3E";
const BROWN = "#3B2A1A";

function svgFrame(width, height, body) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${body}
    </svg>
  `);
}

function iconMarkSvg({ background }) {
  return svgFrame(
    1024,
    1024,
    `
      ${background ? `<rect width="1024" height="1024" fill="${IVORY}"/>` : ""}
      <circle cx="512" cy="512" r="300" fill="${BROWN}"/>
      <text
        x="512"
        y="516"
        fill="${IVORY}"
        font-family="Cormorant Garamond, Georgia, Times New Roman, serif"
        font-size="320"
        font-weight="400"
        text-anchor="middle"
        dominant-baseline="central"
      >M</text>
    `
  );
}

function splashSvg() {
  return svgFrame(
    2048,
    2048,
    `
      <rect width="2048" height="2048" fill="${IVORY}"/>
      <rect x="0" y="943" width="2048" height="3" fill="${FOREST}"/>
      <text
        x="1024"
        y="1024"
        fill="${BROWN}"
        font-family="Cormorant Garamond, Georgia, Times New Roman, serif"
        font-size="180"
        font-weight="400"
        text-anchor="middle"
        dominant-baseline="central"
      >The Meadow</text>
      <rect x="0" y="1103" width="2048" height="3" fill="${FOREST}"/>
    `
  );
}

async function renderAsset(file, input) {
  const target = path.join(process.cwd(), "assets", file);
  await sharp(input).png().toFile(target);
  console.log(`Created assets/${file}`);
}

async function main() {
  await sharp.cache(false);
  await renderAsset("icon.png", iconMarkSvg({ background: true }));
  await renderAsset("icon-foreground.png", iconMarkSvg({ background: false }));
  await renderAsset(
    "adaptive-icon.png",
    svgFrame(1024, 1024, `<rect width="1024" height="1024" fill="${IVORY}"/>`)
  );
  await renderAsset("splash.png", splashSvg());
  console.log("Launch asset generation method: sharp SVG rasterization.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
