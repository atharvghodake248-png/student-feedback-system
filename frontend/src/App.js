// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedType }) => {
  const userType = localStorage.getItem('userType');
  
  if (!userType) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedType && userType !== allowedType) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedType="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedType="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedType="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;