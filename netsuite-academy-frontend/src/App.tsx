import React, { useState } from "react";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import LearnerDashboard from "./pages/LearnerDashboard";
import CourseLearning from "./pages/CourseLearning";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const handleLogin = (loggedInUser: any) => {
    setUser(loggedInUser);
    setSelectedCourse(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setSelectedCourse(null);
    setUser(null);
  };

  const handleStartCourse = (course: any) => {
    setSelectedCourse(course);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  // NOT LOGGED IN
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // ADMIN
  if (user.role === "admin") {
    return (
      <AdminDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // LEARNER / INSTRUCTOR
  if (selectedCourse) {
    return (
      <CourseLearning
        course={selectedCourse}
        onBack={handleBackToCourses}
      />
    );
  }

  return (
    <LearnerDashboard
      user={user}
      onLogout={handleLogout}
      onStartCourse={handleStartCourse}
    />
  );
}

export default App;