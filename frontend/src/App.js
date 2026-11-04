import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import Triage from './components/Triage';
import Lab from './components/Lab';
import DailyDashboard from './components/DailyDashboard';
import PlanSummary from './components/PlanSummary';
import MyPlans from './components/MyPlans';
import ManageFarms from './components/ManageFarms';
import FarmDetails from './components/FarmDetails';
import SavingsAnalytics from './components/SavingsAnalytics';
import TransitionCalculator from './components/TransitionCalculator';
import ImpactVisualizer from './components/ImpactVisualizer';
import { logEnv } from './config';

function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content-area">
        <ErrorBoundary>
          <Routes>
            <Route path="/dashboard" element={<DailyDashboard />} />
            <Route path="/triage" element={<Triage />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/plan-summary" element={<PlanSummary />} />
            <Route path="/my-plans" element={<MyPlans />} />
            <Route path="/farms" element={<ManageFarms />} />
            <Route path="/farms/:id" element={<FarmDetails />} />
            <Route path="/analytics" element={<SavingsAnalytics />} />
            <Route path="/calculator" element={<TransitionCalculator />} />
            <Route path="/impact" element={<ImpactVisualizer />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  useEffect(() => {
    logEnv();
  }, []);

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;