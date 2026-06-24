const headers = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  const payload = await request.json();
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    return new Response(JSON.stringify({ sent: false, reason: "RESEND_API_KEY is not configured" }), { headers });
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: Deno.env.get("MODERATION_FROM_EMAIL") ?? "The Meadow <alerts@the-meadow.app>",
      html: `
        <h1>${payload.subject ?? "Meadow Moderation Alert"}</h1>
        <p><strong>Author:</strong> ${payload.authorId ?? "Unknown"}</p>
        <p><strong>Reason:</strong> ${payload.reason ?? "No reason provided"}</p>
        <p><strong>Time:</strong> ${payload.timestamp ?? new Date().toISOString()}</p>
        <pre>${payload.contentText ?? ""}</pre>
      `,
      subject: payload.subject ?? "Meadow Moderation Alert",
      to: payload.to ?? "brittanylpike@gmail.com",
    }),
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const result = await response.json();
  return new Response(JSON.stringify({ sent: response.ok, result }), { headers, status: response.ok ? 200 : 500 });
});
