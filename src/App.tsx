import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import StudentInterface from './components/StudentInterface';
import EmbedWidget from './components/EmbedWidget';
import { isAdminAuthenticated } from './utils/auth';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(isAdminAuthenticated());
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Handle embed routes
  if (location.pathname.startsWith('/embed')) {
    const pathParts = location.pathname.split('/');
    if (pathParts[2] === 'batches') {
      return <EmbedWidget type="batches" />;
    } else if (pathParts[2] === 'live' && pathParts[3]) {
      return <EmbedWidget type="live" batchId={pathParts[3]} />;
    }
    return <div>Invalid embed URL</div>;
  }

  // Handle admin routes
  if (location.pathname.startsWith('/admin')) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
    }

    return <AdminDashboard onLogout={() => setIsAuthenticated(false)} />;
  }

  // Default to student interface
  return <StudentInterface />;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;