import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { InterviewProvider } from './context/InterviewContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import PrivateRoute from './components/layout/PrivateRoute';
import { ROUTES } from './utils/constants';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import LiveInterview from './pages/LiveInterview';
import CodingInterview from './pages/CodingInterview';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import InterviewReplay from './pages/InterviewReplay';
import UserProfile from './pages/UserProfile';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <InterviewProvider>
            <Router>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1A1A2E',
                    color: '#fff',
                    border: '1px solid rgba(108, 99, 255, 0.3)',
                  },
                  success: { iconTheme: { primary: '#00D4AA', secondary: '#1A1A2E' } },
                  error: { iconTheme: { primary: '#ef4444', secondary: '#1A1A2E' } },
                }}
              />
              <Switch>
                <Route exact path={ROUTES.HOME} component={Landing} />
                <Route exact path={ROUTES.LOGIN} component={Login} />
                <Route exact path={ROUTES.REGISTER} component={Register} />

                <PrivateRoute exact path={ROUTES.DASHBOARD} component={Dashboard} />
                <PrivateRoute exact path={ROUTES.INTERVIEW_SETUP} component={InterviewSetup} />
                <PrivateRoute exact path="/interview/live/:id" component={LiveInterview} />
                <PrivateRoute exact path="/interview/coding/:id" component={CodingInterview} />
                <PrivateRoute exact path={ROUTES.ANALYTICS} component={AnalyticsDashboard} />
                <PrivateRoute exact path="/interview/replay/:id" component={InterviewReplay} />
                <PrivateRoute exact path={ROUTES.PROFILE} component={UserProfile} />
                <PrivateRoute exact path={ROUTES.LEADERBOARD} component={Leaderboard} />
                <PrivateRoute exact path={ROUTES.ADMIN} component={AdminPanel} adminOnly />

                <Route exact path="/404" component={NotFound} />
                <Redirect to="/404" />
              </Switch>
            </Router>
          </InterviewProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
