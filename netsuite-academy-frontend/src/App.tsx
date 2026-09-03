import React, { useState } from "react";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import LearnerDashboard from "./pages/LearnerDashboard";
import CourseLearning from "./pages/CourseLearning";
import QuizPage from "./pages/QuizPage";

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
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  const handleLogin = (loggedInUser: any) => {
    setUser(loggedInUser);
    setSelectedCourse(null);
    setSelectedQuiz(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setSelectedCourse(null);
    setSelectedQuiz(null);
    setUser(null);
  };

  const handleStartCourse = (course: any) => {
    setSelectedCourse(course);
    setSelectedQuiz(null);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedQuiz(null);
  };

  const handleTakeQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
  };

  const handleBackToCourse = () => {
    setSelectedQuiz(null);
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

  // QUIZ PAGE
  if (selectedQuiz) {
    return (
      <QuizPage
        quizId={selectedQuiz.id}
        onBack={handleBackToCourse}
      />
    );
  }

  // COURSE LEARNING PAGE
  if (selectedCourse) {
    return (
      <CourseLearning
        course={selectedCourse}
        onBack={handleBackToCourses}
        onTakeQuiz={handleTakeQuiz}
      />
    );
  }

  // LEARNER DASHBOARD
  return (
    <LearnerDashboard
      user={user}
      onLogout={handleLogout}
      onStartCourse={handleStartCourse}
    />
  );
}

export default App;