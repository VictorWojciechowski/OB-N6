export const prerender = false;

export async function POST({ request }: { request: Request }) {
  // 1) Lire le body en texte (plus robuste que request.json())
  const contentType = request.headers.get("content-type") || "";
  const raw = await request.text();

  if (!raw) {
    return new Response(
      JSON.stringify({
        error: "Empty body received by /api/chat",
        hint:
          "Check that your fetch() sends JSON and that e.preventDefault() is called on form submit.",
        contentType,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: "Invalid JSON received by /api/chat",
        raw,
        contentType,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { message, sessionId } = payload ?? {};
  if (typeof message !== "string" || !message.trim()) {
    return new Response(
      JSON.stringify({ error: "Missing/invalid 'message' in body", payload }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const webhookUrl = import.meta.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return new Response(
      JSON.stringify({ error: "Missing N8N_WEBHOOK_URL env var" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2) Appel vers n8n
  const r = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });

  const text = await r.text();

 // 3) Nettoyage optionnel des "=" au début (n8n expressions)
try {
  const data = JSON.parse(text);

  if (typeof data.reply === "string") {
    data.reply = data.reply.replace(/^=\s*/, "");
  }
  if (typeof data.sessionId === "string") {
    data.sessionId = data.sessionId.replace(/^=\s*/, "");
  }

  return new Response(JSON.stringify(data), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
} catch {
  // si ce n'est pas du JSON, on renvoie brut
  return new Response(text, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
}
