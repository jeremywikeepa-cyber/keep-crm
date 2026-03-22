import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if ((req.session as any).authenticated) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export function loginHandler(req: Request, res: Response): void {
  const { password } = req.body as { password: string };
  const dashboardPassword = process.env.DASHBOARD_PASSWORD;

  if (!dashboardPassword) {
    res.status(500).json({ error: "Server misconfiguration: DASHBOARD_PASSWORD not set" });
    return;
  }

  if (password === dashboardPassword) {
    (req.session as any).authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
}

export function logoutHandler(req: Request, res: Response): void {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to logout" });
      return;
    }
    res.json({ success: true });
  });
}

export function meHandler(req: Request, res: Response): void {
  if ((req.session as any).authenticated) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
}
