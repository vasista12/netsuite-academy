import React, { useEffect, useState } from "react";
import api from "../services/api";
import CourseManagement from "./CourseManagement";
import QuizManagement from "./QuizManagement";

interface DashboardStats {
  total_courses: number;
  active_learners: number;
  avg_pass_rate: number;
  certificates_issued: number;
}

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCourses, setShowCourses] = useState(false);
  const [showQuizzes, setShowQuizzes] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/dashboard");

      setStats(response.data);
    } catch (err: any) {
      console.error("DASHBOARD ERROR:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Open Course Management
  if (showCourses) {
    return (
      <CourseManagement
        onBack={() => {
          setShowCourses(false);
          loadDashboard();
        }}
      />
    );
  }
  if (showQuizzes) {
  return (
    <QuizManagement
      onBack={() => {
        setShowQuizzes(false);
        loadDashboard();
      }}
    />
  );
}

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
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

          <p
            style={{
              margin: "5px 0 0",
              opacity: 0.85,
            }}
          >
            Administration Portal
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
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px",
        }}
      >
        {/* WELCOME */}
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ marginBottom: "8px" }}>
            Welcome, {user.full_name} 👋
          </h2>

          <p
            style={{
              color: "#6b7280",
              margin: 0,
            }}
          >
            Here's an overview of your academy.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            Loading dashboard...
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

        {/* DASHBOARD */}
        {stats && (
          <>
            {/* STATISTICS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
                marginBottom: "35px",
              }}
            >
              <StatCard
                title="Total Courses"
                value={stats.total_courses}
                icon="📚"
              />

              <StatCard
                title="Active Learners"
                value={stats.active_learners}
                icon="👨‍🎓"
              />

              <StatCard
                title="Average Pass Rate"
                value={`${stats.avg_pass_rate}%`}
                icon="📊"
              />

              <StatCard
                title="Certificates Issued"
                value={stats.certificates_issued}
                icon="🏆"
              />
            </div>

            {/* MANAGEMENT */}
            <h2 style={{ marginBottom: "20px" }}>
              Management
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {/* COURSE MANAGEMENT */}
              <ManagementCard
                icon="📚"
                title="Course Management"
                description="Create, edit and publish academy courses."
                onClick={() => setShowCourses(true)}
              />

              {/* QUIZ MANAGEMENT */}
             <ManagementCard
icon="📝"
  title="Quiz Management"
  description="Create quizzes and add assessment questions."
  onClick={() => setShowQuizzes(true)}
/>

              {/* LEARNERS */}
              <ManagementCard
  icon="👥"
  title="Learners"
  description="View registered learners and their roles."
  onClick={() => alert("Learners management coming next")}
/>

              {/* CERTIFICATES */}
              <ManagementCard
                icon="🏆"
                title="Certificates"
                description="Track certificates issued to learners."
              />
            </div>

            {/* REFRESH */}
            <div style={{ marginTop: "30px" }}>
              <button
                onClick={loadDashboard}
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
                Refresh Dashboard
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        padding: "25px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          fontSize: "30px",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#6b7280",
          fontSize: "14px",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: "#1f2937",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   MANAGEMENT CARD
============================================================ */
function ManagementCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <div
  onClick={onClick}
  style={{
    background: "white",
    padding: "25px",
    borderRadius: "14px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    cursor: onClick ? "pointer" : "default",
  }}
>
      <div
        style={{
          fontSize: "30px",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          margin: "0 0 8px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#6b7280",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default AdminDashboard;