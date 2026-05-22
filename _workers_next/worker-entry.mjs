import nextWorker from "./.open-next/worker.js";

const CLEANUP_ENDPOINT_URL = "https://cron.internal/api/internal/cron/cleanup";
const CRON_TOKEN_HEADER = "x-cron-cleanup-token";

function resolveCleanupToken(env) {
    const cronToken = typeof env?.CRON_CLEANUP_TOKEN === "string" ? env.CRON_CLEANUP_TOKEN.trim() : "";
    if (cronToken) return cronToken;

    const oauthSecret = typeof env?.OAUTH_CLIENT_SECRET === "string" ? env.OAUTH_CLIENT_SECRET.trim() : "";
    return oauthSecret;
}

async function runScheduledCleanup(env, ctx) {
    const token = resolveCleanupToken(env);
    if (!token) {
        console.warn("[cron-cleanup] skipped: neither CRON_CLEANUP_TOKEN nor OAUTH_CLIENT_SECRET is configured");
        return;
    }

    const request = new Request(CLEANUP_ENDPOINT_URL, {
        method: "POST",
        headers: {
            [CRON_TOKEN_HEADER]: token,
        },
    });

    const response = await nextWorker.fetch(request, env, ctx);
    if (!response.ok) {
        const body = await response.text();
        console.error(`[cron-cleanup] failed: ${response.status} ${body.slice(0, 500)}`);
        return;
    }

    const payload = await response.text();
    console.log(`[cron-cleanup] ok: ${payload}`);
}

export default {
    async fetch(request, env, ctx) {
        return nextWorker.fetch(request, env, ctx);
    },
    async scheduled(event, env, ctx) {
        ctx.waitUntil(runScheduledCleanup(env, ctx));
    },
};

export * from "./.open-next/worker.js";
