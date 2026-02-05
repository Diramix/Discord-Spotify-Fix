const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

(async () => {
    const isHeadful = process.env.HEADFUL === "true";

    const browser = await puppeteer.launch({
        headless: isHeadful ? false : "new",
        defaultViewport: null,
        args: ["--no-sandbox"],
    });

    const page = await browser.newPage();

    page.on("console", (msg) => console.log("[PAGE]", msg.text()));
    page.on("framenavigated", (frame) => {
        if (frame === page.mainFrame()) {
            console.log("[NAVIGATION]", frame.url());
        }
    });

    /**
     * 🔧 КОНФИГ: ПОЛНЫЙ НАЧАЛЬНЫЙ URL → ПУТЬ К ФАЙЛУ
     */
    const ROUTES = [
        {
            urlStartsWith: "https://discord.com/login",
            scriptPath: "./scripts/login.js",
        },
        {
            urlStartsWith: "https://discord.com/channels",
            scriptPath: "./scripts/online.js",
        },
    ];

    /**
     * Кеш загруженных файлов + защита от повторного инжекта
     */
    const scriptCache = new Map();
    const injectedForUrl = new Set();

    const injectByRoute = async () => {
        const url = page.url();
        console.log("[CHECK] URL:", url);

        // не инжектим повторно на тот же URL
        if (injectedForUrl.has(url)) {
            console.log("[SKIP] Already injected for this URL");
            return;
        }

        const route = ROUTES.find((r) => url.startsWith(r.urlStartsWith));
        if (!route) {
            console.log("[SKIP] No matching inject route");
            return;
        }

        // читаем файл один раз
        if (!scriptCache.has(route.scriptPath)) {
            const fullPath = path.resolve(__dirname, route.scriptPath);
            scriptCache.set(
                route.scriptPath,
                fs.readFileSync(fullPath, "utf8"),
            );
            console.log("[LOAD] Script loaded:", route.scriptPath);
        }

        console.log("[INJECT] Using script:", route.scriptPath);
        await page.evaluate(scriptCache.get(route.scriptPath));

        injectedForUrl.add(url);
    };

    /**
     * LOAD PAGE — ЖДЁМ ПОЛНОЙ ЗАГРУЗКИ
     */
    const startUrl = "https://discord.com/login";
    console.log("[GOTO]", startUrl);

    await page.goto(startUrl, { waitUntil: "networkidle0" });
    await injectByRoute();

    /**
     * SPA / ПЕРЕХОДЫ
     */
    page.on("framenavigated", async (frame) => {
        if (frame === page.mainFrame()) {
            await page.waitForNetworkIdle({ idleTime: 500 });
            await injectByRoute();
        }
    });

    console.log("[READY] Running. Ctrl+C to exit");

    process.on("SIGINT", async () => {
        console.log("\n[SHUTDOWN]");
        await browser.close();
        process.exit(0);
    });

    await new Promise(() => {});
})();
