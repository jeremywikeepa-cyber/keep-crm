import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

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
      secure: false, // set to true only behind HTTPS reverse proxy (Replit handles this)
      httpOnly: true,
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
