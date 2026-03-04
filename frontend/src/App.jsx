import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/ThemeProvider"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import History from "./pages/History"
import Settings from "./pages/Settings"
import Onboarding from "./pages/Onboarding"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="habittrack-theme">
      <BrowserRouter>
        <Routes>
          {/* Default redirect (could check auth state here later) */}
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          
          {/* Onboarding without layout */}
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Main App Routes with Sidebar/BottomNav */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
