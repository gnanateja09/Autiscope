import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ScreeningLookup from './pages/ScreeningLookup';
import Login from './pages/Login';
import Register from './pages/Register';
import AdultForm from './pages/AdultForm';
import ToddlerForm from './pages/ToddlerForm';
import AdultReport from './pages/AdultReport';
import ToddlerReport from './pages/ToddlerReport';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/lookup" element={
            <ProtectedRoute>
              <ScreeningLookup />
            </ProtectedRoute>
          } />
          <Route path="/selection" element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          } />
          <Route path="/form/adult" element={
            <ProtectedRoute>
              <AdultForm />
            </ProtectedRoute>
          } />
          <Route path="/form/toddler" element={
            <ProtectedRoute>
              <ToddlerForm />
            </ProtectedRoute>
          } />
          <Route path="/report/adult" element={
            <ProtectedRoute>
              <AdultReport />
            </ProtectedRoute>
          } />
          <Route path="/report/toddler" element={
            <ProtectedRoute>
              <ToddlerReport />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;