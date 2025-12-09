import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import LandingPage from "./pages/LandingPage";

import SignIn from "./pages/auth/SignIn";

import SignUp from "./pages/auth/SignUp";

import Dashboard from "./pages/dashboard/Dashboard";

import Documents from "./pages/dashboard/Documents";

import Settings from "./pages/dashboard/Settings";

import PortfolioBuilder from "./pages/dashboard/PortfolioBuilder";

import Templates from "./pages/dashboard/Templates";

import TemplateGenerator from "./pages/dashboard/TemplateGenerator";

import AITools from "./pages/dashboard/AITools";

import PublicPortfolio from "./pages/PublicPortfolio";

import { UserProvider, RequireAuth } from "./lib/authContext.jsx";

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    const NAVBAR_OFFSET = 72; // approximate fixed navbar height
    const { hash } = location;

    if (hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        const top =
          el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      // No hash, scroll to top on route changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ScrollToHash />

        <div className="route-wrapper">
          <Routes>
            {/* Public Pages */}

            <Route path="/" element={<LandingPage />} />

            {/* Auth Pages */}

            <Route path="/auth/signin" element={<SignIn />} />

            <Route path="/auth/signup" element={<SignUp />} />

            {/* Dashboard Pages */}

            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />

            <Route
              path="/dashboard/portfolio"
              element={
                <RequireAuth>
                  <PortfolioBuilder />
                </RequireAuth>
              }
            />

            <Route
              path="/dashboard/templates"
              element={
                <RequireAuth>
                  <Templates />
                </RequireAuth>
              }
            />

            <Route
              path="/dashboard/templates/:templateId"
              element={
                <RequireAuth>
                  <TemplateGenerator />
                </RequireAuth>
              }
            />

            <Route
              path="/dashboard/tools"
              element={
                <RequireAuth>
                  <AITools />
                </RequireAuth>
              }
            />

            <Route
              path="/dashboard/documents"
              element={
                <RequireAuth>
                  <Documents />
                </RequireAuth>
              }
            />

            <Route
              path="/dashboard/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />

            {/* Public Portfolio */}

            <Route path="/u/:username" element={<PublicPortfolio />} />
          </Routes>
        </div>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
