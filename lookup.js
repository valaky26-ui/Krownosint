export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const userKey = request.headers.get("X-Krown-Key");

    // Check if key is valid in KV
    const valid = await env.KROWN_KEYS.get(userKey);
    if (!valid) return new Response("Forbidden", { status: 403 });

    // Log the search
    const logId = `log_${Date.now()}`;
    await env.KROWN_LOGS.put(logId, JSON.stringify({
        ip: request.headers.get("cf-connecting-ip"),
        query: body.query,
        time: new Date().toISOString()
    }));

    // HIDDEN API CALL
    const SECRET_API = "g4MGFaJ8njFphMSCvp1R9";
    const apiUrl = `https://api.external-service.com/data?key=${SECRET_API}&q=${body.query}`;
    
    const apiRes = await fetch(apiUrl);
    const data = await apiRes.json();

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
    });
}
