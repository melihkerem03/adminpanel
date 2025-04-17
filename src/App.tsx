import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/index';
import AdminLayout from './layouts/AdminLayout';
import AboutUsManagement from './pages/AboutUsManagement';
import BlogManagement from './pages/BlogManagement';
import DestinationManagement from './pages/DestinationManagement';
import HomePageManagement from './pages/HomePageManagement';
import OpportunityManagement from './pages/OpportunityManagement';
import ServicesManagement from './pages/ServicesManagement';
import ToursManagement from './pages/ToursManagement';
import TourTypeManagement from './pages/TourTypeManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (email: string, password: string) => {
    if (email === "a@a" && password === "0") {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" /> : 
            <Login onLogin={handleLogin} />
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          element={
            isAuthenticated ? 
            <AdminLayout onLogout={handleLogout} /> : 
            <Navigate to="/" />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about-us-management" element={<AboutUsManagement />} />
          <Route path="/blog-management" element={<BlogManagement />} />
          <Route path="/destination-management" element={<DestinationManagement />} />
          <Route path="/homepage-management" element={<HomePageManagement />} />
          <Route path="/opportunity-management" element={<OpportunityManagement />} />
          <Route path="/services-management" element={<ServicesManagement />} />
          <Route path="/tours-management" element={<ToursManagement />} />
          <Route path="/tour-type-management" element={<TourTypeManagement />} />
          <Route path="/users" element={<div className="p-6"><h1 className="text-2xl font-bold">Kullanıcılar</h1></div>} />
          <Route path="/statistics" element={<div className="p-6"><h1 className="text-2xl font-bold">İstatistikler</h1></div>} />
          <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Ayarlar</h1></div>} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;