import { parseConfig } from "../../../src/lib/particles";

const MAX_BODY_BYTES = 20_000;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    if (!request.headers.get("content-type")?.includes("application/json")) {
        return Response.json({ error: "Expected JSON" }, { status: 415 });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
        return Response.json({ error: "Config too large" }, { status: 413 });
    }

    try {
        const body = await request.text();
        if (body.length > MAX_BODY_BYTES) {
            return Response.json({ error: "Config too large" }, { status: 413 });
        }

        const config = parseConfig(JSON.parse(body));
        if (!config) {
            return Response.json({ error: "Invalid config" }, { status: 400 });
        }

        const canonical = JSON.stringify(config);
        const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical)));
        const id = btoa(String.fromCharCode(...digest.slice(0, 9)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        await env.CONFIGS.put(`config:${id}`, canonical);
        return Response.json({ id }, {
            status: 201,
            headers: { "Cache-Control": "no-store" }
        });
    } catch (error) {
        console.error(JSON.stringify({
            message: "config creation failed",
            error: error instanceof Error ? error.message : String(error)
        }));
        return Response.json({ error: "Unable to save config" }, { status: 500 });
    }
};
