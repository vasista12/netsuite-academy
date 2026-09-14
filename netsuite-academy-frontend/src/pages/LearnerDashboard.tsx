import React, { useEffect, useState } from "react";
import api from "../services/api";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  passing_score: number;
}

interface LearnerDashboardProps {
  user: any;
  onLogout: () => void;
  onStartCourse: (course: Course) => void;
}

function LearnerDashboard({
  user,
  onLogout,
  onStartCourse,
}: LearnerDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="app-shell"
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <header className="app-header"
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
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
            }}
          >
            NetSuite Academy
          </h1>

          <p
            style={{
              margin: "5px 0 0",
              opacity: 0.85,
            }}
          >
            Learner Portal
          </p>
        </div>

        <button
          onClick={onLogout}
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
          Logout
        </button>
      </header>

      {/* MAIN */}
      <main className="app-main"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px",
        }}
      >
        {/* WELCOME */}
        <section
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            marginBottom: "30px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 8px",
              color: "#1f2937",
            }}
          >
            Welcome, {user.full_name} 👋
          </h2>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            Continue your learning journey and
            master NetSuite ERP.
          </p>
        </section>

        {/* COURSE HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#1f2937",
              }}
            >
              Available Courses
            </h2>

            <p
              style={{
                color: "#6b7280",
                marginTop: "6px",
              }}
            >
              Explore courses and build your
              NetSuite skills.
            </p>
          </div>

          <button
            onClick={loadCourses}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              background: "#1f4e79",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "14px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Loading courses...
          </div>
        )}

        {/* ERROR */}
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

        {/* NO COURSES */}
        {!loading &&
          !error &&
          courses.length === 0 && (
            <div
              style={{
                background: "white",
                padding: "50px",
                borderRadius: "14px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <div
                style={{
                  fontSize: "45px",
                  marginBottom: "15px",
                }}
              >
                📚
              </div>

              <h3
                style={{
                  color: "#1f2937",
                  marginBottom: "8px",
                }}
              >
                No courses available
              </h3>

              <p style={{ margin: 0 }}>
                Published courses will appear here.
              </p>
            </div>
          )}

        {/* COURSE CARDS */}
        {!loading && courses.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "22px",
            }}
          >
            {courses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "25px",
                  boxShadow:
                    "0 4px 15px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "240px",
                }}
              >
                {/* COURSE ICON */}
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: "#e8f1f8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "27px",
                    marginBottom: "18px",
                  }}
                >
                  📚
                </div>

                {/* CATEGORY */}
                <div
                  style={{
                    color: "#1f4e79",
                    fontSize: "13px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  {course.category ||
                    "NetSuite Training"}
                </div>

                {/* TITLE */}
                <h3
                  style={{
                    margin: "0 0 10px",
                    color: "#1f2937",
                    fontSize: "20px",
                  }}
                >
                  {course.title}
                </h3>

                {/* DESCRIPTION */}
                <p
                  style={{
                    color: "#6b7280",
                    lineHeight: 1.5,
                    margin: "0 0 20px",
                    flex: 1,
                  }}
                >
                  {course.description ||
                    "Learn essential NetSuite concepts through interactive training."}
                </p>

                {/* FOOTER */}
                <div
                  style={{
                    borderTop:
                      "1px solid #e5e7eb",
                    paddingTop: "18px",
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Pass score:{" "}
                    <strong
                      style={{
                        color: "#1f2937",
                      }}
                    >
                      {course.passing_score}%
                    </strong>
                  </span>

                  {/* UPDATED START COURSE BUTTON */}
                  <button
                    onClick={() => onStartCourse(course)}
                    style={{
                      padding: "10px 18px",
                      border: "none",
                      borderRadius: "8px",
                      background: "#1f4e79",
                      color: "white",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Start Course →
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

export default LearnerDashboard;