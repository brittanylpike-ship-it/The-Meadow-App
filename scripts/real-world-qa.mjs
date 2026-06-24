import { createServer } from "node:http";
import { createRequire } from "node:module";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { createEmptyMeadowState, saveEvergreenMemory } from "../features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";
import { saveStormGardenRitualMemory } from "../features/memory/storm-garden-memory.mjs";
import { saveCrossroadsRitualMemory } from "../features/memory/crossroads-memory.mjs";
import { saveMoorsRitualMemory } from "../features/memory/moors-memory.mjs";
import { saveFirstBloomRitualMemory } from "../features/memory/first-bloom-memory.mjs";

const require = createRequire(import.meta.url);
const playwrightModule = process.env.PLAYWRIGHT_MODULE_PATH || "playwright";
const { chromium } = require(playwrightModule);

const cwd = process.cwd();
const distDir = path.resolve(cwd, "dist");

const routes = [
  ["/evergreen-tree", "Evergreen Tree"],
  ["/frosted-window", "Frosted Window"],
  ["/frozen-pond", "Frozen Pond"],
  ["/quiet-hour", "Quiet Hour"],
  ["/footprints", "Footprints"],
  ["/lightning-tree", "Lightning Tree"],
  ["/thorn-patch", "Thorn Patch"],
  ["/floodwaters", "Floodwaters"],
  ["/scorched-earth", "Scorched Earth"],
  ["/shattered-mirror", "Shattered Mirror"],
  ["/worn-path", "Worn Path"],
  ["/offering", "Offering"],
  ["/candle", "Candle"],
  ["/searching-for-signs", "Searching For Signs"],
  ["/waiting-gate", "Waiting Gate"],
  ["/canopy-cloak", "Canopy Cloak"],
  ["/mire", "Mire"],
  ["/bramble", "Bramble"],
  ["/fog", "Fog"],
  ["/vanishing-path", "Vanishing Path"],
  ["/grounding", "Grounding"],
  ["/opening", "Opening"],
  ["/anchoring", "Anchoring"],
  ["/emergence", "Emergence"],
  ["/integration", "Integration"],
];

const tabRoutes = [
  ["/", "The Meadow"],
  ["/journal", "Journal"],
  ["/chapters", "Chapters"],
  ["/memory-garden", "Memory Garden"],
  ["/hearth", "Hearth"],
  ["/profile", "Profile"],
];

const deepScenarios = [
  {
    chapter: "Frozen Ground",
    route: "/evergreen-tree",
    input: /Leave something at the Evergreen Tree/i,
    save: /Let the tree keep this/i,
    memory: "QA Frozen Ground: evergreen memory remained",
    seed: seedEmpty,
  },
  {
    chapter: "Storm Garden",
    route: "/shattered-mirror",
    input: /Leave something in Shattered Mirror/i,
    save: /Let the mirror hold this reflection/i,
    memory: "QA Storm Garden: shattered mirror memory remained",
    seed: seedStormOpen,
  },
  {
    chapter: "Crossroads",
    route: "/candle",
    input: /Leave something in Candle/i,
    save: /Let the candle hold this whisper/i,
    memory: "QA Crossroads: candle memory remained",
    seed: seedCrossroadsOpen,
  },
  {
    chapter: "The Moors",
    route: "/fog",
    input: /Leave something in Fog/i,
    save: /Let the fog hold this/i,
    memory: "QA The Moors: fog memory remained",
    seed: seedMoorsOpen,
  },
  {
    chapter: "First Bloom",
    route: "/integration",
    input: /Leave something in Integration/i,
    save: /Let the meadow hold this together/i,
    memory: "QA First Bloom: integration memory remained",
    seed: seedFirstBloomOpen,
  },
];

if (!existsSync(path.join(distDir, "index.html"))) {
  throw new Error("Missing dist/index.html. Run the Expo web export before real-world QA.");
}

