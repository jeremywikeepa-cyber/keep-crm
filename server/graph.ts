// Microsoft Graph API integration for Outlook email
// OAuth2 flow: Azure AD v2 (works for both personal and work accounts)

const TENANT      = process.env.MS_TENANT_ID   || "common";
const CLIENT_ID   = process.env.MS_CLIENT_ID   || "";
const CLIENT_SECRET = process.env.MS_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.MS_REDIRECT_URI || "http://localhost:5000/api/graph/callback";

const GRAPH_BASE  = "https://graph.microsoft.com/v1.0";
const TOKEN_URL   = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`;
const AUTH_URL    = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`;

const SCOPES = [
  "Mail.Read",
  "Mail.Send",
  "Mail.ReadWrite",
  "offline_access",
  "Files.ReadWrite",
].join(" ");

// ── In-memory token store (replace with DB persistence in production) ─────────

let _accessToken  = process.env.MS_ACCESS_TOKEN  || "";
let _refreshToken = process.env.MS_REFRESH_TOKEN || "";
let _tokenExpiry  = 0; // unix ms

export function setTokens(access: string, refresh: string, expiresIn: number) {
  _accessToken  = access;
  _refreshToken = refresh;
  _tokenExpiry  = Date.now() + (expiresIn - 60) * 1000; // refresh 60s early
}

export function hasTokens(): boolean {
  return !!_accessToken;
}

// ── OAuth URL ──────────────────────────────────────────────────────────────────

export function getOAuthUrl(): string {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    response_type: "code",
    redirect_uri:  REDIRECT_URI,
    response_mode: "query",
    scope:         SCOPES,
    prompt:        "select_account",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

// ── Token refresh ─────────────────────────────────────────────────────────────

export async function refreshAccessToken(): Promise<void> {
  if (!_refreshToken) throw new Error("No refresh token available");

  const body = new URLSearchParams({
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type:    "refresh_token",
    refresh_token: _refreshToken,
    redirect_uri:  REDIRECT_URI,
  });

  const res = await fetch(TOKEN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const data = await res.json() as {
    access_token:  string;
    refresh_token?: string;
    expires_in:    number;
  };

  setTokens(
    data.access_token,
    data.refresh_token || _refreshToken,
    data.expires_in,
  );
}

// ── Exchange auth code for tokens ─────────────────────────────────────────────

export async function exchangeCode(code: string): Promise<void> {
  const body = new URLSearchParams({
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type:    "authorization_code",
    code,
    redirect_uri:  REDIRECT_URI,
    scope:         SCOPES,
  });

  const res = await fetch(TOKEN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Code exchange failed: ${err}`);
  }

  const data = await res.json() as {
    access_token:  string;
    refresh_token?: string;
    expires_in:    number;
  };

  setTokens(data.access_token, data.refresh_token || "", data.expires_in);
}

// ── Authenticated Graph fetch (auto-refreshes on 401) ─────────────────────────

export async function graphRequest(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<any> {
  // Proactively refresh if token is expiring soon
  if (_tokenExpiry && Date.now() > _tokenExpiry && _refreshToken) {
    await refreshAccessToken();
  }

  const res = await fetch(`${GRAPH_BASE}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${_accessToken}`,
      "Content-Type":  "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 && retry && _refreshToken) {
    await refreshAccessToken();
    return graphRequest(path, options, false);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Graph API ${res.status}: ${err}`);
  }

  // 204 No Content — return empty object
  if (res.status === 204) return {};
  return res.json();
}

// ── Poll inbox for new emails ──────────────────────────────────────────────────

export interface GraphMessage {
  id:             string;
  conversationId: string;
  subject:        string;
  bodyPreview:    string;
  body:           { content: string; contentType: string };
  receivedDateTime: string;
  from:           { emailAddress: { address: string; name: string } };
  toRecipients:   Array<{ emailAddress: { address: string; name: string } }>;
}

export async function pollNewEmails(sinceHours = 1): Promise<GraphMessage[]> {
  return pollNewEmailsFromFolder("inbox", sinceHours);
}

/**
 * Poll emails from a specific mail folder.
 * @param folder - 'inbox' | 'sentitems' | any well-known folder name
 * @param sinceHours - how far back to look
 */
export async function pollNewEmailsFromFolder(folder: string, sinceHours = 1): Promise<GraphMessage[]> {
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();
  const filter = encodeURIComponent(`receivedDateTime ge ${since}`);
  const select = "id,conversationId,subject,bodyPreview,body,receivedDateTime,from,toRecipients";

  const data = await graphRequest(
    `/me/mailFolders/${folder}/messages?$filter=${filter}&$select=${select}&$top=50&$orderby=receivedDateTime+desc`,
  );
  return (data.value || []) as GraphMessage[];
}

// ── Send email ────────────────────────────────────────────────────────────────

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  threadId?: string,
): Promise<void> {
  const message: any = {
    subject,
    body: {
      contentType: "HTML",
      content:     body,
    },
    toRecipients: [
      { emailAddress: { address: to } },
    ],
  };

  // If replying to a thread, use the reply endpoint
  if (threadId) {
    const thread = await graphRequest(
      `/me/messages?$filter=${encodeURIComponent(`conversationId eq '${threadId}'`)}&$top=1&$select=id`,
    );
    const msgId = thread.value?.[0]?.id;
    if (msgId) {
      await graphRequest(`/me/messages/${msgId}/reply`, {
        method: "POST",
        body:   JSON.stringify({ message: { body: message.body, toRecipients: message.toRecipients } }),
      });
      return;
    }
  }

  await graphRequest("/me/sendMail", {
    method: "POST",
    body:   JSON.stringify({ message, saveToSentItems: true }),
  });
}

