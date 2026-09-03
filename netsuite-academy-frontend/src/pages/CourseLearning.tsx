import React, { useEffect, useState } from "react";
import api from "../services/api";

interface CourseLearningProps {
  course: {
    id: number;
    title: string;
    description: string;
    category: string;
    passing_score: number;
  };
  onBack: () => void;
  onTakeQuiz: (quiz: any) => void;
}

interface Module {
  id: number;
  course_id: number;
  title: string;
  content: string;
  video_url: string;
  module_type: string;
  sort_order: number;
}

interface Quiz {
  id: number;
  course_id: number;
  title: string;
  passing_score: number;
}

function CourseLearning({
  course,
  onBack,
  onTakeQuiz,
}: CourseLearningProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizError, setQuizError] = useState("");

  const loadModules = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/modules/course/${course.id}`
      );

      setModules(response.data);
    } catch (err: any) {
      console.error("MODULES ERROR:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load course modules"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async () => {
    try {
      setQuizLoading(true);
      setQuizError("");

      const response = await api.get(
        `/quizzes/course/${course.id}`
      );

      setQuizzes(response.data);
    } catch (err: any) {
      console.error("QUIZZES ERROR:", err);

      setQuizError(
        err.response?.data?.detail ||
          "Unable to load quizzes"
      );
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
    loadQuizzes();
  }, [course.id]);

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
            Course Learning
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
          ← Back to Courses
        </button>
      </header>

      {/* MAIN */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px",
        }}
      >
        {/* COURSE INTRO */}
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
          <div
            style={{
              color: "#1f4e79",
              fontSize: "13px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            {course.category || "NetSuite Training"}
          </div>

          <h2
            style={{
              margin: "0 0 12px",
              color: "#1f2937",
              fontSize: "30px",
            }}
          >
            {course.title}
          </h2>

          <p
            style={{
              margin: "0 0 20px",
              color: "#6b7280",
              lineHeight: 1.6,
              fontSize: "16px",
            }}
          >
            {course.description}
          </p>

          <div
            style={{
              display: "inline-block",
              background: "#e8f1f8",
              color: "#1f4e79",
              padding: "8px 14px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Passing Score: {course.passing_score}%
          </div>
        </section>

        {/* MODULE HEADER */}
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#1f2937",
            }}
          >
            Course Modules
          </h2>

          <p
            style={{
              color: "#6b7280",
              marginTop: "6px",
            }}
          >
            Complete the modules below to learn the
            course material.
          </p>
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
            Loading modules...
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

        {/* NO MODULES */}
        {!loading &&
          !error &&
          modules.length === 0 && (
            <div
              style={{
                background: "white",
                padding: "50px",
                borderRadius: "14px",
                textAlign: "center",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  fontSize: "45px",
                  marginBottom: "15px",
                }}
              >
                📖
              </div>

              <h3
                style={{
                  color: "#1f2937",
                  marginBottom: "8px",
                }}
              >
                No modules available
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                Course content will appear here once
                modules are added.
              </p>
            </div>
          )}

        {/* MODULES */}
        {!loading && modules.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              marginBottom: "35px",
            }}
          >
            {modules
              .slice()
              .sort(
                (a, b) =>
                  a.sort_order - b.sort_order
              )
              .map((module, index) => (
                <div
                  key={module.id}
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
                      alignItems: "center",
                      gap: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        background: "#1f4e79",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginBottom: "3px",
                        }}
                      >
                        MODULE {index + 1}
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          color: "#1f2937",
                          fontSize: "21px",
                        }}
                      >
                        {module.title}
                      </h3>
                    </div>
                  </div>

                  <div
                    style={{
                      color: "#4b5563",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {module.content}
                  </div>

                  {module.video_url && (
                    <div
                      style={{
                        marginTop: "20px",
                      }}
                    >
                      <a
                        href={module.video_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-block",
                          padding: "10px 16px",
                          borderRadius: "8px",
                          background: "#1f4e79",
                          color: "white",
                          textDecoration: "none",
                          fontWeight: "bold",
                        }}
                      >
                        ▶ Watch Video
                      </a>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* QUIZ SECTION */}
        <section
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: "#1f4e79",
                  fontSize: "13px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                FINAL ASSESSMENT
              </div>

              <h2
                style={{
                  margin: "0 0 8px",
                  color: "#1f2937",
                }}
              >
                Course Quiz
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                Test your knowledge after completing
                the course modules.
              </p>
            </div>
          </div>

          {quizLoading && (
            <div
              style={{
                marginTop: "25px",
                color: "#6b7280",
              }}
            >
              Loading quiz...
            </div>
          )}

          {quizError && (
            <div
              style={{
                marginTop: "25px",
                background: "#fee2e2",
                color: "#b91c1c",
                padding: "15px",
                borderRadius: "10px",
              }}
            >
              {quizError}
            </div>
          )}

          {!quizLoading &&
            !quizError &&
            quizzes.length === 0 && (
              <div
                style={{
                  marginTop: "25px",
                  color: "#6b7280",
                }}
              >
                No quiz is available for this course yet.
              </div>
            )}

          {!quizLoading &&
            !quizError &&
            quizzes.length > 0 && (
              <div
                style={{
                  marginTop: "25px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: "0 0 6px",
                          color: "#1f2937",
                        }}
                      >
                        {quiz.title}
                      </h3>

                      <span
                        style={{
                          fontSize: "13px",
                          color: "#6b7280",
                        }}
                      >
                        Passing score:{" "}
                        <strong>
                          {quiz.passing_score}%
                        </strong>
                      </span>
                    </div>

                    <button
                      onClick={() => onTakeQuiz(quiz)}
                      style={{
                        padding: "12px 22px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#1f4e79",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Take Quiz →
                    </button>
                  </div>
                ))}
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default CourseLearning;