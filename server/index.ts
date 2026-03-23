import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const isProd = process.env.NODE_ENV === "production";

// ─── TRUST PROXY (required for Replit / any reverse proxy) ───────────────────
// Without this, express-session won't set cookies correctly behind HTTPS proxies
app.set("trust proxy", 1);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  // Allow any replit.app / repl.co origin, plus localhost for dev
  const allowed =
    /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
    origin.endsWith(".replit.app") ||
    origin.endsWith(".repl.co") ||
    origin.endsWith(".replit.dev") ||
    origin.endsWith(".kirk.replit.dev");

  if (allowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (!origin) {
    // Same-origin or server-to-server — allow
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || "keep-crm-dev-secret-change-in-production";

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure:true works because we set trust proxy above — Replit terminates TLS
      secure: isProd,
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// ─── API ROUTES ───────────────────────────────────────────────────────────────

app.use("/api", routes);

// ─── SERVE ENQUIRY FORM (public — always, dev + prod) ────────────────────────

const publicPath = path.resolve(__dirname, "../client/public");
app.use("/public", express.static(publicPath));

// Serve enquiry form at /enquiry
app.get("/enquiry", (req, res) => {
  res.sendFile(path.join(publicPath, "enquiry.html"));
});

// ─── SERVE CLIENT IN PRODUCTION ───────────────────────────────────────────────

if (process.env.NODE_ENV === "production") {
  const clientPath = path.resolve(__dirname, "../client");
  app.use(express.static(clientPath));
  app.get("*", (req, res) => {
    // Don't catch /enquiry — already handled above
    if (req.path === "/enquiry") return;
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🏗️  Keep Group CRM — Trixie OS Layer 2`);
  console.log(`   Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? "Connected" : "NOT CONFIGURED"}\n`);
});

export default app;
