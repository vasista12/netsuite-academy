import React, { useEffect, useState } from "react";
import api from "../services/api";

interface QuizManagementProps {
  onBack: () => void;
}

interface Course {
  id: number;
  title: string;
}

interface Quiz {
  id: number;
  course_id: number;
  title: string;
  passing_score: number;
}

interface Question {
  id: number;
  quiz_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

function QuizManagement({ onBack }: QuizManagementProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(70);

  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");

  const [questions, setQuestions] = useState<Question[]>([]);

  const [editingQuestionId, setEditingQuestionId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD COURSES
  // =========================

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setError("");

      const response = await api.get("/courses");

      setCourses(response.data);

      if (response.data.length > 0 && selectedCourse === null) {
        setSelectedCourse(response.data[0].id);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to load courses"
      );
    }
  };

  // =========================
  // LOAD QUIZZES
  // =========================

  useEffect(() => {
    if (selectedCourse !== null) {
      loadQuizzes(selectedCourse);
    }
  }, [selectedCourse]);

  const loadQuizzes = async (courseId: number) => {
    try {
      setLoadingQuizzes(true);
      setError("");

      const response = await api.get(
        `/quizzes/course/${courseId}`
      );

      setQuizzes(response.data);

      setSelectedQuiz(null);
      setQuestions([]);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to load quizzes"
      );
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // =========================
  // CREATE QUIZ
  // =========================

  const createQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) {
      setError("Please select a course.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }

    if (passingScore < 0 || passingScore > 100) {
      setError("Passing score must be between 0 and 100.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post("/quizzes", {
        course_id: selectedCourse,
        title: title.trim(),
        passing_score: passingScore,
      });

      console.log("QUIZ CREATED:", response.data);

      setSuccess("Quiz created successfully!");

      setTitle("");
      setPassingScore(70);

      await loadQuizzes(selectedCourse);
    } catch (err: any) {
      console.error("QUIZ CREATE ERROR:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to create quiz"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // MANAGE QUIZ
  // =========================

  const manageQuiz = async (quiz: Quiz) => {
    try {
      setError("");
      setSuccess("");

      const response = await api.get(
        `/quizzes/${quiz.id}`
      );

      setSelectedQuiz(quiz);
      setQuestions(response.data.questions || []);

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    } catch (err: any) {
      console.error("LOAD QUIZ ERROR:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load quiz"
      );
    }
  };

  // =========================
  // DELETE QUIZ
  // =========================

  const deleteQuiz = async (quiz: Quiz) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${quiz.title}"?\n\nThis will also delete all questions inside this quiz. This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.delete(`/quizzes/${quiz.id}`);

      setSuccess("Quiz deleted successfully!");

      // If deleted quiz was selected, close management section
      if (selectedQuiz?.id === quiz.id) {
        setSelectedQuiz(null);
        setQuestions([]);
      }

      // Reload quiz list
      if (selectedCourse !== null) {
        await loadQuizzes(selectedCourse);
      }
    } catch (err: any) {
      console.error("DELETE QUIZ ERROR:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete quiz"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET QUESTION FORM
  // =========================

  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
  };

  // =========================
  // ADD / UPDATE QUESTION
  // =========================

  const saveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedQuiz) {
      setError("Please select a quiz first.");
      return;
    }

    if (!questionText.trim()) {
      setError("Please enter a question.");
      return;
    }

    if (
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim()
    ) {
      setError("Please fill in all four options.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = {
        question: questionText.trim(),
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        option_c: optionC.trim(),
        option_d: optionD.trim(),
        correct_answer: correctAnswer,
      };

      if (editingQuestionId !== null) {
        const response = await api.put(
          `/quizzes/${selectedQuiz.id}/questions/${editingQuestionId}`,
          data
        );

        setQuestions((prev) =>
          prev.map((question) =>
            question.id === editingQuestionId
              ? response.data
              : question
          )
        );

        setSuccess("Question updated successfully!");
      } else {
        const response = await api.post(
          `/quizzes/${selectedQuiz.id}/questions`,
          data
        );

        setQuestions((prev) => [
          ...prev,
          response.data,
        ]);

        setSuccess("Question added successfully!");
      }

      resetQuestionForm();
    } catch (err: any) {
      console.error("SAVE QUESTION ERROR:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to save question"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT QUESTION
  // =========================

  const editQuestion = (question: Question) => {
    setEditingQuestionId(question.id);

    setQuestionText(question.question);
    setOptionA(question.option_a);
    setOptionB(question.option_b);
    setOptionC(question.option_c);
    setOptionD(question.option_d);

    // GET /quizzes/{quiz_id} does not currently return
    // correct_answer for security reasons.
    // Default to A when editing.
    setCorrectAnswer("A");

    setError("");
    setSuccess("");

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE QUESTION
  // =========================

  const deleteQuestion = async (question: Question) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) {
      return;
    }

    if (!selectedQuiz) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.delete(
        `/quizzes/${selectedQuiz.id}/questions/${question.id}`
      );

      setQuestions((prev) =>
        prev.filter(
          (item) => item.id !== question.id
        )
      );

      if (editingQuestionId === question.id) {
        resetQuestionForm();
      }

      setSuccess("Question deleted successfully!");
    } catch (err: any) {
      console.error("DELETE QUESTION ERROR:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete question"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        color: "#111827",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          background: "#1f4e79",
          color: "white",
          padding: "22px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            Quiz Management
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              opacity: 0.85,
              fontSize: "15px",
            }}
          >
            Create assessments, manage questions,
            and configure correct answers.
          </p>
        </div>

        <button
          onClick={onBack}
          style={{
            padding: "11px 20px",
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
          padding: "35px 30px 60px",
        }}
      >
        {/* MESSAGES */}

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              padding: "14px 18px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              border: "1px solid #bbf7d0",
              padding: "14px 18px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            {success}
          </div>
        )}

        {/* CREATE QUIZ */}

        <section
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "30px",
            boxShadow:
              "0 4px 18px rgba(0,0,0,0.06)",
            marginBottom: "28px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
            }}
          >
            Create Quiz
          </h2>

          <p
            style={{
              color: "#64748b",
              marginTop: "7px",
            }}
          >
            Select a course and create an assessment.
          </p>

          <form onSubmit={createQuiz}>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Course
            </label>

            <select
              value={selectedCourse ?? ""}
              onChange={(e) =>
                setSelectedCourse(
                  e.target.value
                    ? Number(e.target.value)
                    : null
                )
              }
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "15px",
                background: "white",
              }}
            >
              <option value="">
                Select a course
              </option>

              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.title}
                </option>
              ))}
            </select>

            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Quiz Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="NetSuite Fundamentals Assessment"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "15px",
              }}
            />

            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
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
                setPassingScore(
                  Number(e.target.value)
                )
              }
              style={{
                width: "200px",
                boxSizing: "border-box",
                padding: "13px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
                marginBottom: "22px",
                fontSize: "15px",
              }}
            />

            <br />

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, #1f4e79, #2563eb)",
                color: "white",
                fontWeight: "bold",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Creating..."
                : "Create Quiz"}
            </button>
          </form>
        </section>

        {/* EXISTING QUIZZES */}

        <section
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "30px",
            boxShadow:
              "0 4px 18px rgba(0,0,0,0.06)",
            marginBottom: "28px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
            }}
          >
            Existing Quizzes
          </h2>

          <p
            style={{
              color: "#64748b",
              marginTop: "7px",
            }}
          >
            Select a quiz to manage its questions.
          </p>

          {loadingQuizzes ? (
            <div
              style={{
                padding: "25px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Loading quizzes...
            </div>
          ) : quizzes.length === 0 ? (
            <div
              style={{
                background: "#f8fafc",
                padding: "22px",
                borderRadius: "10px",
                color: "#64748b",
              }}
            >
              No quizzes have been created for this
              course yet.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "14px",
                marginTop: "18px",
              }}
            >
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  style={{
                    border:
                      selectedQuiz?.id === quiz.id
                        ? "2px solid #2563eb"
                        : "1px solid #dbe3ec",
                    borderRadius: "12px",
                    padding: "18px",
                    background:
                      selectedQuiz?.id === quiz.id
                        ? "#f8fbff"
                        : "white",
                  }}
                >
                  <h3
                    style={{
                      margin:
                        "0 0 10px",
                      fontSize: "17px",
                    }}
                  >
                    {quiz.title}
                  </h3>

                  <p
                    style={{
                      margin:
                        "0 0 15px",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Passing score:{" "}
                    {quiz.passing_score}%
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() =>
                        manageQuiz(quiz)
                      }
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "none",
                        borderRadius: "7px",
                        background:
                          "#1f4e79",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Manage Quiz
                    </button>

                    <button
                      onClick={() =>
                        deleteQuiz(quiz)
                      }
                      disabled={loading}
                      style={{
                        padding:
                          "10px 14px",
                        border:
                          "1px solid #fecaca",
                        borderRadius: "7px",
                        background:
                          "#fff1f2",
                        color: "#dc2626",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SELECTED QUIZ */}

        {selectedQuiz && (
          <section
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "30px",
              boxShadow:
                "0 4px 18px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
                gap: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "23px",
                  }}
                >
                  {selectedQuiz.title}
                </h2>

                <p
                  style={{
                    color: "#64748b",
                    margin:
                      "7px 0 0",
                  }}
                >
                  Passing score:{" "}
                  {selectedQuiz.passing_score}%
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedQuiz(null);
                  setQuestions([]);
                  resetQuestionForm();
                }}
                style={{
                  padding:
                    "9px 15px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "7px",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Close
              </button>
            </div>

            <hr
              style={{
                border: 0,
                borderTop:
                  "1px solid #e5e7eb",
                margin:
                  "25px 0",
              }}
            />

            {/* QUESTIONS */}

            <h3
              style={{
                marginBottom: "15px",
              }}
            >
              Questions
            </h3>

            {questions.length === 0 ? (
              <div
                style={{
                  background:
                    "#f8fafc",
                  padding: "18px",
                  borderRadius: "9px",
                  color: "#64748b",
                  marginBottom: "25px",
                }}
              >
                No questions added yet.
                Add your first question
                below.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: "12px",
                  marginBottom:
                    "30px",
                }}
              >
                {questions.map(
                  (question, index) => (
                    <div
                      key={question.id}
                      style={{
                        border:
                          "1px solid #e2e8f0",
                        borderRadius:
                          "10px",
                        padding: "18px",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap: "15px",
                        }}
                      >
                        <div>
                          <strong>
                            Question{" "}
                            {index + 1}
                          </strong>

                          <p
                            style={{
                              margin:
                                "8px 0 12px",
                              fontSize:
                                "15px",
                            }}
                          >
                            {
                              question.question
                            }
                          </p>

                          <div
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "1fr 1fr",
                              gap:
                                "7px 20px",
                              color:
                                "#64748b",
                              fontSize:
                                "13px",
                            }}
                          >
                            <div>
                              <strong>
                                A:
                              </strong>{" "}
                              {
                                question.option_a
                              }
                            </div>

                            <div>
                              <strong>
                                B:
                              </strong>{" "}
                              {
                                question.option_b
                              }
                            </div>

                            <div>
                              <strong>
                                C:
                              </strong>{" "}
                              {
                                question.option_c
                              }
                            </div>

                            <div>
                              <strong>
                                D:
                              </strong>{" "}
                              {
                                question.option_d
                              }
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            flexDirection:
                              "column",
                            gap: "7px",
                            minWidth:
                              "85px",
                          }}
                        >
                          <button
                            onClick={() =>
                              editQuestion(
                                question
                              )
                            }
                            style={{
                              padding:
                                "8px 12px",
                              border:
                                "1px solid #cbd5e1",
                              borderRadius:
                                "6px",
                              background:
                                "white",
                              cursor:
                                "pointer",
                              fontWeight:
                                "bold",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteQuestion(
                                question
                              )
                            }
                            disabled={loading}
                            style={{
                              padding:
                                "8px 12px",
                              border:
                                "1px solid #fecaca",
                              borderRadius:
                                "6px",
                              background:
                                "#fff1f2",
                              color:
                                "#dc2626",
                              cursor:
                                "pointer",
                              fontWeight:
                                "bold",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* ADD / EDIT QUESTION */}

            <div
              style={{
                borderTop:
                  "1px solid #e5e7eb",
                paddingTop: "25px",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 5px",
                }}
              >
                {editingQuestionId !==
                null
                  ? "Edit Question"
                  : "Add Question"}
              </h3>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  marginTop: "5px",
                }}
              >
                Configure the question
                and choose the correct
                answer.
              </p>

              <form
                onSubmit={saveQuestion}
              >
                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "bold",
                    marginBottom:
                      "8px",
                  }}
                >
                  Question
                </label>

                <textarea
                  value={questionText}
                  onChange={(e) =>
                    setQuestionText(
                      e.target.value
                    )
                  }
                  placeholder="What is NetSuite primarily used for?"
                  rows={4}
                  required
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding: "12px",
                    border:
                      "1px solid #cbd5e1",
                    borderRadius:
                      "8px",
                    marginBottom:
                      "18px",
                    fontSize:
                      "14px",
                    resize:
                      "vertical",
                  }}
                />

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display:
                          "block",
                        fontWeight:
                          "bold",
                        marginBottom:
                          "8px",
                      }}
                    >
                      Option A
                    </label>

                    <input
                      value={optionA}
                      onChange={(e) =>
                        setOptionA(
                          e.target.value
                        )
                      }
                      placeholder="Option A"
                      required
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "11px",
                        border:
                          "1px solid #cbd5e1",
                        borderRadius:
                          "8px",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display:
                          "block",
                        fontWeight:
                          "bold",
                        marginBottom:
                          "8px",
                      }}
                    >
                      Option B
                    </label>

                    <input
                      value={optionB}
                      onChange={(e) =>
                        setOptionB(
                          e.target.value
                        )
                      }
                      placeholder="Option B"
                      required
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "11px",
                        border:
                          "1px solid #cbd5e1",
                        borderRadius:
                          "8px",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display:
                          "block",
                        fontWeight:
                          "bold",
                        marginBottom:
                          "8px",
                      }}
                    >
                      Option C
                    </label>

                    <input
                      value={optionC}
                      onChange={(e) =>
                        setOptionC(
                          e.target.value
                        )
                      }
                      placeholder="Option C"
                      required
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "11px",
                        border:
                          "1px solid #cbd5e1",
                        borderRadius:
                          "8px",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display:
                          "block",
                        fontWeight:
                          "bold",
                        marginBottom:
                          "8px",
                      }}
                    >
                      Option D
                    </label>

                    <input
                      value={optionD}
                      onChange={(e) =>
                        setOptionD(
                          e.target.value
                        )
                      }
                      placeholder="Option D"
                      required
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "11px",
                        border:
                          "1px solid #cbd5e1",
                        borderRadius:
                          "8px",
                      }}
                    />
                  </div>
                </div>

                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "bold",
                    marginTop:
                      "20px",
                    marginBottom:
                      "8px",
                  }}
                >
                  Correct Answer
                </label>

                <select
                  value={correctAnswer}
                  onChange={(e) =>
                    setCorrectAnswer(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding:
                      "12px",
                    border:
                      "1px solid #cbd5e1",
                    borderRadius:
                      "8px",
                    background:
                      "white",
                    marginBottom:
                      "20px",
                  }}
                >
                  <option value="A">
                    A — {optionA || "Option A"}
                  </option>

                  <option value="B">
                    B — {optionB || "Option B"}
                  </option>

                  <option value="C">
                    C — {optionC || "Option C"}
                  </option>

                  <option value="D">
                    D — {optionD || "Option D"}
                  </option>
                </select>

                <div
                  style={{
                    display:
                      "flex",
                    gap: "10px",
                  }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding:
                        "11px 20px",
                      border: "none",
                      borderRadius:
                        "7px",
                      background:
                        "#16a34a",
                      color: "white",
                      fontWeight:
                        "bold",
                      cursor:
                        "pointer",
                    }}
                  >
                    {loading
                      ? "Saving..."
                      : editingQuestionId !==
                        null
                      ? "Update Question"
                      : "Add Question"}
                  </button>

                  {editingQuestionId !==
                    null && (
                    <button
                      type="button"
                      onClick={
                        resetQuestionForm
                      }
                      style={{
                        padding:
                          "11px 20px",
                        border:
                          "1px solid #cbd5e1",
                        borderRadius:
                          "7px",
                        background:
                          "white",
                        fontWeight:
                          "bold",
                        cursor:
                          "pointer",
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default QuizManagement;