import React, { useState, useEffect, useCallback } from 'react';
import {
  addStudent,
  addTeacher,
  addSubject,
  getBranches,
  getYears,
  getSemesters,
  getDivisions,
  logout,
  updateStudent,    
  updateTeacher,    
  updateSubject     
} from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('add-student');
  const [branches, setBranches] = useState([]);
  const [years, setYears] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [classSemesters, setClassSemesters] = useState([]);
  const [subjectSemesters, setSubjectSemesters] = useState([]);
  const [assignmentSemesters, setAssignmentSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  // For edit purpose
  const [editStudentSemesters, setEditStudentSemesters] = useState([]);
  // For edit purpose

  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedTeacherAssignments, setSelectedTeacherAssignments] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  
  const [subjectFilters, setSubjectFilters] = useState({
    year_id: '',
    branch_id: '',
    semester_id: '',
    division: '',
    searchText: ''
  });
  
  const [studentFilters, setStudentFilters] = useState({
    year: '',
    branch: '',
    semester: '',
    division: '',
    searchText: ''
  });
  
  const [teacherSearchText, setTeacherSearchText] = useState('');

  const [studentForm, setStudentForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    prn_number: '',
    year_id: '',
    branch_id: '',
    semester_id: '',
    division_id: ''
  });

  const [teacherForm, setTeacherForm] = useState({
    employee_id: '',
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    department_id: '',
    is_class_teacher: false,
    assigned_class_year: '',
    assigned_class_branch: '',
    assigned_class_semester: '',
    assigned_class_division: ''
  });

  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    year_id: '',
    branch_id: '',
    semester_id: '',
    division_id: '',
    credits: '4'
  });

  const [assignmentForm, setAssignmentForm] = useState({
    teacher_id: '',
    year_id: '',
    branch_id: '',
    semester_id: '',
    division_id: '',
    subject_id: ''
  });

  const fetchSemesters = useCallback(async (yearId) => {
    try {
      const semestersData = await getSemesters(yearId);
      setSemesters(semestersData.semesters);
    } catch (err) {
      setError('Failed to load semesters');
    }
  }, []);

  const fetchClassSemesters = useCallback(async (yearId) => {
    try {
      const semestersData = await getSemesters(yearId);
      setClassSemesters(semestersData.semesters);
    } catch (err) {
      console.error('Failed to load class semesters');
    }
  }, []);

  const fetchSubjectSemesters = useCallback(async (yearId) => {
    try {
      const semestersData = await getSemesters(yearId);
      setSubjectSemesters(semestersData.semesters);
    } catch (err) {
      console.error('Failed to load subject semesters');
    }
  }, []);

  const fetchAssignmentSemesters = useCallback(async (yearId) => {
    try {
      const semestersData = await getSemesters(yearId);
      setAssignmentSemesters(semestersData.semesters);
    } catch (err) {
      console.error('Failed to load assignment semesters');
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/students/');
      const data = await response.json();
      setStudents(data.students || []);
    } catch (err) {
      setError('Failed to load students');
    }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/teachers/');
      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (err) {
      setError('Failed to load teachers');
    }
  }, []);

  const fetchAllSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/all-subjects/');
      const data = await response.json();
      if (data.success) {
        setAllSubjects(data.subjects || []);
      }
    } catch (err) {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableSubjects = useCallback(async () => {
    if (!assignmentForm.year_id || !assignmentForm.branch_id || !assignmentForm.semester_id) {
      setAvailableSubjects([]);
      return;
    }

    try {
      const params = new URLSearchParams({
        year_id: assignmentForm.year_id,
        branch_id: assignmentForm.branch_id,
        semester_id: assignmentForm.semester_id
      });
      
      if (assignmentForm.division_id) {
        params.append('division_id', assignmentForm.division_id);
      }

      const response = await fetch(`http://127.0.0.1:8000/api/admin/subjects-by-class/?${params}`);
      const data = await response.json();
      setAvailableSubjects(data.subjects || []);
    } catch (err) {
      console.error('Failed to load available subjects');
      setAvailableSubjects([]);
    }
  }, [assignmentForm.year_id, assignmentForm.branch_id, assignmentForm.semester_id, assignmentForm.division_id]);

  const fetchTeacherSubjects = useCallback(async (teacherId) => {
    if (!teacherId) {
      setSelectedTeacherAssignments([]);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/teacher-subjects/${teacherId}/`);
      const data = await response.json();
      if (data.success) {
        setSelectedTeacherAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Failed to load teacher subjects');
      setSelectedTeacherAssignments([]);
    }
  }, []);

  const fetchAllAssignments = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/teacher-subject-assignments/');
      const data = await response.json();
      if (data.success) {
        setAllAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Failed to load all assignments');
      setAllAssignments([]);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const branchesData = await getBranches();
      setBranches(branchesData.branches);
      const yearsData = await getYears();
      setYears(yearsData.years);
      const divisionsData = await getDivisions();
      setDivisions(divisionsData.divisions);
    } catch (err) {
      setError('Failed to load initial data');
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (studentForm.year_id) {
      fetchSemesters(studentForm.year_id);
    }
  }, [studentForm.year_id, fetchSemesters]);

  useEffect(() => {
    if (teacherForm.assigned_class_year) {
      fetchClassSemesters(teacherForm.assigned_class_year);
    } else {
      setClassSemesters([]);
    }
  }, [teacherForm.assigned_class_year, fetchClassSemesters]);

  useEffect(() => {
    if (subjectForm.year_id) {
      fetchSubjectSemesters(subjectForm.year_id);
    } else {
      setSubjectSemesters([]);
    }
  }, [subjectForm.year_id, fetchSubjectSemesters]);

  useEffect(() => {
    if (assignmentForm.year_id) {
      fetchAssignmentSemesters(assignmentForm.year_id);
    } else {
      setAssignmentSemesters([]);
    }
  }, [assignmentForm.year_id, fetchAssignmentSemesters]);

  // Subject_Filters start.
  useEffect(() => {
  if (subjectFilters.year_id) {
    fetchSemesters(subjectFilters.year_id);
  } else {
    setSemesters([]);
  }
}, [subjectFilters.year_id, fetchSemesters]);
  // Subject filter done.
  
  useEffect(() => {
    fetchAvailableSubjects();
  }, [fetchAvailableSubjects]);

  useEffect(() => {
    fetchTeacherSubjects(assignmentForm.teacher_id);
  }, [assignmentForm.teacher_id, fetchTeacherSubjects]);

  useEffect(() => {
    if (activeTab === 'view-subjects') {
      fetchAllSubjects();
    } else if (activeTab === 'manage-users') {
      fetchStudents();
      fetchTeachers();
    } else if (activeTab === 'assign-subjects') {
      fetchTeachers();
      fetchAllAssignments();
    }
  }, [activeTab, fetchAllSubjects, fetchStudents, fetchTeachers, fetchAllAssignments]);

  // for edit purpose 
  useEffect(() => {
  if (editingStudent && editingStudent.year_id) {
    fetchSemesters(editingStudent.year_id).then(() => {
      // Semesters will be in the main 'semesters' state
    });
    // Or create a separate fetch just for editing:
    const fetchEditSemesters = async () => {
      try {
        const semestersData = await getSemesters(editingStudent.year_id);
        setEditStudentSemesters(semestersData.semesters);
      } catch (err) {
        console.error('Failed to load semesters for editing');
      }
    };
    fetchEditSemesters();
  }
}, [editingStudent?.year_id]);
    // For edit purpose

  const assignClassTeacher = async (data) => {
    const response = await fetch('http://127.0.0.1:8000/api/admin/assign-class-teacher/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Failed to assign class teacher');
    }
    return response.json();
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/';
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await addStudent(studentForm);
      setSuccessMessage(response.message || 'Student added successfully!');
      setStudentForm({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        prn_number: '',
        year_id: '',
        branch_id: '',
        semester_id: '',
        division_id: ''
      });
      setSemesters([]);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (teacherForm.is_class_teacher) {
        if (!teacherForm.assigned_class_year || !teacherForm.assigned_class_branch || 
            !teacherForm.assigned_class_semester || !teacherForm.assigned_class_division) {
          setError('Please select Year, Branch, Semester, and Division for class teacher assignment');
          setLoading(false);
          return;
        }
      }

      const teacherData = {
        employee_id: teacherForm.employee_id,
        username: teacherForm.username || teacherForm.employee_id,
        first_name: teacherForm.first_name,
        last_name: teacherForm.last_name,
        email: teacherForm.email,
        password: teacherForm.password,
        department_id: teacherForm.department_id || null,
        is_class_teacher: teacherForm.is_class_teacher
      };

      const response = await addTeacher(teacherData);
      
      if (teacherForm.is_class_teacher && response.teacher_id) {
        try {
          await assignClassTeacher({
            teacher_id: response.teacher_id,
            year_id: parseInt(teacherForm.assigned_class_year),
            branch_id: parseInt(teacherForm.assigned_class_branch),
            semester_id: parseInt(teacherForm.assigned_class_semester),
            division_id: parseInt(teacherForm.assigned_class_division)
          });
          setSuccessMessage(`${response.message || 'Teacher added'} and assigned as class teacher successfully!`);
        } catch (classErr) {
          setSuccessMessage(`${response.message || 'Teacher added'} but class assignment failed. Please assign manually.`);
        }
      } else {
        setSuccessMessage(response.message || 'Teacher added successfully!');
      }

      setTeacherForm({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        employee_id: '',
        department_id: '',
        is_class_teacher: false,
        assigned_class_year: '',
        assigned_class_branch: '',
        assigned_class_semester: '',
        assigned_class_division: ''
      });
      setClassSemesters([]);
      fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await addSubject(subjectForm);
      setSuccessMessage(response.message || 'Subject added successfully!');
      setSubjectForm({
        code: '',
        name: '',
        year_id: '',
        branch_id: '',
        semester_id: '',
        division_id: '',
        credits: '4'
      });
      setSubjectSemesters([]);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add subject');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubject = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/assign-subject-to-teacher/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: parseInt(assignmentForm.teacher_id),
          subject_id: parseInt(assignmentForm.subject_id)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Subject assigned successfully!');
        setAssignmentForm({
          ...assignmentForm,
          subject_id: ''
        });
        fetchTeacherSubjects(assignmentForm.teacher_id);
        fetchAllAssignments();
      } else {
        setError(data.error || 'Failed to assign subject');
      }
    } catch (err) {
      setError('Failed to assign subject');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/remove-subject-assignment/${assignmentId}/`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Assignment removed successfully!');
        fetchTeacherSubjects(assignmentForm.teacher_id);
        fetchAllAssignments();
      } else {
        setError(data.error || 'Failed to remove assignment');
      }
    } catch (err) {
      setError('Failed to remove assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (studentId) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/students/${studentId}/update/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: editingStudent.first_name,
          last_name: editingStudent.last_name,
          email: editingStudent.email,
          year_id: editingStudent.year_id,
          branch_id: editingStudent.branch_id,
          semester_id: editingStudent.semester_id,
          division_id: editingStudent.division_id
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Student updated successfully!');
        setEditingStudent(null);
        fetchStudents();
      } else {
        setError(data.error || 'Failed to update student');
      }
    } catch (err) {
      setError('Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeacher = async (teacherId) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/teachers/${teacherId}/update/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: editingTeacher.first_name,
          last_name: editingTeacher.last_name,
          email: editingTeacher.email,
          department_id: editingTeacher.department_id
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Teacher updated successfully!');
        setEditingTeacher(null);
        fetchTeachers();
      } else {
        setError(data.error || 'Failed to update teacher');
      }
    } catch (err) {
      setError('Failed to update teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubject = async (subjectId) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/subjects/${subjectId}/update/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editingSubject.code,
          name: editingSubject.name,
          credits: editingSubject.credits,
          division_id: editingSubject.division_id || null
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Subject updated successfully!');
        setEditingSubject(null);
        fetchAllSubjects();
      } else {
        setError(data.error || 'Failed to update subject');
      }
    } catch (err) {
      setError('Failed to update subject');
    } finally {
      setLoading(false);
    }
  };


  const filteredSubjects = allSubjects.filter(subject => {
    const matchesYear = !subjectFilters.year_id || subject.year_id === parseInt(subjectFilters.year_id);
    const matchesBranch = !subjectFilters.branch_id || subject.branch_id === parseInt(subjectFilters.branch_id);
    const matchesSemester = !subjectFilters.semester_id || subject.semester_id === parseInt(subjectFilters.semester_id);
    const matchesDivision = !subjectFilters.division || 
      (subjectFilters.division === 'common' ? !subject.division : subject.division === subjectFilters.division);
    const matchesSearch = !subjectFilters.searchText || 
      subject.code.toLowerCase().includes(subjectFilters.searchText.toLowerCase()) ||
      subject.name.toLowerCase().includes(subjectFilters.searchText.toLowerCase());
    
    return matchesYear && matchesBranch && matchesSemester && matchesDivision && matchesSearch;
  });

  const filteredStudents = students.filter(student => {
    const matchesYear = !studentFilters.year || student.year === studentFilters.year;
    const matchesBranch = !studentFilters.branch || student.branch === studentFilters.branch;
    const matchesSemester = !studentFilters.semester || student.semester === studentFilters.semester;
    const matchesDivision = !studentFilters.division || student.division === studentFilters.division;
    const matchesSearch = !studentFilters.searchText || 
      student.prn_number.toLowerCase().includes(studentFilters.searchText.toLowerCase()) ||
      student.name.toLowerCase().includes(studentFilters.searchText.toLowerCase()) ||
      student.email.toLowerCase().includes(studentFilters.searchText.toLowerCase());
    
    return matchesYear && matchesBranch && matchesSemester && matchesDivision && matchesSearch;
  });

  const filteredTeachers = teachers.filter(teacher => {
    return !teacherSearchText || 
      teacher.employee_id.toLowerCase().includes(teacherSearchText.toLowerCase()) ||
      teacher.name.toLowerCase().includes(teacherSearchText.toLowerCase()) ||
      teacher.email.toLowerCase().includes(teacherSearchText.toLowerCase());
  });

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Administrator</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={activeTab === 'add-student' ? 'active' : ''}
          onClick={() => {
            setActiveTab('add-student');
            setError('');
            setSuccessMessage('');
          }}
        >
          Add Student
        </button>
        <button
          className={activeTab === 'add-teacher' ? 'active' : ''}
          onClick={() => {
            setActiveTab('add-teacher');
            setError('');
            setSuccessMessage('');
          }}
        >
          Add Teacher
        </button>
        <button
          className={activeTab === 'add-subject' ? 'active' : ''}
          onClick={() => {
            setActiveTab('add-subject');
            setError('');
            setSuccessMessage('');
          }}
        >
          Add Subject
        </button>
        <button
          className={activeTab === 'assign-subjects' ? 'active' : ''}
          onClick={() => {
            setActiveTab('assign-subjects');
            setError('');
            setSuccessMessage('');
          }}
        >
          Assign Subjects
        </button>
        <button
          className={activeTab === 'view-subjects' ? 'active' : ''}
          onClick={() => {
            setActiveTab('view-subjects');
            setError('');
            setSuccessMessage('');
          }}
        >
          View Subjects
        </button>
        <button
          className={activeTab === 'manage-users' ? 'active' : ''}
          onClick={() => {
            setActiveTab('manage-users');
            setError('');
            setSuccessMessage('');
          }}
        >
          Manage Users
        </button>
      </nav>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* ADD STUDENT TAB */}
        {activeTab === 'add-student' && (
          <div className="form-container">
            <h2>Add New Student</h2>
            <form onSubmit={handleAddStudent} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>PRN Number *</label>
                  <input
                    type="text"
                    value={studentForm.prn_number}
                    onChange={(e) => setStudentForm({...studentForm, prn_number: e.target.value})}
                    required
                    placeholder="Enter PRN (e.g., 2023CS004)"
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>
                    Student can login with this PRN
                  </small>
                </div>

                <div className="form-group">
                  <label>Username (Optional)</label>
                  <input
                    type="text"
                    value={studentForm.username}
                    onChange={(e) => setStudentForm({...studentForm, username: e.target.value})}
                    placeholder="Leave empty to use PRN"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={studentForm.first_name}
                    onChange={(e) => setStudentForm({...studentForm, first_name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={studentForm.last_name}
                    onChange={(e) => setStudentForm({...studentForm, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                    required
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year *</label>
                  <select
                    value={studentForm.year_id}
                    onChange={(e) => setStudentForm({...studentForm, year_id: e.target.value, semester_id: ''})}
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year.id} value={year.id}>{year.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Branch *</label>
                  <select
                    value={studentForm.branch_id}
                    onChange={(e) => setStudentForm({...studentForm, branch_id: e.target.value})}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Semester *</label>
                  <select
                    value={studentForm.semester_id}
                    onChange={(e) => setStudentForm({...studentForm, semester_id: e.target.value})}
                    required
                    disabled={!studentForm.year_id}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(sem => (
                      <option key={sem.id} value={sem.id}>Semester {sem.number}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Division *</label>
                  <select
                    value={studentForm.division_id}
                    onChange={(e) => setStudentForm({...studentForm, division_id: e.target.value})}
                    required
                  >
                    <option value="">Select Division</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.id}>Division {div.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Student'}
              </button>
            </form>
          </div>
        )}

        {/* ADD TEACHER TAB */}
        {activeTab === 'add-teacher' && (
          <div className="form-container">
            <h2>Add New Teacher</h2>
            <form onSubmit={handleAddTeacher} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    value={teacherForm.employee_id}
                    onChange={(e) => setTeacherForm({...teacherForm, employee_id: e.target.value})}
                    required
                    placeholder="Enter Employee ID"
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>
                    Teacher can login with this Employee ID
                  </small>
                </div>

                <div className="form-group">
                  <label>Username (Optional)</label>
                  <input
                    type="text"
                    value={teacherForm.username}
                    onChange={(e) => setTeacherForm({...teacherForm, username: e.target.value})}
                    placeholder="Leave empty to use Employee ID"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={teacherForm.first_name}
                    onChange={(e) => setTeacherForm({...teacherForm, first_name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={teacherForm.last_name}
                    onChange={(e) => setTeacherForm({...teacherForm, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})}
                    required
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department ID (Optional)</label>
                  <input
                    type="text"
                    value={teacherForm.department_id}
                    onChange={(e) => setTeacherForm({...teacherForm, department_id: e.target.value})}
                    placeholder="Enter Department ID"
                  />
                </div>

                <div className="form-group">
                  <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input
                      type="checkbox"
                      checked={teacherForm.is_class_teacher}
                      onChange={(e) => setTeacherForm({...teacherForm, is_class_teacher: e.target.checked})}
                    />
                    Is Class Teacher
                  </label>
                </div>
              </div>

              {teacherForm.is_class_teacher && (
                <>
                  <h3 style={{marginTop: '20px', marginBottom: '10px'}}>Class Assignment</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Year *</label>
                      <select
                        value={teacherForm.assigned_class_year}
                        onChange={(e) => setTeacherForm({
                          ...teacherForm, 
                          assigned_class_year: e.target.value,
                          assigned_class_semester: ''
                        })}
                        required={teacherForm.is_class_teacher}
                      >
                        <option value="">Select Year</option>
                        {years.map(year => (
                          <option key={year.id} value={year.id}>{year.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Branch *</label>
                      <select
                        value={teacherForm.assigned_class_branch}
                        onChange={(e) => setTeacherForm({...teacherForm, assigned_class_branch: e.target.value})}
                        required={teacherForm.is_class_teacher}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Semester *</label>
                      <select
                        value={teacherForm.assigned_class_semester}
                        onChange={(e) => setTeacherForm({...teacherForm, assigned_class_semester: e.target.value})}
                        required={teacherForm.is_class_teacher}
                        disabled={!teacherForm.assigned_class_year}
                      >
                        <option value="">Select Semester</option>
                        {classSemesters.map(sem => (
                          <option key={sem.id} value={sem.id}>Semester {sem.number}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Division *</label>
                      <select
                        value={teacherForm.assigned_class_division}
                        onChange={(e) => setTeacherForm({...teacherForm, assigned_class_division: e.target.value})}
                        required={teacherForm.is_class_teacher}
                      >
                        <option value="">Select Division</option>
                        {divisions.map(div => (
                          <option key={div.id} value={div.id}>Division {div.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Teacher'}
              </button>
            </form>
          </div>
        )}

        {/* ADD SUBJECT TAB */}
        {activeTab === 'add-subject' && (
          <div className="form-container">
            <h2>Add New Subject</h2>
            <form onSubmit={handleAddSubject} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Subject Code *</label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})}
                    required
                    placeholder="e.g., CS101"
                  />
                </div>

                <div className="form-group">
                  <label>Subject Name *</label>
                  <input
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                    required
                    placeholder="e.g., Data Structures"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year *</label>
                  <select
                    value={subjectForm.year_id}
                    onChange={(e) => setSubjectForm({...subjectForm, year_id: e.target.value, semester_id: ''})}
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year.id} value={year.id}>{year.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Branch *</label>
                  <select
                    value={subjectForm.branch_id}
                    onChange={(e) => setSubjectForm({...subjectForm, branch_id: e.target.value})}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Semester *</label>
                  <select
                    value={subjectForm.semester_id}
                    onChange={(e) => setSubjectForm({...subjectForm, semester_id: e.target.value})}
                    required
                    disabled={!subjectForm.year_id}
                  >
                    <option value="">Select Semester</option>
                    {subjectSemesters.map(sem => (
                      <option key={sem.id} value={sem.id}>Semester {sem.number}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Division (Optional)</label>
                  <select
                    value={subjectForm.division_id}
                    onChange={(e) => setSubjectForm({...subjectForm, division_id: e.target.value})}
                  >
                    <option value="">Common (All Divisions)</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.id}>Division {div.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Credits *</label>
                  <input
                    type="number"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({...subjectForm, credits: e.target.value})}
                    required
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Subject'}
              </button>
            </form>
          </div>
        )}

        {/* ASSIGN SUBJECTS TAB */}
        {activeTab === 'assign-subjects' && (
          <div className="form-container">
            <h2>Assign Subject to Teacher</h2>
            <form onSubmit={handleAssignSubject} className="admin-form">
              <div className="form-group">
                <label>Select Teacher *</label>
                <select
                  value={assignmentForm.teacher_id}
                  onChange={(e) => setAssignmentForm({...assignmentForm, teacher_id: e.target.value})}
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.employee_id} - {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year *</label>
                  <select
                    value={assignmentForm.year_id}
                    onChange={(e) => setAssignmentForm({
                      ...assignmentForm, 
                      year_id: e.target.value,
                      semester_id: '',
                      subject_id: ''
                    })}
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year.id} value={year.id}>{year.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Branch *</label>
                  <select
                    value={assignmentForm.branch_id}
                    onChange={(e) => setAssignmentForm({...assignmentForm, branch_id: e.target.value, subject_id: ''})}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Semester *</label>
                  <select
                    value={assignmentForm.semester_id}
                    onChange={(e) => setAssignmentForm({...assignmentForm, semester_id: e.target.value, subject_id: ''})}
                    required
                    disabled={!assignmentForm.year_id}
                  >
                    <option value="">Select Semester</option>
                    {assignmentSemesters.map(sem => (
                      <option key={sem.id} value={sem.id}>Semester {sem.number}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Division (Optional)</label>
                  <select
                    value={assignmentForm.division_id}
                    onChange={(e) => setAssignmentForm({...assignmentForm, division_id: e.target.value, subject_id: ''})}
                  >
                    <option value="">All Divisions</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.id}>Division {div.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Select Subject *</label>
                <select
                  value={assignmentForm.subject_id}
                  onChange={(e) => setAssignmentForm({...assignmentForm, subject_id: e.target.value})}
                  required
                  disabled={!assignmentForm.year_id || !assignmentForm.branch_id || !assignmentForm.semester_id}
                >
                  <option value="">Select Subject</option>
                  {availableSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name} {subject.division ? `(Div ${subject.division})` : '(Common)'}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Subject'}
              </button>
            </form>

            {assignmentForm.teacher_id && selectedTeacherAssignments.length > 0 && (
              <div style={{marginTop: '30px'}}>
                <h3>Current Assignments for Selected Teacher</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Year</th>
                      <th>Branch</th>
                      <th>Semester</th>
                      <th>Division</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTeacherAssignments.map(assignment => (
                      <tr key={assignment.id}>
                        <td>{assignment.subject_code}</td>
                        <td>{assignment.subject_name}</td>
                        <td>{assignment.year}</td>
                        <td>{assignment.branch}</td>
                        <td>{assignment.semester}</td>
                        <td>{assignment.division || 'Common'}</td>
                        <td>
                          <button
                            onClick={() => handleRemoveAssignment(assignment.id)}
                            className="btn-danger"
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{marginTop: '30px'}}>
              <h3>All Teacher-Subject Assignments</h3>
              {allAssignments.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Teacher</th>
                      <th>Employee ID</th>
                      <th>Subject</th>
                      <th>Code</th>
                      <th>Year</th>
                      <th>Branch</th>
                      <th>Semester</th>
                      <th>Division</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAssignments.map(assignment => (
                      <tr key={assignment.id}>
                        <td>{assignment.teacher_name}</td>
                        <td>{assignment.teacher_employee_id}</td>
                        <td>{assignment.subject_name}</td>
                        <td>{assignment.subject_code}</td>
                        <td>{assignment.year}</td>
                        <td>{assignment.branch}</td>
                        <td>{assignment.semester}</td>
                        <td>{assignment.division || 'Common'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No assignments found.</p>
              )}
            </div>
          </div>
        )}

        {/* VIEW SUBJECTS TAB */}
        {activeTab === 'view-subjects' && (
          <div className="form-container">
            <h2>All Subjects</h2>
            
            <div className="filters-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Search</label>
                  <input
                    type="text"
                    placeholder="Search by code or name..."
                    value={subjectFilters.searchText}
                    onChange={(e) => setSubjectFilters({...subjectFilters, searchText: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Year</label>
                  <select
                    value={subjectFilters.year_id}
                    onChange={(e) => setSubjectFilters({...subjectFilters, year_id: e.target.value, semester_id: ''})}
                  >
                    <option value="">All Years</option>
                    {years.map(year => (
                      <option key={year.id} value={year.id}>{year.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Branch</label>
                  <select
                    value={subjectFilters.branch_id}
                    onChange={(e) => setSubjectFilters({...subjectFilters, branch_id: e.target.value})}
                  >
                    <option value="">All Branches</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Semester</label>
                  <select
                    value={subjectFilters.semester_id}
                    onChange={(e) => setSubjectFilters({...subjectFilters, semester_id: e.target.value})}
                    disabled={!subjectFilters.year_id}
                  >
                    <option value="">All Semesters</option>
                    {semesters.map(sem => (
                      <option key={sem.id} value={sem.id}>Semester {sem.number}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Division</label>
                  <select
                    value={subjectFilters.division}
                    onChange={(e) => setSubjectFilters({...subjectFilters, division: e.target.value})}
                  >
                    <option value="">All</option>
                    <option value="common">Common Subjects</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.name}>Division {div.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <button 
                    onClick={() => setSubjectFilters({
                      year_id: '',
                      branch_id: '',
                      semester_id: '',
                      division: '',
                      searchText: ''
                    })}
                    className="btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <p>Loading subjects...</p>
            ) : filteredSubjects.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Year</th>
                    <th>Branch</th>
                    <th>Semester</th>
                    <th>Division</th>
                    <th>Credits</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map(subject => (
                    <tr key={subject.id}>
                      {editingSubject && editingSubject.id === subject.id ? (
                        <>
                          <td>
                            <input
                              type="text"
                              value={editingSubject.code}
                              onChange={(e) => setEditingSubject({...editingSubject, code: e.target.value})}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editingSubject.name}
                              onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})}
                            />
                          </td>
                          <td>{subject.year}</td>
                          <td>{subject.branch}</td>
                          <td>{subject.semester}</td>
                          <td>
                            <select
                              value={editingSubject.division_id || ''}
                              onChange={(e) => setEditingSubject({...editingSubject, division_id: e.target.value})}
                            >
                              <option value="">Common</option>
                              {divisions.map(div => (
                                <option key={div.id} value={div.id}>Div {div.name}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              value={editingSubject.credits}
                              onChange={(e) => setEditingSubject({...editingSubject, credits: e.target.value})}
                              min="1"
                              max="10"
                              style={{width: '60px'}}
                            />
                          </td>
                          <td>
                            <button onClick={() => handleUpdateSubject(subject.id)} className="btn-primary">
                              Save
                            </button>
                            <button onClick={() => setEditingSubject(null)} className="btn-secondary">
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{subject.code}</td>
                          <td>{subject.name}</td>
                          <td>{subject.year}</td>
                          <td>{subject.branch}</td>
                          <td>{subject.semester}</td>
                          <td>{subject.division || 'Common'}</td>
                          <td>{subject.credits}</td>
                          <td>
                            <button 
                              onClick={() => setEditingSubject({
                                id: subject.id,
                                code: subject.code,
                                name: subject.name,
                                credits: subject.credits,
                                division_id: subject.division_id || ''
                              })} 
                              className="btn-secondary"
                            >
                              Edit
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No subjects found.</p>
            )}
          </div>
        )}

        {/* MANAGE USERS TAB */}
        {activeTab === 'manage-users' && (
          <div className="form-container">
            <h2>Manage Students</h2>
            
            <div className="filters-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Search</label>
                  <input
                    type="text"
                    placeholder="Search by PRN, name, or email..."
                    value={studentFilters.searchText}
                    onChange={(e) => setStudentFilters({...studentFilters, searchText: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Year</label>
                  <select
                    value={studentFilters.year}
                    onChange={(e) => setStudentFilters({...studentFilters, year: e.target.value})}
                  >
                    <option value="">All Years</option>
                    {years.map(year => (
                      <option key={year.id} value={year.name}>{year.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Branch</label>
                  <select
                    value={studentFilters.branch}
                    onChange={(e) => setStudentFilters({...studentFilters, branch: e.target.value})}
                  >
                    <option value="">All Branches</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.name}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Semester</label>
                  <select
                    value={studentFilters.semester}
                    onChange={(e) => setStudentFilters({...studentFilters, semester: e.target.value})}
                  >
                    <option value="">All Semesters</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Division</label>
                  <select
                    value={studentFilters.division}
                    onChange={(e) => setStudentFilters({...studentFilters, division: e.target.value})}
                  >
                    <option value="">All Divisions</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.name}>Division {div.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <button 
                    onClick={() => setStudentFilters({
                      year: '',
                      branch: '',
                      semester: '',
                      division: '',
                      searchText: ''
                    })}
                    className="btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {filteredStudents.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PRN</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Year</th>
                    <th>Branch</th>
                    <th>Semester</th>
                    <th>Division</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id}>
                      {editingStudent && editingStudent.id === student.id ? (
                        <>
                          <td>{student.prn_number}</td>
                          <td>
                            <input
                              type="text"
                              value={editingStudent.first_name}
                              onChange={(e) => setEditingStudent({...editingStudent, first_name: e.target.value})}
                              placeholder="First Name"
                            />
                            <input
                              type="text"
                              value={editingStudent.last_name}
                              onChange={(e) => setEditingStudent({...editingStudent, last_name: e.target.value})}
                              placeholder="Last Name"
                            />
                          </td>
                          <td>
                            <input
                              type="email"
                              value={editingStudent.email}
                              onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                            />
                          </td>
                          <td>
                            <select
                              value={editingStudent.year_id}
                              onChange={(e) => setEditingStudent({...editingStudent, year_id: e.target.value})}
                            >
                              {years.map(year => (
                                <option key={year.id} value={year.id}>{year.name}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              value={editingStudent.branch_id}
                              onChange={(e) => setEditingStudent({...editingStudent, branch_id: e.target.value})}
                            >
                              {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                              ))}
                            </select>
                          </td>




                          <td>
                            <select
                              value={editingStudent.semester_id}
                              onChange={(e) => setEditingStudent({...editingStudent, semester_id: e.target.value})}
                            >
                              {(editStudentSemesters.length > 0 ? editStudentSemesters : semesters).map(sem => (
                                <option key={sem.id} value={sem.id}>Sem {sem.number}</option>
                              ))}
                            </select>
                          </td>
                        


                        
                          <td>
                            <select
                              value={editingStudent.division_id}
                              onChange={(e) => setEditingStudent({...editingStudent, division_id: e.target.value})}
                            >
                              {divisions.map(div => (
                                <option key={div.id} value={div.id}>{div.name}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button onClick={() => handleUpdateStudent(student.id)} className="btn-primary">
                              Save
                            </button>
                            <button onClick={() => setEditingStudent(null)} className="btn-secondary">
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{student.prn_number}</td>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>{student.year}</td>
                          <td>{student.branch}</td>
                          <td>{student.semester}</td>
                          <td>{student.division}</td>
                          <td>
                            <button 
                              onClick={() => setEditingStudent({
                                id: student.id,
                                first_name: student.name.split(' ')[0],
                                last_name: student.name.split(' ').slice(1).join(' '),
                                email: student.email,
                                year_id: student.year_id,
                                branch_id: student.branch_id,
                                semester_id: student.semester_id,
                                division_id: student.division_id
                              })} 
                              className="btn-secondary"
                            >
                              Edit
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No students found.</p>
            )}

            <h2 style={{marginTop: '40px'}}>Manage Teachers</h2>
            
            <div className="filters-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Search</label>
                  <input
                    type="text"
                    placeholder="Search by Employee ID, name, or email..."
                    value={teacherSearchText}
                    onChange={(e) => setTeacherSearchText(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <button 
                    onClick={() => setTeacherSearchText('')}
                    className="btn-secondary"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            </div>

            {filteredTeachers.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Class Teacher</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map(teacher => (
                    <tr key={teacher.id}>
                      {editingTeacher && editingTeacher.id === teacher.id ? (
                        <>
                          <td>{teacher.employee_id}</td>
                          <td>
                            <input
                              type="text"
                              value={editingTeacher.first_name}
                              onChange={(e) => setEditingTeacher({...editingTeacher, first_name: e.target.value})}
                              placeholder="First Name"
                            />
                            <input
                              type="text"
                              value={editingTeacher.last_name}
                              onChange={(e) => setEditingTeacher({...editingTeacher, last_name: e.target.value})}
                              placeholder="Last Name"
                            />
                          </td>
                          <td>
                            <input
                              type="email"
                              value={editingTeacher.email}
                              onChange={(e) => setEditingTeacher({...editingTeacher, email: e.target.value})}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editingTeacher.department_id || ''}
                              onChange={(e) => setEditingTeacher({...editingTeacher, department_id: e.target.value})}
                              placeholder="Department ID"
                            />
                          </td>
                          <td>{teacher.is_class_teacher ? 'Yes' : 'No'}</td>
                          <td>
                            <button onClick={() => handleUpdateTeacher(teacher.id)} className="btn-primary">
                              Save
                            </button>
                            <button onClick={() => setEditingTeacher(null)} className="btn-secondary">
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{teacher.employee_id}</td>
                          <td>{teacher.name}</td>
                          <td>{teacher.email}</td>
                          <td>{teacher.department_id || 'N/A'}</td>
                          <td>{teacher.is_class_teacher ? 'Yes' : 'No'}</td>
                          <td>
                            <button 
                              onClick={() => setEditingTeacher({
                                id: teacher.id,
                                first_name: teacher.name.split(' ')[0],
                                last_name: teacher.name.split(' ').slice(1).join(' '),
                                email: teacher.email,
                                department_id: teacher.department_id || ''
                              })} 
                              className="btn-secondary"
                            >
                              Edit
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No teachers found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
