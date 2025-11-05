// src/components/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentDashboard, getStudentSubjects, submitFeedback, logout } from '../services/api';
import '../App.css';

const StudentDashboard = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [feedback, setFeedback] = useState({
    teaching_effectiveness: 3,
    course_content: 3,
    interaction_quality: 3,
    assignment_feedback: 3,
    overall_satisfaction: 3,
    comments: '',
    suggestions: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const username = localStorage.getItem('username');
      const dashboardData = await getStudentDashboard(username);
      setStudentInfo(dashboardData.student);

      const subjectsData = await getStudentSubjects(username);
      setSubjects(subjectsData.subjects);
    } catch (err) {
      setError('Failed to load data. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.clear();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const username = localStorage.getItem('username');
      await submitFeedback({
        username: username,
        subject_id: selectedSubject.id,
        teacher_id: selectedSubject.teacher.id,
        ...feedback,
      });

      setSuccessMessage('Feedback submitted successfully!');
      setShowFeedbackForm(false);
      setSelectedSubject(null);
      setFeedback({
        teaching_effectiveness: 3,
        course_content: 3,
        interaction_quality: 3,
        assignment_feedback: 3,
        overall_satisfaction: 3,
        comments: '',
        suggestions: '',
      });

      const subjectsData = await getStudentSubjects(username);
      setSubjects(subjectsData.subjects);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    }
  };

  const openFeedbackForm = (subject) => {
    setSelectedSubject(subject);
    setShowFeedbackForm(true);
    setError('');
    setSuccessMessage('');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {studentInfo?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="student-info-card">
          <h2>Your Information</h2>
          <p><strong>PRN:</strong> {studentInfo?.prn}</p>
          <p><strong>Year:</strong> {studentInfo?.year}</p>
          <p><strong>Branch:</strong> {studentInfo?.branch}</p>
          <p><strong>Semester:</strong> {studentInfo?.semester}</p>
        </div>

        {!showFeedbackForm ? (
          <div className="subjects-container">
            <h2>Your Subjects</h2>
            <div className="subjects-grid">
              {subjects.map((subject) => (
                <div key={subject.id} className="subject-card">
                  <h3>{subject.name}</h3>
                  <p className="subject-code">{subject.code}</p>
                  <p><strong>Teacher:</strong> {subject.teacher.name}</p>
                  <p className="teacher-id">({subject.teacher.employee_id})</p>
                  
                  {subject.feedback_submitted ? (
                    <div className="feedback-status submitted">
                      ✓ Feedback Submitted
                    </div>
                  ) : (
                    <button onClick={() => openFeedbackForm(subject)} className="btn-primary">
                      Give Feedback
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="feedback-form-container">
            <h2>Submit Feedback</h2>
            <div className="selected-subject-info">
              <h3>{selectedSubject.name} ({selectedSubject.code})</h3>
              <p>Teacher: {selectedSubject.teacher.name}</p>
            </div>

            <form onSubmit={handleSubmitFeedback} className="feedback-form">
              <div className="rating-group">
                <label>Teaching Effectiveness</label>
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map(val => (
                    <label key={val}>
                      <input type="radio" name="teaching_effectiveness" value={val}
                        checked={feedback.teaching_effectiveness === val}
                        onChange={() => setFeedback({...feedback, teaching_effectiveness: val})} />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rating-group">
                <label>Course Content Quality</label>
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map(val => (
                    <label key={val}>
                      <input type="radio" name="course_content" value={val}
                        checked={feedback.course_content === val}
                        onChange={() => setFeedback({...feedback, course_content: val})} />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rating-group">
                <label>Interaction Quality</label>
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map(val => (
                    <label key={val}>
                      <input type="radio" name="interaction_quality" value={val}
                        checked={feedback.interaction_quality === val}
                        onChange={() => setFeedback({...feedback, interaction_quality: val})} />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rating-group">
                <label>Assignment Feedback Quality</label>
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map(val => (
                    <label key={val}>
                      <input type="radio" name="assignment_feedback" value={val}
                        checked={feedback.assignment_feedback === val}
                        onChange={() => setFeedback({...feedback, assignment_feedback: val})} />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rating-group">
                <label>Overall Satisfaction</label>
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map(val => (
                    <label key={val}>
                      <input type="radio" name="overall_satisfaction" value={val}
                        checked={feedback.overall_satisfaction === val}
                        onChange={() => setFeedback({...feedback, overall_satisfaction: val})} />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Comments</label>
                <textarea value={feedback.comments}
                  onChange={(e) => setFeedback({...feedback, comments: e.target.value})}
                  placeholder="Share your thoughts about the teaching..." rows="4" />
              </div>

              <div className="form-group">
                <label>Suggestions</label>
                <textarea value={feedback.suggestions}
                  onChange={(e) => setFeedback({...feedback, suggestions: e.target.value})}
                  placeholder="Any suggestions for improvement..." rows="4" />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Submit Feedback</button>
                <button type="button"
                  onClick={() => {
                    setShowFeedbackForm(false);
                    setSelectedSubject(null);
                  }}
                  className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;