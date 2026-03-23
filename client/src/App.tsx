import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import LeadsPage from "./pages/LeadsPage";
import LeadDetailPage from "./pages/LeadDetailPage";
import NewLeadPage from "./pages/NewLeadPage";
import SettingsPage from "./pages/SettingsPage";
import LostIntelligencePage from "./pages/LostIntelligencePage";
import IntelligencePage from "./pages/IntelligencePage";
import Sidebar from "./components/Sidebar";
import { apiRequest } from "./lib/api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    apiRequest("/api/auth/me")
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F7F7F7", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: '"DM Sans", sans-serif', fontSize: "1.375rem", fontWeight: 600, color: "#111111", marginBottom: "0.5rem" }}>
            Keep Group
          </h1>
          <p style={{ color: "#999999", fontSize: "0.875rem", fontFamily: '"DM Sans", sans-serif' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "#F7F7F7" }}>
      <Sidebar onLogout={() => setIsAuthenticated(false)} />
      <main style={{ flex: 1, overflowY: "auto", backgroundColor: "#F7F7F7" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 2.5rem" }}>
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/leads" component={LeadsPage} />
            <Route path="/leads/new" component={NewLeadPage} />
            <Route path="/leads/:id" component={LeadDetailPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/lost-intelligence" component={LostIntelligencePage} />
            <Route path="/intelligence" component={IntelligencePage} />
            <Route>
              <div style={{ textAlign: "center", paddingTop: "5rem" }}>
                <h2 style={{ fontFamily: '"DM Sans", sans-serif', fontSize: "1.5rem", fontWeight: 600, color: "#111111" }}>
                  Page not found
                </h2>
              </div>
            </Route>
          </Switch>
        </div>
      </main>
    </div>
  );
}
