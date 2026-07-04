const MAIL_TM_API = "https://api.mail.tm";

async function createTempEmail(): Promise<{ address: string; token: string }> {
  const domainsRes = await fetch(`${MAIL_TM_API}/domains`);
  const domainsData = (await domainsRes.json()) as { "hydra:member": { domain: string }[] };
  const domain = domainsData["hydra:member"][0].domain;

  const address = `texify${Date.now()}@${domain}`;
  const password = "TexifyAutoKey1!";

  const createRes = await fetch(`${MAIL_TM_API}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create temp email: ${createRes.status}`);
  }

  const tokenRes = await fetch(`${MAIL_TM_API}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Failed to get email token: ${tokenRes.status}`);
  }

  const tokenData = (await tokenRes.json()) as { token: string };
  return { address, token: tokenData.token };
}

async function registerOnGstinCheck(email: string): Promise<string> {
  const url = `https://sheet.gstincheck.co.in/website/user/create/${encodeURIComponent(email)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  const text = await res.text();

  let parsed: { message?: string | { message?: string } };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Unexpected response from gstincheck: ${text.substring(0, 200)}`);
  }

  const msg = typeof parsed.message === "object" && parsed.message !== null
    ? parsed.message.message ?? JSON.stringify(parsed.message)
    : String(parsed.message ?? "");

  if (msg.includes("Account already exists")) {
    throw new Error("Account already exists for this email");
  }

  if (msg.includes("Too many accounts") || msg.includes("Invalid Registration")) {
    throw new Error(msg);
  }

  if (!msg || msg === "undefined") {
    throw new Error(`Registration returned unexpected response: ${text.substring(0, 200)}`);
  }

  return msg;
}

interface MailMessage {
  id: string;
  from: { address: string };
  subject: string;
}

interface MailMessageFull {
  text?: string;
  html?: string;
}

async function pollForApiKeyEmail(token: string, maxAttempts = 30, intervalMs = 5000): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${MAIL_TM_API}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = (await res.json()) as { "hydra:member": MailMessage[] };
      const messages = data["hydra:member"] || [];

      if (messages.length > 0) {
        const msgRes = await fetch(`${MAIL_TM_API}/messages/${messages[0].id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const msg = (await msgRes.json()) as MailMessageFull;
        const body = msg.text || msg.html || "";

        const apiKey = extractApiKey(body);
        if (apiKey) return apiKey;

        throw new Error("Email received but could not extract API key from body");
      }
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error("No email received after polling");
}

function extractApiKey(body: string): string | null {
  const patterns = [
    /api[_\s-]*key[:\s]*([a-zA-Z0-9_\-]{8,})/i,
    /key[:\s]+([a-f0-9]{16,})/i,
    /([a-f0-9]{32,})/i,
    /your[:\s]*(?:api)?[:\s]*key[:\s]*([a-zA-Z0-9_\-]{8,})/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function renewApiKey(): Promise<string> {
  console.log("[gstin-key-renewer] Creating temp email...");
  const { address, token } = await createTempEmail();
  console.log(`[gstin-key-renewer] Temp email: ${address}`);

  console.log("[gstin-key-renewer] Registering on gstincheck.co.in...");
  const msg = await registerOnGstinCheck(address);
  console.log(`[gstin-key-renewer] Registration response: ${msg}`);

  console.log("[gstin-key-renewer] Polling for API key email...");
  const apiKey = await pollForApiKeyEmail(token);
  console.log("[gstin-key-renewer] New API key obtained");

  return apiKey;
}
