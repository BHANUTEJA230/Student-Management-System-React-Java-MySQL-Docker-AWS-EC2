import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "/api/students";
const HEALTH_API = import.meta.env.VITE_HEALTH_URL || "/api/health";

const INITIAL_FORM_STATE = {
  studentId: "",
  name: "",
  email: "",
  department: "",
  course: "",
  yearOfStudy: "1",
};

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking"); // 'connected', 'error', 'checking'

  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [viewStudent, setViewStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Check backend health
  const checkHealth = useCallback(async () => {
    try {
      await axios.get(HEALTH_API);
      setBackendStatus("connected");
    } catch {
      setBackendStatus("error");
    }
  }, []);

  // Fetch all students or perform search
  const loadStudents = useCallback(async (query = "") => {
    try {
      setLoading(true);
      let res;
      if (query.trim()) {
        setIsSearching(true);
        res = await axios.get(`${API_BASE}/search`, {
          params: { query: query.trim() },
        });
      } else {
        setIsSearching(false);
        res = await axios.get(API_BASE);
      }
      setStudents(res.data);
      setBackendStatus("connected");
    } catch (err) {
      console.error("API error:", err);
      setBackendStatus("error");
      showNotification(
        "error",
        err.response?.data?.message || "Cannot connect to backend API. Please ensure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    loadStudents();
  }, [checkHealth, loadStudents]);

  // Handle Search input with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, loadStudents]);

  // Client-side form validation
  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) {
      errors.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address (e.g. user@domain.com)";
    }

    if (!form.department.trim()) {
      errors.department = "Department is required";
    }

    if (!form.course.trim()) {
      errors.course = "Course or degree is required";
    }

    const yearNum = parseInt(form.yearOfStudy, 10);
    if (!yearNum || yearNum < 1 || yearNum > 6) {
      errors.yearOfStudy = "Year of study must be between 1 and 6";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        studentId: form.studentId.trim() || undefined,
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        course: form.course.trim(),
        yearOfStudy: parseInt(form.yearOfStudy, 10),
      };

      if (editingId !== null) {
        await axios.put(`${API_BASE}/${editingId}`, payload);
        showNotification("success", `Student '${payload.name}' updated successfully!`);
      } else {
        const res = await axios.post(API_BASE, payload);
        showNotification("success", `Student '${res.data.name}' registered with ID: ${res.data.studentId}!`);
      }

      setForm(INITIAL_FORM_STATE);
      setEditingId(null);
      setFormErrors({});
      await loadStudents(searchQuery);
    } catch (err) {
      console.error("Submission error:", err);
      const serverMessage = err.response?.data?.message || err.response?.data?.errors
        ? Object.values(err.response?.data?.errors || {}).join(", ")
        : "Failed to save student record.";
      showNotification("error", serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (student) => {
    setForm({
      studentId: student.studentId || "",
      name: student.name || "",
      email: student.email || "",
      department: student.department || "",
      course: student.course || "",
      yearOfStudy: String(student.yearOfStudy || 1),
    });
    setEditingId(student.id);
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(INITIAL_FORM_STATE);
    setFormErrors({});
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(`${API_BASE}/${deleteTarget.id}`);
      showNotification("success", `Student '${deleteTarget.name}' deleted successfully.`);
      setDeleteTarget(null);
      await loadStudents(searchQuery);
    } catch (err) {
      console.error("Delete error:", err);
      showNotification("error", "Failed to delete student. Please try again.");
    }
  };

  // Metrics
  const totalStudents = students.length;
  const uniqueDepts = new Set(students.map((s) => s.department)).size;
  const uniqueCourses = new Set(students.map((s) => s.course)).size;

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <span>{notification.message}</span>
          <button type="button" onClick={() => setNotification(null)} className="toast-close">
            ×
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <div className="logo-icon">🎓</div>
          <div>
            <h1>Student Management System</h1>
            <p className="subtitle">Enterprise Full-Stack Cloud Architecture</p>
          </div>
        </div>
        <div className="navbar-status">
          <span className={`status-pill ${backendStatus}`}>
            <span className="status-dot"></span>
            {backendStatus === "connected" && "Backend Connected"}
            {backendStatus === "error" && "Backend Disconnected"}
            {backendStatus === "checking" && "Connecting..."}
          </span>
        </div>
      </header>

      <main className="main-content">
        {/* Analytics Summary Cards */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">Total Registered Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{uniqueDepts}</div>
            <div className="stat-label">Academic Departments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{uniqueCourses}</div>
            <div className="stat-label">Programs / Degrees</div>
          </div>
        </section>

        {/* Add/Edit Student Form Card */}
        <section className="card form-section">
          <div className="card-header">
            <h2>{editingId !== null ? "✏️ Edit Student Profile" : "➕ Register New Student"}</h2>
            <p className="card-desc">
              {editingId !== null
                ? "Update student information below and click Save Changes."
                : "Enter student details to persist in MySQL database."}
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="student-form" noValidate>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="studentId">
                  Student ID / Roll No <span className="optional">(Optional)</span>
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  placeholder="e.g. STU-1001 (auto-generated if blank)"
                  value={form.studentId}
                  onChange={handleInputChange}
                  disabled={editingId !== null}
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={form.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? "input-error" : ""}
                />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. jane.doe@university.edu"
                  value={form.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? "input-error" : ""}
                />
                {formErrors.email && <span className="field-error">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="department">
                  Department <span className="required">*</span>
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="e.g. Computer Science & Engineering"
                  value={form.department}
                  onChange={handleInputChange}
                  className={formErrors.department ? "input-error" : ""}
                />
                {formErrors.department && <span className="field-error">{formErrors.department}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="course">
                  Course / Degree <span className="required">*</span>
                </label>
                <input
                  id="course"
                  name="course"
                  type="text"
                  placeholder="e.g. B.Tech AIML"
                  value={form.course}
                  onChange={handleInputChange}
                  className={formErrors.course ? "input-error" : ""}
                />
                {formErrors.course && <span className="field-error">{formErrors.course}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="yearOfStudy">
                  Year of Study <span className="required">*</span>
                </label>
                <select
                  id="yearOfStudy"
                  name="yearOfStudy"
                  value={form.yearOfStudy}
                  onChange={handleInputChange}
                  className={formErrors.yearOfStudy ? "input-error" : ""}
                >
                  <option value="1">1st Year (Freshman)</option>
                  <option value="2">2nd Year (Sophomore)</option>
                  <option value="3">3rd Year (Junior)</option>
                  <option value="4">4th Year (Senior)</option>
                  <option value="5">5th Year</option>
                  <option value="6">6th Year</option>
                </select>
                {formErrors.yearOfStudy && <span className="field-error">{formErrors.yearOfStudy}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : editingId !== null ? "💾 Save Changes" : "➕ Add Student"}
              </button>
              {editingId !== null && (
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Student Records List & Search */}
        <section className="card table-section">
          <div className="table-header">
            <div>
              <h2>📋 Student Directory ({students.length})</h2>
              <p className="card-desc">Search, review, inspect, and manage student records</p>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by ID, Name, Department, Course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="table-message">
                      <div className="loading-spinner"></div>
                      <span>Loading records from database...</span>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-message empty">
                      {isSearching
                        ? `No students found matching '${searchQuery}'.`
                        : "No student records found in the database. Use the form above to add a student."}
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <span className="badge-id">{student.studentId || `STU-${student.id}`}</span>
                      </td>
                      <td className="font-semibold">{student.name}</td>
                      <td>
                        <a href={`mailto:${student.email}`} className="email-link">
                          {student.email}
                        </a>
                      </td>
                      <td>
                        <span className="badge-dept">{student.department}</span>
                      </td>
                      <td>{student.course}</td>
                      <td>
                        <span className="year-pill">Year {student.yearOfStudy}</span>
                      </td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="btn-action btn-view"
                          onClick={() => setViewStudent(student)}
                          title="View Details"
                        >
                          👁️ View
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-edit"
                          onClick={() => startEdit(student)}
                          title="Edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-delete"
                          onClick={() => setDeleteTarget(student)}
                          title="Delete"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Student Management System • Spring Boot 17 + React 19 + MySQL + Docker + AWS EC2</p>
      </footer>

      {/* View Student Details Modal */}
      {viewStudent && (
        <div className="modal-overlay" onClick={() => setViewStudent(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Profile Details</h3>
              <button type="button" className="modal-close" onClick={() => setViewStudent(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-header">
                <div className="profile-avatar">
                  {viewStudent.name?.charAt(0).toUpperCase() || "S"}
                </div>
                <div>
                  <h4>{viewStudent.name}</h4>
                  <span className="badge-id">{viewStudent.studentId || `STU-${viewStudent.id}`}</span>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Database ID</span>
                  <span className="detail-value">{viewStudent.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{viewStudent.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department</span>
                  <span className="detail-value">{viewStudent.department}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Course / Degree</span>
                  <span className="detail-value">{viewStudent.course}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Year of Study</span>
                  <span className="detail-value">Year {viewStudent.yearOfStudy}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  startEdit(viewStudent);
                  setViewStudent(null);
                }}
              >
                ✏️ Edit This Student
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setViewStudent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-card modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="danger-text">⚠️ Confirm Deletion</h3>
              <button type="button" className="modal-close" onClick={() => setDeleteTarget(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to permanently delete student{" "}
                <strong>{deleteTarget.name}</strong> (ID: {deleteTarget.studentId || deleteTarget.id})?
              </p>
              <p className="warning-note">This action will remove the record from the MySQL database and cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                🗑️ Yes, Delete Student
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
