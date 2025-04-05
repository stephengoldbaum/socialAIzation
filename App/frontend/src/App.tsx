import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import ScenariosPage from './pages/Scenarios';
import ScenarioDetailsPage from './pages/ScenarioDetails';
import NewScenarioPage from './pages/NewScenario';
import EditScenarioPage from './pages/EditScenario';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import UnauthorizedPage from './pages/Unauthorized';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, RoleProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          
          <Route path="scenarios">
            <Route index element={<ProtectedRoute><ScenariosPage /></ProtectedRoute>} />
            <Route 
              path="new" 
              element={
                <RoleProtectedRoute roles={['scenario_owner']}>
                  <NewScenarioPage />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path=":id" 
              element={
                <ProtectedRoute>
                  <ScenarioDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path=":id/edit" 
              element={
                <RoleProtectedRoute roles={['scenario_owner']}>
                  <EditScenarioPage />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path=":id/run" 
              element={
                <ProtectedRoute>
                  {/* Run scenario page would go here */}
                  <div>Run Scenario</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path=":id/history" 
              element={
                <ProtectedRoute>
                  {/* History page would go here */}
                  <div>Scenario History</div>
                </ProtectedRoute>
              } 
            />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