const server = createStaticServer(distDir);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}`;

const browser = await launchBrowser();
const browserErrors = [];

try {
  const authResult = await inspectAuthEntry(browser);

  const deepResults = [];
  for (const [index, scenario] of deepScenarios.entries()) {
    const userId = `qa-${slug(scenario.chapter)}-${Date.now()}-${index}`;
    const state = scenario.seed(userId);
    const page = await newSeededPage(browser, userId, state);
    page.on("pageerror", (error) => browserErrors.push(`${scenario.chapter}: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && !isExpectedLocalNetworkBlock(message.text())) browserErrors.push(`${scenario.chapter}: ${message.text()}`);
    });

    await page.goto(`${baseUrl}${scenario.route}`, { waitUntil: "networkidle" });
    await page.getByLabel(scenario.input).fill(scenario.memory);
    await page.getByRole("button", { name: scenario.save }).click();
    await waitForBodyText(page, scenario.memory);
    await page.reload({ waitUntil: "networkidle" });
    await waitForBodyText(page, scenario.memory);

    const stored = await page.evaluate((id) => JSON.parse(localStorage.getItem(`the-meadow:world:${id}`)), userId);
    deepResults.push({
      chapter: scenario.chapter,
      route: scenario.route,
      persisted: stored.memoryObjects.some((memory) => memory.customText === scenario.memory),
      memoryCount: stored.worldState.totalMemories,
      lastRitual: stored.worldState.lastVisitedRitualId,
    });
    await page.close();
  }

  const smokeUserId = `qa-full-route-smoke-${Date.now()}`;
  const smokeState = seedCompleteWorld(smokeUserId);
  const smokePage = await newSeededPage(browser, smokeUserId, smokeState);
  smokePage.on("pageerror", (error) => browserErrors.push(`route smoke: ${error.message}`));
  smokePage.on("console", (message) => {
    if (message.type() === "error" && !isExpectedLocalNetworkBlock(message.text())) browserErrors.push(`route smoke: ${message.text()}`);
  });

  const routeResults = [];
  for (const [route, title] of routes) {
    await smokePage.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await waitForBodyText(smokePage, title);
    const result = await smokePage.evaluate(() => {
      const text = document.body.innerText;
      const images = [
        ...[...document.images].map((image) => image.currentSrc || image.src),
        ...[...document.querySelectorAll("*")]
          .map((element) => getComputedStyle(element).backgroundImage)
          .filter((value) => value && value !== "none")
          .map((value) => value.replace(/^url\(["']?/, "").replace(/["']?\)$/, "")),
      ];
      const tabLabels = ["HOME", "JOURNAL", "CHAPTERS", "MEMORY GARDEN", "HEARTH", "PROFILE"];
      return {
        imageCount: images.length,
        imageSources: images,
        hasTabBar: tabLabels.every((label) => text.includes(label)),
        placeholderText: /placeholder|react native/i.test(text),
      };
    });
    routeResults.push({
      route,
      title,
      imageCount: result.imageCount,
      hasRenderedImage: result.imageSources.some((source) => /\.(png|webp)(\?|$)/i.test(source)),
      hasTabBar: result.hasTabBar,
      placeholderText: result.placeholderText,
    });
  }

  const tabResults = [];
  for (const [route, title] of tabRoutes) {
    await smokePage.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await waitForBodyText(smokePage, title);
    const result = await smokePage.evaluate(() => {
      const text = document.body.innerText;
      const images = [
        ...[...document.images].map((image) => image.currentSrc || image.src),
        ...[...document.querySelectorAll("*")]
          .map((element) => getComputedStyle(element).backgroundImage)
          .filter((value) => value && value !== "none")
          .map((value) => value.replace(/^url\(["']?/, "").replace(/["']?\)$/, "")),
      ];
      const tabLabels = ["HOME", "JOURNAL", "CHAPTERS", "MEMORY GARDEN", "HEARTH", "PROFILE"];
      return {
        imageCount: images.length,
        imageSources: images,
        chapterArtworkMounted: Boolean(document.querySelector('[aria-label*="approved Meadow Chapters"], [aria-label*="dedicated mobile chapter map"]')),
        hasTabBar: tabLabels.every((label) => text.includes(label)),
        placeholderText: /placeholder|react native|default expo/i.test(text),
        horizontalOverflow: document.body.scrollWidth > window.innerWidth,
      };
    });
    tabResults.push({
      route,
      title,
      imageCount: result.imageCount,
      hasRenderedImage: result.imageSources.some((source) => /\.(png|webp)(\?|$)/i.test(source)),
      hasMobileChapterMap: route === "/chapters" ? result.chapterArtworkMounted || result.imageSources.some((source) => /chapters-(mobile-map|approved-home)/i.test(source)) : undefined,
      hasTabBar: result.hasTabBar,
      placeholderText: result.placeholderText,
      horizontalOverflow: result.horizontalOverflow,
    });
  }

  const output = {
    baseUrl,
    authResult,
    deepResults,
    tabResults,
    routeResults,
    browserErrors,
    summary: {
      authPassed: authResult.passed,
      deepPassed: deepResults.filter((result) => result.persisted).length,
      deepTotal: deepResults.length,
      tabsWithRenderedImages: tabResults.filter((result) => result.hasRenderedImage && result.imageCount > 0).length,
      tabTotal: tabResults.length,
      tabsMissingTabBar: tabResults.filter((result) => !result.hasTabBar).map((result) => result.route),
      tabsWithPlaceholderText: tabResults.filter((result) => result.placeholderText).map((result) => result.route),
      tabsWithHorizontalOverflow: tabResults.filter((result) => result.horizontalOverflow).map((result) => result.route),
      routesWithRenderedImages: routeResults.filter((result) => result.hasRenderedImage && result.imageCount > 0).length,
      routeTotal: routeResults.length,
      routesMissingTabBar: routeResults.filter((result) => !result.hasTabBar).map((result) => result.route),
      routesWithPlaceholderText: routeResults.filter((result) => result.placeholderText).map((result) => result.route),
      browserErrorCount: browserErrors.length,
    },
  };

  console.log(JSON.stringify(output, null, 2));
  const failures = findQaFailures(output);
  if (failures.length > 0) {
    throw new Error(`Real-world QA failed: ${failures.join("; ")}`);
  }
  await smokePage.close();
} finally {
  await browser.close();
  server.close();
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "msedge", headless: true });
  } catch {
    return chromium.launch({ headless: true });
  }
}

async function newSeededPage(browserInstance, userId, state) {
  const context = await browserInstance.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ id, world }) => {
      localStorage.clear();
      localStorage.setItem("the_meadow_session", JSON.stringify({ id, email: `${id}@qa.local` }));
      localStorage.setItem(`the-meadow:world:${id}`, JSON.stringify(world));
    },
    { id: userId, world: state },
  );
  return page;
}

async function inspectAuthEntry(browserInstance) {
  const context = await browserInstance.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => browserErrors.push(`auth: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !isExpectedLocalNetworkBlock(message.text())) browserErrors.push(`auth: ${message.text()}`);
  });

  await page.goto(`${baseUrl}/auth`, { waitUntil: "networkidle" });
  await waitForBodyText(page, "The Meadow");

  const result = await page.evaluate(() => {
    const text = document.body.innerText;
    const images = [
      ...[...document.images].map((image) => image.currentSrc || image.src),
      ...[...document.querySelectorAll("*")]
        .map((element) => getComputedStyle(element).backgroundImage)
        .filter((value) => value && value !== "none")
        .map((value) => value.replace(/^url\(["']?/, "").replace(/["']?\)$/, "")),
    ];
    const buttons = [...document.querySelectorAll('[role="button"],button')]
      .map((button) => button.textContent?.trim())
      .filter(Boolean);
    const lockedCopy = [
      "The Meadow",
      "A private place that remembers what you leave with care.",
      "Begin here",
      "Enter The Meadow",
      "I already have a place here",
    ];

    return {
      lockedCopyPresent: lockedCopy.every((copy) => text.includes(copy)),
      removedCopyAbsent: !text.includes("A living storybook journey."),
      tooltipCopyAbsent: !text.includes("The Meadow auth title page"),
      titleAttributeCount: document.querySelectorAll("[title]").length,
      inputCount: document.querySelectorAll("input").length,
      hasAuthArtwork: images.some((source) => /auth-entry.*\.png/i.test(source)),
      horizontalOverflow: document.body.scrollWidth > window.innerWidth,
      buttons,
    };
  });

  await page.close();
  await context.close();

  return {
    ...result,
    passed:
      result.lockedCopyPresent &&
      result.removedCopyAbsent &&
      result.tooltipCopyAbsent &&
      result.titleAttributeCount === 0 &&
      result.inputCount === 2 &&
      result.hasAuthArtwork &&
      !result.horizontalOverflow,
  };
}

async function waitForBodyText(page, text) {
  await page.waitForFunction((expected) => document.body.innerText.includes(expected), text, { timeout: 10000 });
}

function seedEmpty(userId) {
  return createEmptyMeadowState(userId, timestamp(0));
}

function seedStormOpen(userId) {
  return completeFrozen(seedEmpty(userId), 10);
}

function seedCrossroadsOpen(userId) {
  return completeStorm(seedStormOpen(userId), 20);
}

function seedMoorsOpen(userId) {
  return completeCrossroads(seedCrossroadsOpen(userId), 30);
}

function seedFirstBloomOpen(userId) {
  return completeMoors(seedMoorsOpen(userId), 40);
}

function seedCompleteWorld(userId) {
  return completeFirstBloom(seedFirstBloomOpen(userId), 50);
}

function completeFrozen(state, offset) {
  let next = saveEvergreenMemory(state, {
    thought: "I still wait.",
    context: "At night",
    offering: "Seed Evergreen memory",
    createdAt: timestamp(offset),
  });
  for (const ritualId of ["frosted_window", "frozen_pond", "quiet_hour", "footprints"]) {
    next = saveFrozenGroundRitualMemory(next, ritualId, {
      response: "QA seed response",
      detail: `Seed ${ritualId}`,
      createdAt: timestamp(offset += 1),
    });
  }
  return next;
}

function completeStorm(state, offset) {
  let next = state;
  for (const ritualId of ["lightning_tree", "thorn_patch", "floodwaters", "scorched_earth", "shattered_mirror"]) {
    next = saveStormGardenRitualMemory(next, ritualId, {
      response: "QA seed response",
      detail: `Seed ${ritualId}`,
      createdAt: timestamp(offset += 1),
    });
  }
  return next;
}

function completeCrossroads(state, offset) {
  let next = state;
  for (const ritualId of ["worn_path", "offering", "candle", "searching_for_signs", "waiting_gate"]) {
    next = saveCrossroadsRitualMemory(next, ritualId, {
      response: "QA seed response",
      detail: `Seed ${ritualId}`,
      createdAt: timestamp(offset += 1),
    });
  }
  return next;
}

function completeMoors(state, offset) {
  let next = state;
  for (const ritualId of ["canopy_cloak", "mire", "bramble", "fog", "vanishing_path"]) {
    next = saveMoorsRitualMemory(next, ritualId, {
      response: "QA seed response",
      detail: `Seed ${ritualId}`,
      createdAt: timestamp(offset += 1),
    });
  }
  return next;
}

function completeFirstBloom(state, offset) {
  let next = state;
  for (const ritualId of ["grounding", "opening", "anchoring", "emergence", "integration"]) {
    next = saveFirstBloomRitualMemory(next, ritualId, {
      response: "QA seed response",
      detail: `Seed ${ritualId}`,
      createdAt: timestamp(offset += 1),
    });
  }
  return next;
}

function timestamp(offsetSeconds) {
  return new Date(Date.UTC(2026, 5, 12, 18, 0, offsetSeconds)).toISOString();
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function findQaFailures(output) {
  const failures = [];

  if (!output.authResult.passed) {
    failures.push("auth entry screen did not pass official-art smoke checks");
  }

  const missingPersistence = output.deepResults.filter((result) => !result.persisted).map((result) => result.chapter);
  if (missingPersistence.length > 0) {
    failures.push(`memory did not persist for ${missingPersistence.join(", ")}`);
  }

  const missingImages = output.routeResults.filter((result) => !result.hasRenderedImage).map((result) => result.route);
  if (missingImages.length > 0) {
    failures.push(`routes missing rendered images: ${missingImages.join(", ")}`);
  }

  if (output.summary.routesMissingTabBar.length > 0) {
    failures.push(`routes missing six-tab shell: ${output.summary.routesMissingTabBar.join(", ")}`);
  }

  if (output.summary.tabsMissingTabBar.length > 0) {
    failures.push(`tabs missing six-tab shell: ${output.summary.tabsMissingTabBar.join(", ")}`);
  }

  if (output.summary.routesWithPlaceholderText.length > 0) {
    failures.push(`routes showing placeholder text: ${output.summary.routesWithPlaceholderText.join(", ")}`);
  }

  if (output.summary.tabsWithPlaceholderText.length > 0) {
    failures.push(`tabs showing placeholder text: ${output.summary.tabsWithPlaceholderText.join(", ")}`);
  }

  if (output.summary.tabsWithHorizontalOverflow.length > 0) {
    failures.push(`tabs with horizontal overflow: ${output.summary.tabsWithHorizontalOverflow.join(", ")}`);
  }

  const tabsMissingImages = output.tabResults.filter((result) => !result.hasRenderedImage).map((result) => result.route);
  if (tabsMissingImages.length > 0) {
    failures.push(`tabs missing rendered images: ${tabsMissingImages.join(", ")}`);
  }

  const chaptersTab = output.tabResults.find((result) => result.route === "/chapters");
  if (!chaptersTab?.hasRenderedImage) {
    failures.push("Chapters tab is not rendering approved chapter artwork");
  }

  if (output.browserErrors.length > 0) {
    failures.push(`browser errors: ${output.browserErrors.length}`);
  }

  return failures;
}

function isExpectedLocalNetworkBlock(message) {
  return /Failed to load resource: net::ERR_NETWORK_ACCESS_DENIED/i.test(message);
}

function createStaticServer(rootDir) {
  return createServer((request, response) => {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    const requested = decodeURIComponent(url.pathname);
    let filePath = path.join(rootDir, requested === "/" ? "index.html" : requested);

    if (!filePath.startsWith(rootDir)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = path.join(rootDir, "index.html");
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentTypes = {
      ".css": "text/css",
      ".html": "text/html",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".webp": "image/webp",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
    };

    response.writeHead(200, { "Content-Type": contentTypes[extension] || "application/octet-stream" });
    response.end(readFileSync(filePath));
  });
}
