const GUERRILLA_API = "https://api.guerrillamail.com/ajax.php";

async function createTempEmail(): Promise<{ address: string; sidToken: string }> {
  const res = await fetch(`${GUERRILLA_API}?f=get_email_address&lang=en`, {
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`Failed to create temp email: ${res.status}`);
  }

  const data = (await res.json()) as { email_addr: string; sid_token: string };
  const emailUser = `texify${Date.now()}`;

  const setRes = await fetch(
    `${GUERRILLA_API}?f=set_email_user&email_user=${emailUser}&lang=en&sid_token=${data.sid_token}`,
    { signal: AbortSignal.timeout(15_000) },
  );

  if (!setRes.ok) {
    throw new Error(`Failed to set email user: ${setRes.status}`);
  }

  const setData = (await setRes.json()) as { email_addr: string; sid_token: string };
  return { address: setData.email_addr, sidToken: setData.sid_token };
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

interface GuerrillaEmail {
  mail_id: number;
  mail_from: string;
  mail_subject: string;
  mail_body: string;
}

async function pollForApiKeyEmail(sidToken: string, maxAttempts = 30, intervalMs = 5000): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GUERRILLA_API}?f=check_email&seq=0&sid_token=${sidToken}`,
      { signal: AbortSignal.timeout(15_000) },
    );

    if (res.ok) {
      const data = (await res.json()) as { list: GuerrillaEmail[] };
      const emails = (data.list || []).filter((m) => m.mail_from !== "no-reply@guerrillamail.com");

      if (emails.length > 0) {
        const body = emails[0].mail_body || "";
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
  const { address, sidToken } = await createTempEmail();
  console.log(`[gstin-key-renewer] Temp email: ${address}`);

  console.log("[gstin-key-renewer] Registering on gstincheck.co.in...");
  const msg = await registerOnGstinCheck(address);
  console.log(`[gstin-key-renewer] Registration response: ${msg}`);

  console.log("[gstin-key-renewer] Polling for API key email...");
  const apiKey = await pollForApiKeyEmail(sidToken);
  console.log("[gstin-key-renewer] New API key obtained");

  return apiKey;
}
