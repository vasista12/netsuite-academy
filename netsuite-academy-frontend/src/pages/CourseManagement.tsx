import React, { useEffect, useState } from "react";
import api from "../services/api";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  passing_score: number;
  is_published: boolean;
  created_by?: number;
}

interface CourseManagementProps {
  onBack: () => void;
}

function CourseManagement({ onBack }: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [passingScore, setPassingScore] = useState(70);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/courses");

      setCourses(response.data);
    } catch (err: any) {
      console.error("COURSES ERROR:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load courses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setPassingScore(70);
    setEditingCourse(null);
    setShowForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");

      await api.post("/courses", {
        title,
        description,
        category,
        passing_score: Number(passingScore),
      });

      resetForm();
      await loadCourses();
    } catch (err: any) {
      console.error("CREATE COURSE ERROR:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to create course"
      );
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCourse) return;

    try {
      setError("");

      await api.put(`/courses/${editingCourse.id}`, {
        title,
        description,
        category,
        passing_score: Number(passingScore),
      });

      resetForm();
      await loadCourses();
    } catch (err: any) {
      console.error("UPDATE COURSE ERROR:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to update course"
      );
    }
  };

  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setCategory(course.category);
    setPassingScore(course.passing_score);
    setShowForm(true);
  };

  const handlePublish = async (courseId: number) => {
    try {
      setError("");

      await api.patch(`/courses/${courseId}/publish`);

      await loadCourses();
    } catch (err: any) {
      console.error("PUBLISH COURSE ERROR:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to publish course"
      );
    }
  };

  const handleDelete = async (courseId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/courses/${courseId}`);

      await loadCourses();
    } catch (err: any) {
      console.error("DELETE COURSE ERROR:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to delete course"
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#1f4e79",
          color: "white",
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            NetSuite Academy
          </h1>

          <p style={{ margin: "5px 0 0", opacity: 0.85 }}>
            Course Management
          </p>
        </div>

        <button
          onClick={onBack}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            background: "white",
            color: "#1f4e79",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Back to Dashboard
        </button>
      </header>

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px",
        }}
      >
        {/* Page heading */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              Courses
            </h2>

            <p style={{ color: "#6b7280" }}>
              Create, edit, publish and manage academy courses.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              background: "#1f4e79",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            + Create Course
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* Create/Edit form */}
        {showForm && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "14px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
              marginBottom: "30px",
            }}
          >
            <h2>
              {editingCourse
                ? "Edit Course"
                : "Create New Course"}
            </h2>

            <form
              onSubmit={
                editingCourse
                  ? handleUpdate
                  : handleCreate
              }
            >
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "7px",
                }}
              >
                Course Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="NetSuite Fundamentals"
                style={inputStyle}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginTop: "18px",
                  marginBottom: "7px",
                }}
              >
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                required
                placeholder="Introduction to NetSuite ERP..."
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginTop: "18px",
                  marginBottom: "7px",
                }}
              >
                Category
              </label>

              <input
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                required
                placeholder="ERP Fundamentals"
                style={inputStyle}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginTop: "18px",
                  marginBottom: "7px",
                }}
              >
                Passing Score
              </label>

              <input
                type="number"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) =>
                  setPassingScore(Number(e.target.value))
                }
                required
                style={inputStyle}
              />

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "25px",
                }}
              >
                <button
                  type="submit"
                  style={primaryButton}
                >
                  {editingCourse
                    ? "Save Changes"
                    : "Create Course"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  style={secondaryButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courses */}
        {loading ? (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "14px",
              textAlign: "center",
            }}
          >
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "50px",
              borderRadius: "14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "50px" }}>
              📚
            </div>

            <h3>No courses yet</h3>

            <p style={{ color: "#6b7280" }}>
              Create your first academy course.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {courses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  padding: "25px",
                  boxShadow:
                    "0 4px 15px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "20px",
                      background: course.is_published
                        ? "#dcfce7"
                        : "#fef3c7",
                      color: course.is_published
                        ? "#166534"
                        : "#92400e",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {course.is_published
                      ? "PUBLISHED"
                      : "DRAFT"}
                  </span>

                  <span
                    style={{
                      color: "#6b7280",
                      fontSize: "13px",
                    }}
                  >
                    #{course.id}
                  </span>
                </div>

                <h3
                  style={{
                    margin: "0 0 10px",
                    fontSize: "21px",
                  }}
                >
                  {course.title}
                </h3>

                <p
                  style={{
                    color: "#6b7280",
                    lineHeight: 1.5,
                    minHeight: "50px",
                  }}
                >
                  {course.description}
                </p>

                <p>
                  <strong>Category:</strong>{" "}
                  {course.category}
                </p>

                <p>
                  <strong>Passing Score:</strong>{" "}
                  {course.passing_score}%
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    onClick={() => startEdit(course)}
                    style={smallButton}
                  >
                    Edit
                  </button>

                  {!course.is_published && (
                    <button
                      onClick={() =>
                        handlePublish(course.id)
                      }
                      style={{
                        ...smallButton,
                        background: "#16a34a",
                        color: "white",
                      }}
                    >
                      Publish
                    </button>
                  )}

                  <button
                    onClick={() =>
                      handleDelete(course.id)
                    }
                    style={{
                      ...smallButton,
                      background: "#dc2626",
                      color: "white",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
};

const primaryButton: React.CSSProperties = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "8px",
  background: "#1f4e79",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  padding: "12px 20px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "white",
  color: "#374151",
  fontWeight: "bold",
  cursor: "pointer",
};

const smallButton: React.CSSProperties = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "7px",
  background: "#e5e7eb",
  color: "#1f2937",
  fontWeight: "bold",
  cursor: "pointer",
};

export default CourseManagement;