import React, { useEffect, useState } from "react";
import api from "../services/api";

interface QuizPageProps {
  quizId: number;
  onBack: () => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface Quiz {
  id: number;
  course_id: number;
  title: string;
  passing_score: number;
  questions: QuizQuestion[];
}

interface QuizResult {
  quiz_id?: number;
  total_questions?: number;
  correct_answers?: number;
  score: number;
  passing_score?: number;
  passed: boolean;
  message?: string;
  can_retry?: boolean;
}

interface Option {
  letter: string;
  text: string;
}

function QuizPage({
  quizId,
  onBack,
}: QuizPageProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [answers, setAnswers] = useState<
    Record<number, string>
  >({});

  const [result, setResult] =
    useState<QuizResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD QUIZ
  // ============================================================

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError("");
      setQuiz(null);
      setResult(null);
      setAnswers({});

      const response = await api.get(
        `/quizzes/${quizId}`
      );

      console.log("QUIZ RESPONSE:", response.data);

      const data = response.data;

      setQuiz({
        id: data.id,
        course_id: data.course_id,
        title: data.title,
        passing_score: data.passing_score,
        questions: Array.isArray(data.questions)
          ? data.questions
          : [],
      });
    } catch (err: any) {
      console.error("QUIZ LOAD ERROR:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load quiz"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SELECT ANSWER
  // ============================================================

  const handleSelect = (
    questionId: number,
    answer: string
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  };

  // ============================================================
  // SUBMIT QUIZ
  // ============================================================

  const handleSubmit = async () => {
    if (!quiz) {
      return;
    }

    if (quiz.questions.length === 0) {
      setError("This quiz has no questions.");
      return;
    }

    // Make sure every question has an answer
    const unansweredQuestions =
      quiz.questions.filter(
        (question) =>
          !answers[question.id]
      );

    if (unansweredQuestions.length > 0) {
      setError(
        `Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remaining.`
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      /*
       * IMPORTANT:
       *
       * Backend expects:
       *
       * {
       *   "answers": {
       *      "3": "B",
       *      "4": "A"
       *   }
       * }
       */

      const response = await api.post(
        `/quizzes/${quiz.id}/submit`,
        {
          answers: answers,
        }
      );

      console.log(
        "QUIZ RESULT:",
        response.data
      );

      setResult(response.data);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err: any) {
      console.error(
        "QUIZ SUBMIT ERROR:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to submit quiz"
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // RETRY
  // ============================================================

  const retryQuiz = () => {
    setAnswers({});
    setResult(null);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px 50px",
            borderRadius: "16px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1f4e79",
              marginBottom: "10px",
            }}
          >
            Loading Quiz...
          </div>

          <div
            style={{
              color: "#6b7280",
            }}
          >
            Please wait
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR WITHOUT QUIZ
  // ============================================================

  if (!quiz) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f7fb",
          fontFamily:
            "Arial, sans-serif",
          padding: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              background: "#1f4e79",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "30px",
            }}
          >
            ← Back to Course
          </button>

          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            {error ||
              "Unable to load quiz."}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // QUIZ RESULT
  // ============================================================

  if (result) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f7fb",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        {/* HEADER */}

        <header
          style={{
            background: "#1f4e79",
            color: "white",
            padding: "20px 40px",
            display: "flex",
            justifyContent:
              "space-between",
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
                margin:
                  "5px 0 0",
                opacity: 0.85,
              }}
            >
              Quiz Result
            </p>
          </div>

          <button
            type="button"
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
            ← Back to Course
          </button>
        </header>

        <main
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "50px 30px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "50px",
              textAlign: "center",
              boxShadow:
                "0 8px 30px rgba(0,0,0,0.07)",
            }}
          >
            <div
              style={{
                fontSize: "70px",
                marginBottom: "15px",
              }}
            >
              {result.passed
                ? "🎉"
                : "📚"}
            </div>

            <h2
              style={{
                margin:
                  "0 0 15px",
                fontSize: "32px",
                color: result.passed
                  ? "#166534"
                  : "#991b1b",
              }}
            >
              {result.passed
                ? "Quiz Passed!"
                : "Quiz Not Passed"}
            </h2>

            <div
              style={{
                fontSize: "58px",
                fontWeight: "bold",
                color: "#1f4e79",
                marginBottom: "10px",
              }}
            >
              {result.score}%
            </div>

            <p
              style={{
                color: "#6b7280",
                fontSize: "17px",
                marginBottom: "30px",
              }}
            >
              Passing Score:{" "}
              {result.passing_score ??
                quiz.passing_score}
              %
            </p>

            {result.total_questions !==
              undefined && (
              <p
                style={{
                  color: "#374151",
                  marginBottom: "30px",
                }}
              >
                Correct Answers:{" "}
                <strong>
                  {result.correct_answers}
                </strong>{" "}
                /{" "}
                <strong>
                  {result.total_questions}
                </strong>
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {!result.passed && (
                <button
                  type="button"
                  onClick={retryQuiz}
                  style={{
                    padding:
                      "13px 25px",
                    border: "none",
                    borderRadius:
                      "8px",
                    background:
                      "#1f4e79",
                    color: "white",
                    fontWeight:
                      "bold",
                    cursor:
                      "pointer",
                  }}
                >
                  Retry Quiz
                </button>
              )}

              <button
                type="button"
                onClick={onBack}
                style={{
                  padding:
                    "13px 25px",
                  border:
                    "1px solid #1f4e79",
                  borderRadius:
                    "8px",
                  background:
                    "white",
                  color:
                    "#1f4e79",
                  fontWeight:
                    "bold",
                  cursor:
                    "pointer",
                }}
              >
                Back to Course
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // QUIZ PAGE
  // ============================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          background: "#1f4e79",
          color: "white",
          padding: "20px 40px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow:
            "0 3px 12px rgba(0,0,0,0.12)",
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
              margin:
                "5px 0 0",
              opacity: 0.85,
            }}
          >
            Course Quiz
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          style={{
            padding:
              "11px 20px",
            border: "none",
            borderRadius: "8px",
            background: "white",
            color: "#1f4e79",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ← Back to Course
        </button>
      </header>

      <main
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding:
            "40px 25px 70px",
        }}
      >
        {/* ERROR */}

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "16px 20px",
              borderRadius: "10px",
              marginBottom: "25px",
              border:
                "1px solid #fecaca",
              fontWeight: "bold",
            }}
          >
            {error}
          </div>
        )}

        {/* QUIZ TITLE */}

        <section
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "35px",
            marginBottom: "25px",
            boxShadow:
              "0 6px 25px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              color: "#1f4e79",
              fontSize: "13px",
              fontWeight: "bold",
              letterSpacing:
                "0.5px",
              marginBottom: "10px",
            }}
          >
            COURSE QUIZ
          </div>

          <h2
            style={{
              margin:
                "0 0 12px",
              color: "#111827",
              fontSize: "34px",
            }}
          >
            {quiz.title}
          </h2>

          <p
            style={{
              margin:
                "0 0 15px",
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            Answer all questions
            and submit your quiz.
          </p>

          <div
            style={{
              display:
                "inline-block",
              padding:
                "9px 14px",
              background:
                "#e8f1f8",
              color: "#1f4e79",
              borderRadius:
                "8px",
              fontWeight:
                "bold",
            }}
          >
            Passing Score:{" "}
            {quiz.passing_score}%
          </div>
        </section>

        {/* NO QUESTIONS */}

        {quiz.questions.length ===
          0 && (
          <section
            style={{
              background:
                "white",
              borderRadius:
                "18px",
              padding: "40px",
              textAlign:
                "center",
              boxShadow:
                "0 6px 25px rgba(0,0,0,0.06)",
            }}
          >
            <h3
              style={{
                color:
                  "#374151",
              }}
            >
              No questions found
            </h3>

            <p
              style={{
                color:
                  "#6b7280",
              }}
            >
              This quiz does not
              have any questions yet.
            </p>
          </section>
        )}

        {/* QUESTIONS */}

        {quiz.questions.map(
          (question, index) => {
            const options: Option[] =
              [
                {
                  letter: "A",
                  text:
                    question.option_a,
                },
                {
                  letter: "B",
                  text:
                    question.option_b,
                },
                {
                  letter: "C",
                  text:
                    question.option_c,
                },
                {
                  letter: "D",
                  text:
                    question.option_d,
                },
              ];

            const selected =
              answers[
                question.id
              ];

            return (
              <section
                key={question.id}
                style={{
                  background:
                    "white",
                  borderRadius:
                    "18px",
                  padding: "35px",
                  marginBottom:
                    "22px",
                  boxShadow:
                    "0 6px 25px rgba(0,0,0,0.06)",
                }}
              >
                {/* QUESTION NUMBER */}

                <div
                  style={{
                    color:
                      "#1f4e79",
                    fontSize:
                      "13px",
                    fontWeight:
                      "bold",
                    marginBottom:
                      "10px",
                    letterSpacing:
                      "0.5px",
                  }}
                >
                  QUESTION{" "}
                  {index + 1}
                </div>

                {/* QUESTION TEXT */}

                <h3
                  style={{
                    margin:
                      "0 0 25px",
                    color:
                      "#111827",
                    fontSize:
                      "22px",
                    lineHeight:
                      1.45,
                  }}
                >
                  {question.question}
                </h3>

                {/* OPTIONS */}

                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap: "12px",
                  }}
                >
                  {options.map(
                    (option) => {
                      const isSelected =
                        selected ===
                        option.letter;

                      return (
                        <button
                          key={
                            option.letter
                          }
                          type="button"
                          onClick={() =>
                            handleSelect(
                              question.id,
                              option.letter
                            )
                          }
                          style={{
                            width:
                              "100%",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "15px",
                            padding:
                              "17px 20px",
                            borderRadius:
                              "12px",
                            border:
                              isSelected
                                ? "2px solid #1f4e79"
                                : "1px solid #d1d5db",
                            background:
                              isSelected
                                ? "#e8f1f8"
                                : "white",
                            color:
                              "#1f2937",
                            cursor:
                              "pointer",
                            textAlign:
                              "left",
                            fontSize:
                              "16px",
                            fontWeight:
                              isSelected
                                ? "bold"
                                : "normal",
                            transition:
                              "all 0.15s ease",
                          }}
                        >
                          {/* LETTER */}

                          <span
                            style={{
                              width:
                                "38px",
                              height:
                                "38px",
                              minWidth:
                                "38px",
                              borderRadius:
                                "50%",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              background:
                                isSelected
                                  ? "#1f4e79"
                                  : "#f3f4f6",
                              color:
                                isSelected
                                  ? "white"
                                  : "#374151",
                              fontWeight:
                                "bold",
                            }}
                          >
                            {
                              option.letter
                            }
                          </span>

                          {/* TEXT */}

                          <span
                            style={{
                              flex: 1,
                            }}
                          >
                            {
                              option.text
                            }
                          </span>

                          {/* CHECK */}

                          {isSelected && (
                            <span
                              style={{
                                fontSize:
                                  "22px",
                                color:
                                  "#1f4e79",
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </section>
            );
          }
        )}

        {/* SUBMIT */}

        {quiz.questions.length >
          0 && (
          <section
            style={{
              background:
                "white",
              borderRadius:
                "18px",
              padding: "30px",
              boxShadow:
                "0 6px 25px rgba(0,0,0,0.06)",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                textAlign:
                  "center",
                marginBottom:
                  "20px",
                color:
                  "#6b7280",
              }}
            >
              Answered{" "}
              <strong
                style={{
                  color:
                    "#1f4e79",
                }}
              >
                {
                  Object.keys(
                    answers
                  ).length
                }
              </strong>{" "}
              of{" "}
              <strong>
                {quiz.questions.length}
              </strong>{" "}
              questions
            </div>

            <button
              type="button"
              onClick={
                handleSubmit
              }
              disabled={
                submitting
              }
              style={{
                width: "100%",
                padding:
                  "17px",
                border: "none",
                borderRadius:
                  "10px",
                background:
                  submitting
                    ? "#9ca3af"
                    : "#1f4e79",
                color: "white",
                fontWeight:
                  "bold",
                fontSize:
                  "17px",
                cursor:
                  submitting
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {submitting
                ? "Submitting Quiz..."
                : "Submit Quiz →"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default QuizPage;