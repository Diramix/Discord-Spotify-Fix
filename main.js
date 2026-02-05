const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

(async () => {
    const isHeadful = process.env.HEADFUL === "true";

    console.log("[BOOT] Browser starting");
    console.log("[MODE]", isHeadful ? "HEADFUL" : "HEADLESS");
    console.log("[PERF] Low CPU mode enabled");

    const browser = await puppeteer.launch({
        headless: isHeadful ? false : "new",
        defaultViewport: null,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",

            // 🔥 CPU / performance
            "--disable-dev-shm-usage",
            "--disable-background-networking",
            "--disable-background-timer-throttling",
            "--disable-renderer-backgrounding",
            "--disable-backgrounding-occluded-windows",
            "--disable-breakpad",
            "--disable-features=Translate,BackForwardCache",
            "--mute-audio",
        ],
    });

    const page = await browser.newPage();

    /**
     * CACHE = меньше запросов
     */
    await page.setCacheEnabled(true);

    /**
     * BLOCK HEAVY RESOURCES
     */
    await page.setRequestInterception(true);
    page.on("request", (req) => {
        const type = req.resourceType();
        if (type === "image" || type === "media" || type === "font") {
            return req.abort();
        }
        req.continue();
    });

    /**
     * PAGE LOGS (минимальные)
     */
    page.on("console", (msg) => {
        console.log("[PAGE]", msg.text());
    });

    page.on("framenavigated", (frame) => {
        if (frame === page.mainFrame()) {
            console.log("[NAVIGATION]", frame.url());
        }
    });

    /**
     * READ INJECT FILE
     */
    const injectPath = path.resolve(__dirname, "script.js");
    const injectCode = fs.readFileSync(injectPath, "utf8");
    console.log("[INJECT] script.js loaded");

    /**
     * LOAD PAGE — FULLY
     */
    const targetUrl = "https://discord.com/login";
    console.log("[GOTO] Loading:", targetUrl);

    await page.goto(targetUrl, {
        waitUntil: "networkidle0",
        timeout: 60000,
    });

    console.log("[PAGE] Fully loaded");

    /**
     * DISABLE ANIMATIONS (BIG CPU WIN)
     */
    await page.addStyleTag({
        content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    `,
    });

    /**
     * INJECT AFTER FULL LOAD
     */
    console.log("[INJECT] Injecting script.js");
    await page.evaluate(injectCode);

    console.log("[READY] Idle & running (low CPU)");
    console.log("[READY] Ctrl+C to exit");

    /**
     * CLEAN EXIT
     */
    const shutdown = async () => {
        console.log("\n[SHUTDOWN] Closing browser");
        await browser.close();
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    /**
     * KEEP PROCESS ALIVE (ZERO CPU)
     */
    await new Promise(() => {});
})();
