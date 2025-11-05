// src/services/api.js - WITH DIVISION + ADD SUBJECT

import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) config.headers['X-CSRFToken'] = csrfToken;
  return config;
});

// Authentication
export const login = async (username, password) => {
  const response = await api.post('/login/', { username, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.get('/logout/');
  return response.data;
};

// Student APIs
export const getStudentDashboard = async (username) => {
  const response = await api.get(`/student/dashboard/?username=${username}`);
  return response.data;
};

export const getStudentSubjects = async (username) => {
  const response = await api.get(`/student/subjects/?username=${username}`);
  return response.data;
};

export const submitFeedback = async (feedbackData) => {
  const response = await api.post('/student/submit-feedback/', feedbackData);
  return response.data;
};

// Teacher APIs
export const getTeacherDashboard = async (username) => {
  const response = await api.get(`/teacher/dashboard/?username=${username}`);
  return response.data;
};

export const getTeacherFeedback = async (username) => {
  const response = await api.get(`/teacher/feedback/?username=${username}`);
  return response.data;
};

export const downloadFeedbackData = async (username) => {
  const response = await api.get(`/teacher/download-data/?username=${username}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Class Teacher APIs
export const getClassTeacherDashboard = async (username) => {
  const response = await api.get(`/class-teacher/dashboard/?username=${username}`);
  return response.data;
};

export const getClassTeacherTracking = async (username) => {
  const response = await api.get(`/class-teacher/student-tracking/?username=${username}`);
  return response.data;
};

export const downloadClassTeacherReport = async (username) => {
  const response = await api.get(`/class-teacher/download-report/?username=${username}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Admin APIs
export const addStudent = async (studentData) => {
  const response = await api.post('/admin/add-student/', studentData);
  return response.data;
};

export const addTeacher = async (teacherData) => {
  const response = await api.post('/admin/add-teacher/', teacherData);
  return response.data;
};

export const addSubject = async (subjectData) => {
  const response = await api.post('/admin/add-subject/', subjectData);
  return response.data;
};

export const assignClassTeacher = async (data) => {
  const response = await api.post('/admin/assign-class-teacher/', data);
  return response.data;
};

export const manageAccess = async () => {
  const response = await api.get('/admin/manage-access/');
  return response.data;
};

// Data APIs
export const getBranches = async () => {
  const response = await api.get('/branches/');
  return response.data;
};

export const getYears = async () => {
  const response = await api.get('/years/');
  return response.data;
};

export const getSemesters = async (yearId) => {
  const response = await api.get(`/semesters/${yearId}/`);
  return response.data;
};

export const getSubjects = async (yearId, branchId, semesterId) => {
  const response = await api.get(`/subjects/${yearId}/${branchId}/${semesterId}/`);
  return response.data;
};

export const getDivisions = async () => {
  const response = await api.get('/divisions/');
  return response.data;
};

// ==================== ADMIN UPDATE APIS ====================

export const updateStudent = async (studentId, studentData) => {
  const response = await api.put(`/admin/students/${studentId}/update/`, studentData);
  return response.data;
};

export const updateTeacher = async (teacherId, teacherData) => {
  const response = await api.put(`/admin/teachers/${teacherId}/update/`, teacherData);
  return response.data;
};

export const updateSubject = async (subjectId, subjectData) => {
  const response = await api.put(`/admin/subjects/${subjectId}/update/`, subjectData);
  return response.data;
};

export const deleteStudent = async (studentId) => {
  const response = await api.delete(`/admin/students/${studentId}/delete/`);
  return response.data;
};

export const deleteTeacher = async (teacherId) => {
  const response = await api.delete(`/admin/teachers/${teacherId}/delete/`);
  return response.data;
};

export const deleteSubject = async (subjectId) => {
  const response = await api.delete(`/admin/subjects/${subjectId}/delete/`);
  return response.data;
};

export default api;