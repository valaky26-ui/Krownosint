export async function onRequestGet(context) {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userKey = request.headers.get("X-Krown-Key");

    // Action: Verify Login
    if (action === "verify") {
        const check = await env.KROWN_KEYS.get(userKey);
        return check ? new Response("OK") : new Response("Fail", { status: 401 });
    }

    // Action: Generate New Key
    if (action === "gen") {
        const newKey = "KROWN-" + Math.random().toString(36).toUpperCase().substring(2, 10);
        await env.KROWN_KEYS.put(newKey, "true");
        return new Response(JSON.stringify({ key: newKey }));
    }

    // Action: Fetch Logs
    if (action === "logs") {
        const list = await env.KROWN_LOGS.list();
        const logs = await Promise.all(list.keys.map(k => env.KROWN_LOGS.get(k.name, {type: "json"})));
        return new Response(JSON.stringify(logs));
    }

    return new Response("Not Found", { status: 404 });
}