// ── Get email thread ──────────────────────────────────────────────────────────

export async function getEmailThread(conversationId: string): Promise<GraphMessage[]> {
  const filter = encodeURIComponent(`conversationId eq '${conversationId}'`);
  const select = "id,conversationId,subject,bodyPreview,body,receivedDateTime,from,toRecipients";
  const data   = await graphRequest(
    `/me/messages?$filter=${filter}&$select=${select}&$orderby=receivedDateTime+asc`,
  );
  return (data.value || []) as GraphMessage[];

// ── Client-credentials token (app-only, no signed-in user) ───────────────────
// Used for server-side OneDrive file uploads without a user OAuth session.

let _appToken       = "";
let _appTokenExpiry = 0;

async function getAppToken(): Promise<string> {
  if (_appToken && Date.now() < _appTokenExpiry) return _appToken;

  const body = new URLSearchParams({
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type:    "client_credentials",
    scope:         "https://graph.microsoft.com/.default",
  });

  const url = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`;
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`App token request failed: ${err}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  _appToken       = data.access_token;
  _appTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return _appToken;
}

// ── Upload file to OneDrive (Keep Modular > Resources > Trixie OS) ────────────
//
// Uses app-only (client credentials) auth — no user login required.
//
// @param fileName   - e.g. "quote-2026-001.pdf"
// @param fileBuffer - file contents as Buffer or Uint8Array
// @param mimeType   - e.g. "application/pdf" or "text/plain"
// @param subFolder  - optional sub-folder inside Trixie OS, e.g. "Quotes"
// @param userUpn    - UPN of the OneDrive owner, defaults to env var MS_ONEDRIVE_USER

export async function uploadToOneDrive(
  fileName:   string,
  fileBuffer: Buffer | Uint8Array,
  mimeType    = "application/octet-stream",
  subFolder   = "",
  userUpn     = process.env.MS_ONEDRIVE_USER || "",
): Promise<{ webUrl: string; id: string }> {
  if (!userUpn) throw new Error("MS_ONEDRIVE_USER env var not set");

  const token = await getAppToken();

  // Build the destination path: Keep Modular > Resources > Trixie OS > [subFolder]
  const basePath = "Resources/Trixie OS";
  const destPath = subFolder
    ? `${basePath}/${subFolder}/${fileName}`
    : `${basePath}/${fileName}`;

  const uploadUrl = `${GRAPH_BASE}/users/${encodeURIComponent(userUpn)}/drive/root:/${encodeURIComponent(destPath)}:/content`;

  const res = await fetch(uploadUrl, {
    method:  "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type":  mimeType,
    },
    body: fileBuffer,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OneDrive upload failed (${res.status}): ${err}`);
  }

  const data = await res.json() as { webUrl: string; id: string };
  console.log(`[OneDrive] Uploaded "${fileName}" to ${basePath}/${subFolder} -> ${data.webUrl}`);
  return data;
}
}
