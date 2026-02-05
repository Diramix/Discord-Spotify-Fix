const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

(async () => {
    const isHeadful = process.env.HEADFUL === "true";

    console.log("[BOOT] Browser starting");
    console.log("[MODE]", isHeadful ? "HEADFUL (visible)" : "HEADLESS");

    const browser = await puppeteer.launch({
        headless: isHeadful ? false : "new",
        defaultViewport: null,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    /**
     * LOGS FROM PAGE
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
     * LOAD PAGE — WAIT FOR FULL LOAD
     */
    const targetUrl = "https://discord.com/login";
    console.log("[GOTO] Loading:", targetUrl);

    await page.goto(targetUrl, {
        waitUntil: "networkidle0", // ⬅️ ключевой момент
        timeout: 60000,
    });

    console.log("[PAGE] Fully loaded:", page.url());

    /**
     * INJECT AFTER FULL LOAD
     */
    console.log("[INJECT] Injecting script.js AFTER full load");
    await page.evaluate(injectCode);

    console.log("[READY] Page loaded and injected");
    console.log("[READY] Ctrl+C to exit");

    /**
     * GRACEFUL SHUTDOWN
     */
    const shutdown = async () => {
        console.log("\n[SHUTDOWN] Closing browser");
        await browser.close();
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    /**
     * KEEP PROCESS ALIVE
     */
    await new Promise(() => {});
})();
