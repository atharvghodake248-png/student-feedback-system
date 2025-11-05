// src/components/TeacherDashboard.js - COMPLETE WITH ADVANCED ANALYTICS
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getTeacherDashboard, 
  getTeacherFeedback, 
  downloadFeedbackData,
  getClassTeacherDashboard,
  getClassTeacherTracking,
  downloadClassTeacherReport,
  logout 
} from '../services/api';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import '../App.css';

const TeacherDashboard = () => {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [sentimentStats, setSentimentStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Class Teacher State
  const [classStats, setClassStats] = useState(null);
  const [studentTracking, setStudentTracking] = useState([]);
  const [classLoading, setClassLoading] = useState(false);

  // Advanced Analytics State
  const [advancedTab, setAdvancedTab] = useState('trends');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const username = localStorage.getItem('username');
      const dashboardData = await getTeacherDashboard(username);
      setTeacherInfo(dashboardData.teacher);

      const feedbackData = await getTeacherFeedback(username);
      setFeedbacks(feedbackData.feedback);
      setSentimentStats(feedbackData.sentiment_stats);
      
      if (dashboardData.teacher.is_class_teacher) {
        fetchClassTeacherData(username);
      }
    } catch (err) {
      setError('Failed to load data. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassTeacherData = async (username) => {
    try {
      setClassLoading(true);
      const classDashboard = await getClassTeacherDashboard(username);
      setClassStats(classDashboard);
      
      const tracking = await getClassTeacherTracking(username);
      setStudentTracking(tracking.students);
    } catch (err) {
      console.error('Failed to load class teacher data:', err);
    } finally {
      setClassLoading(false);
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

  const handleDownload = async () => {
    try {
      const username = localStorage.getItem('username');
      const blob = await downloadFeedbackData(username);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download data');
    }
  };

  const handleDownloadClassReport = async () => {
    try {
      const username = localStorage.getItem('username');
      const blob = await downloadClassTeacherReport(username);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Class_Feedback_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download class report');
    }
  };

  const calculateAverageRatings = () => {
    if (feedbacks.length === 0) return null;

    const totals = feedbacks.reduce(
      (acc, fb) => ({
        teaching_effectiveness: acc.teaching_effectiveness + fb.ratings.teaching_effectiveness,
        course_content: acc.course_content + fb.ratings.course_content,
        interaction_quality: acc.interaction_quality + fb.ratings.interaction_quality,
        assignment_feedback: acc.assignment_feedback + fb.ratings.assignment_feedback,
        overall_satisfaction: acc.overall_satisfaction + fb.ratings.overall_satisfaction,
      }),
      {
        teaching_effectiveness: 0,
        course_content: 0,
        interaction_quality: 0,
        assignment_feedback: 0,
        overall_satisfaction: 0,
      }
    );

    return Object.keys(totals).map(key => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: (totals[key] / feedbacks.length).toFixed(2),
    }));
  };

  // ADVANCED ANALYTICS FUNCTIONS
  const getTrendsData = () => {
    const monthlyData = {};
    
    feedbacks.forEach(feedback => {
      const date = new Date(feedback.created_at);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { month: monthYear, positive: 0, neutral: 0, negative: 0, total: 0 };
      }
      
      monthlyData[monthYear].total++;
      const sentiment = feedback.comment_sentiment || feedback.suggestion_sentiment;
      if (sentiment === 'positive') monthlyData[monthYear].positive++;
      else if (sentiment === 'neutral') monthlyData[monthYear].neutral++;
      else if (sentiment === 'negative') monthlyData[monthYear].negative++;
    });

    return Object.values(monthlyData).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA - dateB;
    });
  };

  const getWordFrequency = () => {
    const stopWords = ['the', 'is', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'very', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'about', 'this', 'that', 'these', 'those'];
    const wordCount = {};

    feedbacks.forEach(feedback => {
      const text = `${feedback.comments || ''} ${feedback.suggestions || ''}`.toLowerCase();
      const words = text.split(/\W+/);
      words.forEach(word => {
        if (word.length > 3 && !stopWords.includes(word)) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });
    });

    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count, size: Math.min(count * 8 + 12, 48) }));
  };

  const getRadarData = () => {
    const categories = {
      'Teaching': [],
      'Content': [],
      'Interaction': [],
      'Feedback': [],
      'Satisfaction': []
    };

    feedbacks.forEach(feedback => {
      if (feedback.ratings.teaching_effectiveness) categories['Teaching'].push(feedback.ratings.teaching_effectiveness);
      if (feedback.ratings.course_content) categories['Content'].push(feedback.ratings.course_content);
      if (feedback.ratings.interaction_quality) categories['Interaction'].push(feedback.ratings.interaction_quality);
      if (feedback.ratings.assignment_feedback) categories['Feedback'].push(feedback.ratings.assignment_feedback);
      if (feedback.ratings.overall_satisfaction) categories['Satisfaction'].push(feedback.ratings.overall_satisfaction);
    });

    return Object.entries(categories).map(([category, ratings]) => ({
      category,
      score: ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : 0,
      fullMark: 5
    }));
  };

  const getVolumeData = () => {
    const monthlyVolume = {};
    
    feedbacks.forEach(feedback => {
      const date = new Date(feedback.created_at);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      monthlyVolume[monthYear] = (monthlyVolume[monthYear] || 0) + 1;
    });

    return Object.entries(monthlyVolume)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  const getAdvancedStats = () => {
    const total = feedbacks.length;
    let positive = 0, negative = 0;
    
    feedbacks.forEach(fb => {
      const sentiment = fb.comment_sentiment || fb.suggestion_sentiment;
      if (sentiment === 'positive') positive++;
      else if (sentiment === 'negative') negative++;
    });
    
    const avgRating = feedbacks.reduce((sum, f) => sum + (f.ratings.overall_satisfaction || 0), 0) / (total || 1);

    return { total, positive, negative, avgRating: avgRating.toFixed(2) };
  };

  const sentimentData = sentimentStats
    ? [
        { name: 'Positive', value: sentimentStats.positive, color: '#28a745' },
        { name: 'Neutral', value: sentimentStats.neutral, color: '#ffc107' },
        { name: 'Negative', value: sentimentStats.negative, color: '#dc3545' },
      ]
    : [];

  const getSentimentBadge = (sentiment, score) => {
    if (!sentiment) {
      return (
        <span className="sentiment-badge neutral">
          Not analyzed
        </span>
      );
    }

    const badges = {
      positive: (
        <span className="sentiment-badge positive">
           Positive {score ? `(${score.toFixed(2)})` : ''}
        </span>
      ),
      neutral: (
        <span className="sentiment-badge neutral">
           Neutral {score ? `(${score.toFixed(2)})` : ''}
        </span>
      ),
      negative: (
        <span className="sentiment-badge negative">
           Negative {score ? `(${score.toFixed(2)})` : ''}
        </span>
      ),
    };

    return badges[sentiment] || badges.neutral;
  };

  if (loading) return <div className="loading">Loading...</div>;

  const advancedStats = getAdvancedStats();
  const trendsData = getTrendsData();
  const wordData = getWordFrequency();
  const radarData = getRadarData();
  const volumeData = getVolumeData();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {teacherInfo?.name}</span>
          {teacherInfo?.is_class_teacher && (
            <span className="class-teacher-badge"> Class Teacher</span>
          )}
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={activeTab === 'advanced' ? 'active' : ''}
          onClick={() => setActiveTab('advanced')}
        >
           Advanced Analytics
        </button>
        <button
          className={activeTab === 'feedbacks' ? 'active' : ''}
          onClick={() => setActiveTab('feedbacks')}
        >
          All Feedbacks
        </button>
        {teacherInfo?.is_class_teacher && (
          <button
            className={activeTab === 'class-teacher' ? 'active' : ''}
            onClick={() => setActiveTab('class-teacher')}
          >
             Class Teacher
          </button>
        )}
      </nav>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {activeTab === 'overview' && (
          <div className="overview-container-enhanced">
            <div className="overview-hero">
              <div className="overview-hero-content">
                <h2> Welcome to Your Dashboard</h2>
                <p>Quick overview of your teaching feedback and performance metrics</p>
              </div>
            </div>

            <div className="stats-grid-enhanced">
              <div className="stat-card-enhanced stat-primary">
                <div className="stat-icon-wrapper">
                </div>
                <div className="stat-content-wrapper">
                  <h3 className="stat-label">Total Feedback</h3>
                  <p className="stat-number-enhanced">{feedbacks.length}</p>
                  <div className="stat-subtitle">Responses received</div>
                </div>
                <div className="stat-decoration"></div>
              </div>

              <div className="stat-card-enhanced stat-success">
                <div className="stat-icon-wrapper">
                </div>
                <div className="stat-content-wrapper">
                  <h3 className="stat-label">Average Rating</h3>
                  <p className="stat-number-enhanced">
                    {feedbacks.length > 0
                      ? (
                          feedbacks.reduce((acc, fb) => acc + fb.ratings.overall_satisfaction, 0) /
                          feedbacks.length
                        ).toFixed(2)
                      : 'N/A'}
                    {feedbacks.length > 0 && <span className="stat-max">/5.00</span>}
                  </p>
                  <div className="stat-subtitle">Overall satisfaction</div>
                </div>
                <div className="stat-decoration"></div>
              </div>

              <div className="stat-card-enhanced stat-info">
                <div className="stat-icon-wrapper">
                </div>
                <div className="stat-content-wrapper">
                  <h3 className="stat-label">Positive Feedback</h3>
                  <p className="stat-number-enhanced">{sentimentStats?.positive || 0}</p>
                  <div className="stat-subtitle">
                    {feedbacks.length > 0 
                      ? `${((sentimentStats?.positive || 0) / feedbacks.length * 100).toFixed(1)}% positive rate`
                      : 'No data yet'}
                  </div>
                </div>
                <div className="stat-decoration"></div>
              </div>

              <div className="stat-card-enhanced stat-accent">
                <div className="stat-icon-wrapper">
                </div>
                <div className="stat-content-wrapper">
                  <h3 className="stat-label">Employee ID</h3>
                  <p className="stat-number-enhanced">{teacherInfo?.employee_id}</p>
                  <div className="stat-subtitle">Your identifier</div>
                </div>
                <div className="stat-decoration"></div>
              </div>
            </div>

            <div className="overview-quick-stats">
              <div className="quick-stat-item">
                <div className="quick-stat-content">
                  <div className="quick-stat-value">{sentimentStats?.positive || 0}</div>
                  <div className="quick-stat-label">Positive</div>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-content">
                  <div className="quick-stat-value">{sentimentStats?.neutral || 0}</div>
                  <div className="quick-stat-label">Neutral</div>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-content">
                  <div className="quick-stat-value">{sentimentStats?.negative || 0}</div>
                  <div className="quick-stat-label">Negative</div>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-content">
                  <div className="quick-stat-value">
                    {feedbacks.length > 0 
                      ? `${((sentimentStats?.positive || 0) / feedbacks.length * 100).toFixed(0)}%`
                      : '0%'}
                  </div>
                  <div className="quick-stat-label">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="action-buttons-enhanced">
              <button onClick={handleDownload} className="btn-download-enhanced">
                <span className="btn-text">Download Feedback Data (CSV)</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
  <div className="analytics-container-enhanced">
    <div className="analytics-hero">
      <div className="analytics-hero-content">
        <h2> Performance Analytics</h2>
        <p>Comprehensive overview of your teaching feedback and ratings</p>
      </div>
    </div>

    {/* Key Metrics Overview */}
    <div className="analytics-metrics-grid">
      <div className="metric-card metric-primary">
        <div className="metric-content">
          <span className="metric-label">Average Overall Rating</span>
          <span className="metric-value">
            {feedbacks.length > 0
              ? (feedbacks.reduce((acc, fb) => acc + fb.ratings.overall_satisfaction, 0) / feedbacks.length).toFixed(2)
              : '0.00'}
            <span className="metric-suffix">/5.00</span>
          </span>
          <div className="metric-bar">
            <div 
              className="metric-bar-fill" 
              style={{
                width: `${feedbacks.length > 0 
                  ? ((feedbacks.reduce((acc, fb) => acc + fb.ratings.overall_satisfaction, 0) / feedbacks.length) / 5) * 100 
                  : 0}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="metric-card metric-success">
        <div className="metric-content">
          <span className="metric-label">Positive Sentiment</span>
          <span className="metric-value">
            {sentimentStats?.positive || 0}
            <span className="metric-suffix">responses</span>
          </span>
          <span className="metric-percentage">
            {feedbacks.length > 0 
              ? `${((sentimentStats?.positive || 0) / feedbacks.length * 100).toFixed(1)}%`
              : '0%'}
          </span>
        </div>
      </div>

      <div className="metric-card metric-warning">
        <div className="metric-content">
          <span className="metric-label">Neutral Sentiment</span>
          <span className="metric-value">
            {sentimentStats?.neutral || 0}
            <span className="metric-suffix">responses</span>
          </span>
          <span className="metric-percentage">
            {feedbacks.length > 0 
              ? `${((sentimentStats?.neutral || 0) / feedbacks.length * 100).toFixed(1)}%`
              : '0%'}
          </span>
        </div>
      </div>

      <div className="metric-card metric-danger">
        <div className="metric-content">
          <span className="metric-label">Negative Sentiment</span>
          <span className="metric-value">
            {sentimentStats?.negative || 0}
            <span className="metric-suffix">responses</span>
          </span>
          <span className="metric-percentage">
            {feedbacks.length > 0 
              ? `${((sentimentStats?.negative || 0) / feedbacks.length * 100).toFixed(1)}%`
              : '0%'}
          </span>
        </div>
      </div>
    </div>

    {/* Rating Breakdown by Category */}
    <div className="analytics-section">
      <div className="section-header">
        <h3> Detailed Category Ratings</h3>
        <p>Individual performance metrics across all teaching dimensions</p>
      </div>
      {calculateAverageRatings() && (
        <div className="rating-cards-grid">
          {calculateAverageRatings().map((category, index) => {
            const percentage = (parseFloat(category.value) / 5) * 100;
            const colorClass = percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : percentage >= 40 ? 'average' : 'needs-improvement';
            
            return (
              <div key={index} className={`rating-detail-card ${colorClass}`}>
                <div className="rating-card-header">
                  <span className="rating-category-name">{category.name}</span>
                  <span className="rating-score">{category.value}/5</span>
                </div>
                <div className="rating-progress-bar">
                  <div 
                    className="rating-progress-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="rating-card-footer">
                  <span className="rating-percentage">{percentage.toFixed(0)}%</span>
                  <span className={`rating-badge ${colorClass}`}>
                    {percentage >= 80 ? ' Excellent' : 
                     percentage >= 60 ? ' Good' : 
                     percentage >= 40 ? ' Average' : 
                     ' Needs Improvement'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Charts Section */}
    <div className="charts-grid-enhanced">
      <div className="chart-card-enhanced">
        <div className="chart-header">
          <h3> Sentiment Distribution</h3>
          <p>Overall feedback sentiment breakdown</p>
        </div>
        <div className="chart-body">
          {sentimentData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-insights">
                <div className="insight-item">
                  <span className="insight-dot" style={{background: '#28a745'}}></span>
                  <span>{sentimentStats.positive} Positive ({((sentimentStats.positive / feedbacks.length) * 100).toFixed(1)}%)</span>
                </div>
                <div className="insight-item">
                  <span className="insight-dot" style={{background: '#ffc107'}}></span>
                  <span>{sentimentStats.neutral} Neutral ({((sentimentStats.neutral / feedbacks.length) * 100).toFixed(1)}%)</span>
                </div>
                <div className="insight-item">
                  <span className="insight-dot" style={{background: '#dc3545'}}></span>
                  <span>{sentimentStats.negative} Negative ({((sentimentStats.negative / feedbacks.length) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-data-message">
              <span className="no-data-icon"></span>
              <p>No sentiment data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="chart-card-enhanced">
        <div className="chart-header">
          <h3> Average Ratings by Category</h3>
          <p>Comparative analysis of teaching dimensions</p>
        </div>
        <div className="chart-body">
          {calculateAverageRatings() ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculateAverageRatings()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="name" 
                  angle={-20} 
                  textAnchor="end" 
                  height={120}
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#colorGradient)" 
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#764ba2" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">
              <span className="no-data-icon"></span>
              <p>No rating data available</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Performance Summary */}
    <div className="performance-summary">
      <h3> Performance Insights</h3>
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-content">
            <h4>Total Feedback Received</h4>
            <p><strong>{feedbacks.length}</strong> student responses</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-content">
            <h4>Highest Rated Category</h4>
            <p>
              <strong>
                {calculateAverageRatings() && calculateAverageRatings().length > 0
                  ? calculateAverageRatings().reduce((max, cat) => 
                      parseFloat(cat.value) > parseFloat(max.value) ? cat : max
                    ).name
                  : 'N/A'}
              </strong>
            </p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-content">
            <h4>Improvement Area</h4>
            <p>
              <strong>
                {calculateAverageRatings() && calculateAverageRatings().length > 0
                  ? calculateAverageRatings().reduce((min, cat) => 
                      parseFloat(cat.value) < parseFloat(min.value) ? cat : min
                    ).name
                  : 'N/A'}
              </strong>
            </p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-content">
            <h4>Satisfaction Rate</h4>
            <p>
              <strong>
                {feedbacks.length > 0
                  ? `${(((sentimentStats?.positive || 0) / feedbacks.length) * 100).toFixed(1)}%`
                  : '0%'}
              </strong> positive feedback
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        {/* ADVANCED ANALYTICS TAB */}
        {activeTab === 'advanced' && (
          <div className="advanced-analytics-container">
            <div className="aa-header">
              <h2> Advanced Analytics Dashboard</h2>
              <p>Deep dive into your teaching performance metrics and trends</p>
            </div>

            <div className="aa-stats-grid">
              <div className="aa-stat-card aa-primary">
                <div className="aa-stat-icon"></div>
                <div className="aa-stat-content">
                  <div className="aa-stat-label">Total Feedback</div>
                  <div className="aa-stat-value">{advancedStats.total}</div>
                </div>
              </div>
              <div className="aa-stat-card aa-success">
                <div className="aa-stat-icon"></div>
                <div className="aa-stat-content">
                  <div className="aa-stat-label">Positive Rate</div>
                  <div className="aa-stat-value">{((advancedStats.positive / advancedStats.total) * 100 || 0).toFixed(1)}%</div>
                </div>
              </div>
              <div className="aa-stat-card aa-danger">
                <div className="aa-stat-icon"></div>
                <div className="aa-stat-content">
                  <div className="aa-stat-label">Negative Rate</div>
                  <div className="aa-stat-value">{((advancedStats.negative / advancedStats.total) * 100 || 0).toFixed(1)}%</div>
                </div>
              </div>
              <div className="aa-stat-card aa-info">
                <div className="aa-stat-icon"></div>
                <div className="aa-stat-content">
                  <div className="aa-stat-label">Avg Rating</div>
                  <div className="aa-stat-value">{advancedStats.avgRating}/5</div>
                </div>
              </div>
            </div>

            <div className="aa-tabs">
              <button
                className={advancedTab === 'trends' ? 'aa-tab-active' : 'aa-tab'}
                onClick={() => setAdvancedTab('trends')}
              >
                 Sentiment Trends
              </button>
              <button
                className={advancedTab === 'words' ? 'aa-tab-active' : 'aa-tab'}
                onClick={() => setAdvancedTab('words')}
              >
                 Key Words
              </button>
              <button
                className={advancedTab === 'radar' ? 'aa-tab-active' : 'aa-tab'}
                onClick={() => setAdvancedTab('radar')}
              >
                 Performance Radar
              </button>
              <button
                className={advancedTab === 'volume' ? 'aa-tab-active' : 'aa-tab'}
                onClick={() => setAdvancedTab('volume')}
              >
                 Feedback Volume
              </button>
            </div>

            <div className="aa-chart-container">
              {advancedTab === 'trends' && (
                <div className="aa-chart-content">
                  <h3>Sentiment Trends Over Time</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={3} name="Positive" />
                      <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={3} name="Neutral" />
                      <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={3} name="Negative" />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="aa-chart-desc">Track how student sentiment has evolved over different months to identify trends and patterns.</p>
                </div>
              )}

              {advancedTab === 'words' && (
                <div className="aa-chart-content">
                  <h3>Most Frequent Words in Feedback</h3>
                  <div className="aa-word-cloud">
                    {wordData.map((item, index) => (
                      <div
                        key={item.word}
                        className="aa-word-item"
                        style={{
                          fontSize: `${item.size}px`,
                          backgroundColor: `hsl(${(index * 360) / wordData.length}, 70%, 85%)`,
                          color: `hsl(${(index * 360) / wordData.length}, 70%, 30%)`
                        }}
                      >
                        {item.word} <span className="aa-word-count">({item.count})</span>
                      </div>
                    ))}
                  </div>
                  <p className="aa-chart-desc">Common words from student feedback help identify recurring themes and concerns.</p>
                </div>
              )}

              {advancedTab === 'radar' && (
                <div className="aa-chart-content">
                  <h3>Performance Comparison Across Categories</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={90} domain={[0, 5]} />
                      <Radar name="Your Score" dataKey="score" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                  <p className="aa-chart-desc">The radar chart provides a quick visual comparison of your strengths and areas for improvement across all teaching categories.</p>
                </div>
              )}

              {advancedTab === 'volume' && (
                <div className="aa-chart-content">
                  <h3>Monthly Feedback Volume</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8b5cf6" name="Feedback Count" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="aa-chart-desc">Track how student engagement varies over time to identify peak feedback periods.</p>
                </div>
              )}
            </div>

            <div className="aa-insights">
              <h3> Quick Insights</h3>
              <ul>
                <li>You've received <strong>{advancedStats.total}</strong> feedback responses with an average rating of <strong>{advancedStats.avgRating}/5</strong></li>
                <li><strong>{advancedStats.positive}</strong> positive responses (<strong>{((advancedStats.positive / advancedStats.total) * 100 || 0).toFixed(1)}%</strong> positive rate)</li>
                <li>Most active feedback period: <strong>{volumeData.length > 0 ? volumeData.reduce((a, b) => a.count > b.count ? a : b).month : 'N/A'}</strong></li>
                <li>Top feedback word: <strong>{wordData.length > 0 ? wordData[0].word : 'N/A'}</strong></li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'feedbacks' && (
          <div className="feedbacks-container">
            <h2>All Feedback Responses</h2>
            {feedbacks.length > 0 ? (
              <div className="feedbacks-list">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="feedback-card">
                    <div className="feedback-header">
                      <h4>{fb.subject.name} ({fb.subject.code})</h4>
                      <span className="feedback-date">{fb.created_at}</span>
                    </div>
                    <p className="semester-info">{fb.semester}</p>

                    <div className="ratings-display">
                      <div className="rating-item">
                        <span>Teaching Effectiveness:</span>
                        <span className="rating-value">{fb.ratings.teaching_effectiveness}/5</span>
                      </div>
                      <div className="rating-item">
                        <span>Course Content:</span>
                        <span className="rating-value">{fb.ratings.course_content}/5</span>
                      </div>
                      <div className="rating-item">
                        <span>Interaction Quality:</span>
                        <span className="rating-value">{fb.ratings.interaction_quality}/5</span>
                      </div>
                      <div className="rating-item">
                        <span>Assignment Feedback:</span>
                        <span className="rating-value">{fb.ratings.assignment_feedback}/5</span>
                      </div>
                      <div className="rating-item">
                        <span>Overall Satisfaction:</span>
                        <span className="rating-value">{fb.ratings.overall_satisfaction}/5</span>
                      </div>
                    </div>

                    {fb.comments && (
                      <div className="feedback-text">
                        <div className="feedback-text-header">
                          <strong>Comments:</strong>
                          {getSentimentBadge(fb.comment_sentiment, fb.comment_sentiment_score)}
                        </div>
                        <p>{fb.comments}</p>
                      </div>
                    )}

                    {fb.suggestions && (
                      <div className="feedback-text">
                        <div className="feedback-text-header">
                          <strong>Suggestions:</strong>
                          {getSentimentBadge(fb.suggestion_sentiment, fb.suggestion_sentiment_score)}
                        </div>
                        <p>{fb.suggestions}</p>
                      </div>
                    )}

                    {!fb.comments && !fb.suggestions && (
                      <div className="feedback-text">
                        <p style={{ color: '#999', fontStyle: 'italic' }}>
                          No comments or suggestions provided
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No feedback received yet.</p>
            )}
          </div>
        )}

        {/* CLASS TEACHER TAB */}
        {activeTab === 'class-teacher' && teacherInfo?.is_class_teacher && (
          <div className="class-teacher-container-pro">
            <div className="ct-header">
              <div className="ct-header-content">
                <div className="ct-icon"></div>
                <div className="ct-title-section">
                  <h2>Class Feedback Tracking Dashboard</h2>
                  <p className="ct-subtitle">Monitor and manage student feedback submissions</p>
                </div>
              </div>
            </div>
            
            {classLoading ? (
              <div className="ct-loading">
                <div className="ct-spinner"></div>
                <p>Loading class data...</p>
              </div>
            ) : classStats ? (
              <>
                <div className="ct-class-info-card">
                  <div className="ct-card-icon"></div>
                  <div className="ct-card-content">
                    <h3>Assigned Class Information</h3>
                    <div className="ct-class-details-grid">
                      <div className="ct-detail-item">
                        <span className="ct-label">Academic Year</span>
                        <span className="ct-value">{classStats.class_info.year}</span>
                      </div>
                      <div className="ct-detail-item">
                        <span className="ct-label">Branch</span>
                        <span className="ct-value">{classStats.class_info.branch}</span>
                      </div>
                      <div className="ct-detail-item">
                        <span className="ct-label">Semester</span>
                        <span className="ct-value">{classStats.class_info.semester}</span>
                      </div>
                      <div className="ct-detail-item">
                        <span className="ct-label">Division</span>
                        <span className="ct-value">{classStats.class_info.division}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ct-stats-grid">
                  <div className="ct-stat-card ct-total">
                    <div className="ct-stat-icon"></div>
                    <div className="ct-stat-content">
                      <h4>Total Students</h4>
                      <p className="ct-stat-number">{classStats.statistics.total_students}</p>
                      <span className="ct-stat-label">Enrolled in class</span>
                    </div>
                  </div>
                  <div className="ct-stat-card ct-success">
                    <div className="ct-stat-icon"></div>
                    <div className="ct-stat-content">
                      <h4>Feedback Submitted</h4>
                      <p className="ct-stat-number">{classStats.statistics.submitted_feedback}</p>
                      <span className="ct-stat-label">Students completed</span>
                    </div>
                  </div>
                  <div className="ct-stat-card ct-warning">
                    <div className="ct-stat-icon"></div>
                    <div className="ct-stat-content">
                      <h4>Pending Submission</h4>
                      <p className="ct-stat-number">{classStats.statistics.pending_feedback}</p>
                      <span className="ct-stat-label">Awaiting feedback</span>
                    </div>
                  </div>
                  <div className="ct-stat-card ct-info">
                    <div className="ct-stat-icon"></div>
                    <div className="ct-stat-content">
                      <h4>Completion Rate</h4>
                      <p className="ct-stat-number">{classStats.statistics.completion_rate}%</p>
                      <span className="ct-stat-label">Overall progress</span>
                    </div>
                  </div>
                </div>

                {classStats.pending_students && classStats.pending_students.length > 0 && (
                  <div className="ct-pending-alert">
                    <div className="ct-alert-header">
                      <span className="ct-alert-icon"></span>
                      <h3>Students Pending Feedback Submission</h3>
                    </div>
                    <div className="ct-pending-students-grid">
                      {classStats.pending_students.map((student, index) => (
                        <div key={index} className="ct-pending-student-card">
                          <div className="ct-student-avatar">{student.name.charAt(0)}</div>
                          <div className="ct-student-info">
                            <div className="ct-student-name">{student.name}</div>
                            <div className="ct-student-prn">PRN: {student.prn}</div>
                            <div className="ct-student-email">{student.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="ct-tracking-section">
                  <div className="ct-section-header">
                    <h3><span className="ct-section-icon"></span> Detailed Student Tracking</h3>
                    <p className="ct-section-desc">Complete overview of individual student progress</p>
                  </div>
                  {studentTracking.length > 0 ? (
                    <div className="ct-table-wrapper">
                      <table className="ct-table">
                        <thead>
                          <tr>
                            <th>PRN</th>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th className="ct-center">Division</th>
                            <th className="ct-center">Submitted</th>
                            <th className="ct-center">Pending</th>
                            <th className="ct-center">Progress</th>
                            <th className="ct-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentTracking.map((student, index) => (
                            <tr key={index} className={student.status === 'Complete' ? 'ct-row-complete' : 'ct-row-pending'}>
                              <td className="ct-prn">{student.prn}</td>
                              <td className="ct-student-name-cell">{student.name}</td>
                              <td className="ct-email">{student.email}</td>
                              <td className="ct-center">{student.division}</td>
                              <td className="ct-center">
                                <span className="ct-count-submitted">{student.feedback_submitted}</span>
                              </td>
                              <td className="ct-center">
                                <span className="ct-count-pending">{student.feedback_pending}</span>
                              </td>
                              <td className="ct-progress-cell">
                                <div className="ct-progress-container">
                                  <div className="ct-progress-bar">
                                    <div 
                                      className="ct-progress-fill" 
                                      style={{ width: `${student.completion_percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="ct-progress-text">{student.completion_percentage}%</span>
                                </div>
                              </td>
                              <td className="ct-center">
                                <span className={`ct-status-badge ${student.status === 'Complete' ? 'ct-status-complete' : 'ct-status-pending'}`}>
                                  {student.status === 'Complete' ? '✓ Complete' : '○ Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="ct-no-data">
                      <p>No student tracking data available</p>
                    </div>
                  )}
                </div>

                <div className="ct-action-section">
                  <button onClick={handleDownloadClassReport} className="ct-download-btn">
                    <span className="ct-btn-icon"></span>
                    <span className="ct-btn-text">Download Complete Excel Report</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="ct-no-data">
                <p>No class teacher data available</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        /* ADVANCED ANALYTICS STYLES */
        .advanced-analytics-container {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aa-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
          color: white;
        }

        .aa-header h2 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
        }

        .aa-header p {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
        }

        .aa-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .aa-stat-card {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          display: flex;
          gap: 20px;
          align-items: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .aa-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .aa-stat-card.aa-primary::before {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .aa-stat-card.aa-success::before {
          background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
        }

        .aa-stat-card.aa-danger::before {
          background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
        }

        .aa-stat-card.aa-info::before {
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        }

        .aa-stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .aa-stat-icon {
          font-size: 42px;
        }

        .aa-stat-content {
          flex: 1;
        }

        .aa-stat-label {
          color: #718096;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 8px;
        }

        .aa-stat-value {
          color: #2d3748;
          font-size: 36px;
          font-weight: 700;
          line-height: 1;
        }

        .aa-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .aa-tab {
          background: white;
          border: 2px solid #e2e8f0;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #4a5568;
        }

        .aa-tab:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .aa-tab-active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 2px solid transparent;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .aa-chart-container {
          background: white;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .aa-chart-content h3 {
          margin: 0 0 20px 0;
          color: #2d3748;
          font-size: 24px;
          font-weight: 600;
        }

        .aa-chart-desc {
          margin: 20px 0 0 0;
          color: #718096;
          font-size: 14px;
          line-height: 1.6;
        }

        .aa-word-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          align-items: center;
          padding: 30px 0;
        }

        .aa-word-item {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 600;
          transition: transform 0.3s ease;
          cursor: default;
        }

        .aa-word-item:hover {
          transform: scale(1.1);
        }

        .aa-word-count {
          font-size: 0.7em;
          opacity: 0.8;
        }

        .aa-insights {
          background: linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%);
          border-radius: 16px;
          padding: 25px;
          border-left: 6px solid #3b82f6;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
        }

        .aa-insights h3 {
          margin: 0 0 15px 0;
          color: #1e40af;
          font-size: 20px;
          font-weight: 600;
        }

        .aa-insights ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .aa-insights li {
          color: #1e3a8a;
          font-size: 14px;
          line-height: 1.8;
          padding: 8px 0;
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
        }

        .aa-insights li:last-child {
          border-bottom: none;
        }

        .aa-insights strong {
          color: #1e40af;
          font-weight: 700;
        }

        /* PROFESSIONAL CLASS TEACHER TAB STYLES */
        .class-teacher-container-pro {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 30px;
          border-radius: 20px;
          animation: ctFadeIn 0.6s ease-out;
        }

        @keyframes ctFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ct-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
        }

        .ct-header-content {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .ct-icon {
          font-size: 60px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }

        .ct-title-section h2 {
          color: white;
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .ct-subtitle {
          color: rgba(255,255,255,0.9);
          margin: 0;
          font-size: 16px;
          font-weight: 400;
        }

        .ct-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          background: white;
          border-radius: 16px;
        }

        .ct-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e0e0e0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: ctSpin 1s linear infinite;
        }

        @keyframes ctSpin {
          to { transform: rotate(360deg); }
        }

        .ct-loading p {
          margin-top: 20px;
          color: #666;
          font-size: 16px;
        }

        .ct-class-info-card {
          background: white;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border-left: 6px solid #667eea;
          display: flex;
          gap: 25px;
        }

        .ct-card-icon {
          font-size: 50px;
          flex-shrink: 0;
        }

        .ct-card-content {
          flex: 1;
        }

        .ct-card-content h3 {
          margin: 0 0 20px 0;
          color: #2d3748;
          font-size: 22px;
          font-weight: 600;
        }

        .ct-class-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .ct-detail-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ct-label {
          color: #718096;
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ct-value {
          color: #2d3748;
          font-size: 18px;
          font-weight: 600;
        }

        .ct-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .ct-stat-card {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          display: flex;
          gap: 20px;
          align-items: flex-start;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .ct-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .ct-stat-card.ct-total::before {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .ct-stat-card.ct-success::before {
          background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
        }

        .ct-stat-card.ct-warning::before {
          background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
        }

        .ct-stat-card.ct-info::before {
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        }

        .ct-stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .ct-stat-icon {
          font-size: 42px;
          opacity: 0.9;
        }

        .ct-stat-content {
          flex: 1;
        }

        .ct-stat-content h4 {
          margin: 0 0 10px 0;
          color: #4a5568;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ct-stat-number {
          margin: 0 0 6px 0;
          color: #2d3748;
          font-size: 36px;
          font-weight: 700;
          line-height: 1;
        }

        .ct-stat-label {
          color: #a0aec0;
          font-size: 12px;
          font-weight: 500;
        }

        .ct-pending-alert {
          background: linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%);
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 30px;
          border-left: 6px solid #ff9800;
          box-shadow: 0 4px 20px rgba(255, 152, 0, 0.15);
        }

        .ct-alert-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .ct-alert-icon {
          font-size: 28px;
        }

        .ct-alert-header h3 {
          margin: 0;
          color: #cc7a00;
          font-size: 20px;
          font-weight: 600;
        }

        .ct-pending-students-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .ct-pending-student-card {
          background: white;
          border-radius: 12px;
          padding: 18px;
          display: flex;
          gap: 15px;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
        }

        .ct-pending-student-card:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .ct-student-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .ct-student-info {
          flex: 1;
        }

        .ct-student-name {
          color: #2d3748;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .ct-student-prn {
          color: #718096;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .ct-student-email {
          color: #a0aec0;
          font-size: 12px;
        }

        .ct-tracking-section {
          background: white;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .ct-section-header {
          margin-bottom: 25px;
        }

        .ct-section-header h3 {
          margin: 0 0 8px 0;
          color: #2d3748;
          font-size: 24px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ct-section-icon {
          font-size: 28px;
        }

        .ct-section-desc {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }

        .ct-table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          box-shadow: 0 0 0 1px #e2e8f0;
        }

        .ct-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .ct-table thead {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .ct-table th {
          padding: 16px 20px;
          text-align: left;
          color: white;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .ct-table th.ct-center {
          text-align: center;
        }

        .ct-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
          color: #4a5568;
        }

        .ct-table tbody tr {
          transition: all 0.2s ease;
        }

        .ct-table tbody tr:hover {
          background-color: #f7fafc;
        }

        .ct-table tbody tr:last-child td {
          border-bottom: none;
        }

        .ct-row-complete {
          background-color: #f0fdf4 !important;
        }

        .ct-row-pending {
          background-color: #fffbeb !important;
        }

        .ct-prn {
          font-weight: 600;
          color: #667eea;
          font-family: 'Courier New', monospace;
        }

        .ct-student-name-cell {
          font-weight: 500;
          color: #2d3748;
        }

        .ct-email {
          color: #718096;
          font-size: 13px;
        }

        .ct-center {
          text-align: center !important;
        }

        .ct-count-submitted {
          display: inline-block;
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 13px;
        }

        .ct-count-pending {
          display: inline-block;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 13px;
        }

        .ct-progress-cell {
          min-width: 180px;
        }

        .ct-progress-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ct-progress-bar {
          flex: 1;
          height: 10px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .ct-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
          border-radius: 10px;
          transition: width 0.5s ease;
          position: relative;
        }

        .ct-progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: ctShimmer 2s infinite;
        }

        @keyframes ctShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .ct-progress-text {
          color: #4a5568;
          font-weight: 600;
          font-size: 12px;
          min-width: 45px;
          text-align: right;
        }

        .ct-status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .ct-status-complete {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          color: #155724;
          border: 1px solid #b1dfbb;
        }

        .ct-status-pending {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          color: #856404;
          border: 1px solid #ffd93d;
        }

        .ct-action-section {
          text-align: center;
          padding: 30px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .ct-download-btn {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          border: none;
          padding: 18px 40px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 6px 20px rgba(17, 153, 142, 0.3);
          transition: all 0.3s ease;
        }

        .ct-download-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(17, 153, 142, 0.4);
        }

        .ct-download-btn:active {
          transform: translateY(-1px);
        }

        .ct-btn-icon {
          font-size: 22px;
        }

        .ct-btn-text {
          letter-spacing: 0.3px;
        }

        .ct-no-data {
          text-align: center;
          padding: 60px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .ct-no-data p {
          color: #718096;
          font-size: 16px;
          margin: 0;
        }

        /* Responsive Design for Advanced Analytics */
        @media (max-width: 768px) {
          .aa-header h2 {
            font-size: 24px;
          }

          .aa-stats-grid {
            grid-template-columns: 1fr;
          }

          .aa-stat-value {
            font-size: 28px;
          }

          .aa-tabs {
            flex-direction: column;
          }

          .aa-tab, .aa-tab-active {
            width: 100%;
            text-align: center;
          }

          .aa-chart-container {
            padding: 20px;
          }

          .aa-word-cloud {
            padding: 20px 0;
          }
        }

        /* Responsive Design for Class Teacher */
        @media (max-width: 1200px) {
          .ct-stats-grid {
            grid-template-columns: 1fr;
          }

          .ct-stat-card {
            padding: 20px;
          }

          .ct-class-info-card {
            flex-direction: column;
            padding: 20px;
          }

          .ct-class-details-grid {
            grid-template-columns: 1fr;
          }

          .ct-pending-students-grid {
            grid-template-columns: 1fr;
          }

          .ct-table-wrapper {
            font-size: 12px;
          }

          .ct-table th,
          .ct-table td {
            padding: 12px 10px;
          }

          .ct-progress-container {
            flex-direction: column;
            gap: 6px;
          }

          .ct-progress-text {
            text-align: center;
          }
        }

        /* Original Styles */
        .class-teacher-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin: 0 10px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .sentiment-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          margin-left: 10px;
        }

        .sentiment-badge.positive {
          background-color: #d4edda;
          color: #155724;
        }

        .sentiment-badge.neutral {
          background-color: #fff3cd;
          color: #856404;
        }

        .sentiment-badge.negative {
          background-color: #f8d7da;
          color: #721c24;
        }

        .feedback-text-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .feedback-text {
          margin-top: 15px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border-left: 3px solid #007bff;
        }

        .feedback-text strong {
          color: #333;
          display: block;
          margin-bottom: 5px;
        }

        .feedback-text p {
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
         /* ENHANCED ANALYTICS TAB STYLES */
.analytics-container-enhanced {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.analytics-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  color: white;
  position: relative;
  overflow: hidden;
}

.analytics-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.analytics-hero-content {
  position: relative;
  z-index: 1;
}

.analytics-hero h2 {
  margin: 0 0 10px 0;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.analytics-hero p {
  margin: 0;
  font-size: 18px;
  opacity: 0.95;
}

.analytics-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  gap: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
}

.metric-card.metric-primary::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.metric-card.metric-success::before {
  background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
}

.metric-card.metric-warning::before {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
}

.metric-card.metric-danger::before {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

.metric-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.metric-icon {
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-label {
  color: #718096;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  color: #2d3748;
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.metric-suffix {
  font-size: 16px;
  color: #a0aec0;
  font-weight: 500;
}

.metric-percentage {
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
}

.metric-bar {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 8px;
}

.metric-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  transition: width 0.8s ease;
}

.analytics-section {
  background: white;
  border-radius: 20px;
  padding: 35px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.section-header {
  margin-bottom: 30px;
}

.section-header h3 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 26px;
  font-weight: 600;
}

.section-header p {
  margin: 0;
  color: #718096;
  font-size: 15px;
}

.rating-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.rating-detail-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 25px;
  transition: all 0.3s ease;
  border-left: 5px solid #ccc;
}

.rating-detail-card.excellent {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-left-color: #28a745;
}

.rating-detail-card.good {
  background: linear-gradient(135deg, #cfe2ff 0%, #b6d4fe 100%);
  border-left-color: #0d6efd;
}

.rating-detail-card.average {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-left-color: #ffc107;
}

.rating-detail-card.needs-improvement {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c2c7 100%);
  border-left-color: #dc3545;
}

.rating-detail-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.rating-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.rating-category-name {
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
}

.rating-score {
  color: #2d3748;
  font-size: 28px;
  font-weight: 700;
}

.rating-progress-bar {
  width: 100%;
  height: 10px;
  background: rgba(255,255,255,0.5);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
}

.rating-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  transition: width 0.8s ease;
  position: relative;
}

/*
 .rating-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
  */

.rating-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-percentage {
  color: #4a5568;
  font-size: 14px;
  font-weight: 600;
}

.rating-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.rating-badge.excellent {
  background: #28a745;
  color: white;
}

.rating-badge.good {
  background: #0d6efd;
  color: white;
}

.rating-badge.average {
  background: #ffc107;
  color: #333;
}

.rating-badge.needs-improvement {
  background: #dc3545;
  color: white;
}

.charts-grid-enhanced {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.chart-card-enhanced {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.chart-card-enhanced:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.chart-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
}

.chart-header h3 {
  margin: 0 0 6px 0;
  color: #2d3748;
  font-size: 22px;
  font-weight: 600;
}

.chart-header p {
  margin: 0;
  color: #718096;
  font-size: 14px;
}

.chart-body {
  position: relative;
}

.chart-insights {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
}

.insight-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #a0aec0;
}

.no-data-icon {
  font-size: 64px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.no-data-message p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.performance-summary {
  background: linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%);
  border-radius: 20px;
  padding: 35px;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
}

.performance-summary h3 {
  margin: 0 0 25px 0;
  color: #1e40af;
  font-size: 26px;
  font-weight: 600;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.insight-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.insight-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
}

.insight-emoji {
  font-size: 42px;
  flex-shrink: 0;
}

.insight-content h4 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 15px;
  font-weight: 600;
}

.insight-content p {
  margin: 0;
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
}

.insight-content strong {
  color: #667eea;
  font-weight: 700;
  font-size: 16px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .charts-grid-enhanced {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .analytics-hero {
    padding: 30px 20px;
  }

  .analytics-hero h2 {
    font-size: 28px;
  }

  .analytics-hero p {
    font-size: 16px;
  }

  .analytics-metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-value {
    font-size: 32px;
  }

  .rating-cards-grid {
    grid-template-columns: 1fr;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .analytics-section {
    padding: 25px 20px;
  }
} 

/* ENHANCED OVERVIEW TAB STYLES */

.overview-container-enhanced {
  /* No animation */
}

/* Hero Section */
.overview-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
}

.overview-hero-content {
  text-align: center;
  color: white;
}

.overview-hero-content h2 {
  margin: 0 0 12px 0;
  font-size: 38px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.overview-hero-content p {
  margin: 0;
  font-size: 18px;
  opacity: 0.95;
  font-weight: 400;
}

/* Enhanced Stats Grid */
.stats-grid-enhanced {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card-enhanced {
  background: white;
  border-radius: 12px;
  padding: 25px;
  display: flex;
  gap: 20px;
  align-items: center;
  transition: transform 0.2s ease;
  position: relative;
  border: 1px solid #e2e8f0;
}

.stat-card-enhanced::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.stat-card-enhanced:hover::before {
  /* No change on hover */
}

.stat-card-enhanced.stat-primary::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.stat-card-enhanced.stat-success::before {
  background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
}

.stat-card-enhanced.stat-info::before {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card-enhanced.stat-accent::before {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

.stat-card-enhanced:hover {
  transform: translateY(-2px);
}

.stat-decoration {
  /* Removed */
}

.stat-icon-wrapper {
  flex-shrink: 0;
}

.stat-icon {
  font-size: 48px;
}

.stat-content-wrapper {
  flex: 1;
}

.stat-label {
  color: #718096;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 0 0 10px 0;
}

.stat-number-enhanced {
  color: #2d3748;
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  margin: 0 0 6px 0;
  display: block;
}

.stat-max {
  font-size: 20px;
  color: #a0aec0;
  font-weight: 500;
  margin-left: 4px;
}

.stat-subtitle {
  color: #a0aec0;
  font-size: 13px;
  font-weight: 500;
  margin: 0;
}

/* Quick Stats Section */
.overview-quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.quick-stat-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s ease;
  border: 1px solid #e2e8f0;
}

.quick-stat-item:hover {
  transform: translateY(-2px);
}

.quick-stat-icon {
  font-size: 36px;
  flex-shrink: 0;
}

.quick-stat-content {
  flex: 1;
}

.quick-stat-value {
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin: 0 0 6px 0;
}

.quick-stat-label {
  color: #718096;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Action Buttons */
.action-buttons-enhanced {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.btn-download-enhanced {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s ease;
}

.btn-download-enhanced::before {
  /* Removed */
}

.btn-download-enhanced:hover::before {
  /* Removed */
}

.btn-download-enhanced:hover {
  transform: translateY(-2px);
}

.btn-download-enhanced:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 20px;
}

.btn-text {
  letter-spacing: 0.3px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .stats-grid-enhanced {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .overview-quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .overview-hero {
    padding: 35px 25px;
  }

  .overview-hero-content h2 {
    font-size: 28px;
  }

  .overview-hero-content p {
    font-size: 16px;
  }

  .stats-grid-enhanced {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stat-card-enhanced {
    padding: 25px;
  }

  .stat-number-enhanced {
    font-size: 38px;
  }

  .stat-icon {
    font-size: 48px;
  }

  .overview-quick-stats {
    grid-template-columns: 1fr;
  }

  .quick-stat-value {
    font-size: 28px;
  }

  .action-buttons-enhanced {
    flex-direction: column;
  }

  .btn-download-enhanced {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .overview-hero {
    padding: 25px 20px;
  }

  .overview-hero-content h2 {
    font-size: 24px;
  }

  .stat-card-enhanced {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .stat-content-wrapper {
    text-align: center;
  }

  .quick-stat-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .quick-stat-content {
    text-align: center;
  }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;