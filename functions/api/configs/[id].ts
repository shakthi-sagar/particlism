export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
    const id = typeof params.id === "string" ? params.id : "";
    if (!/^[A-Za-z0-9_-]{12}$/.test(id)) {
        return Response.json({ error: "Invalid config ID" }, { status: 400 });
    }

    try {
        const config = await env.CONFIGS.get(`config:${id}`);
        if (!config) {
            return Response.json({ error: "Config not found" }, { status: 404 });
        }

        return new Response(config, {
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "public, max-age=300"
            }
        });
    } catch (error) {
        console.error(JSON.stringify({
            message: "config lookup failed",
            error: error instanceof Error ? error.message : String(error),
            id
        }));
        return Response.json({ error: "Unable to load config" }, { status: 500 });
    }
};
