import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

interface Question {
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
  questions: Question[];
}

interface Result {
  quiz_id: number;
  total_questions: number;
  correct_answers: number;
  score: number;
  passing_score: number;
  passed: boolean;
}

function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!id) {
        setError("Quiz ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/quizzes/${id}`);
        setQuiz(response.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || "Unable to load quiz.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const choose = (questionId: number, option: string) => {
    setAnswers((old) => ({
      ...old,
      [questionId]: option,
    }));
    setError("");
  };

  const submit = async () => {
    if (!quiz || !id) return;

    if (Object.keys(answers).length !== quiz.questions.length) {
      setError("Please answer every question before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post(`/quizzes/${id}/submit`, {
        answers,
      });

      setResult(response.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("SUBMIT ERROR:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to submit quiz. Please try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.center}>
        Loading quiz...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="app-shell" style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <h2>Quiz unavailable</h2>
            <p style={{ color: "#b91c1c" }}>{error}</p>
            <button style={styles.primaryButton} onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="app-shell" style={styles.page}>
        <header className="app-header" style={styles.header}>
          <div>
            <h1 style={{ margin: 0 }}>NetSuite Academy</h1>
            <div style={{ marginTop: 5, opacity: 0.85 }}>Course Quiz</div>
          </div>
          <button style={styles.headerButton} onClick={() => navigate(-1)}>
            ← Back
          </button>
        </header>

        <main className="app-main" style={styles.container}>
          <div style={styles.cardResult}>
            <div
              style={{
                ...styles.scoreCircle,
                background: result.passed ? "#dcfce7" : "#fee2e2",
                color: result.passed ? "#166534" : "#b91c1c",
              }}
            >
              {result.score}%
            </div>

            <h2 style={{ color: result.passed ? "#166534" : "#b91c1c" }}>
              {result.passed ? "🎉 Quiz Passed!" : "❌ Quiz Failed"}
            </h2>

            <p style={{ fontSize: 17, color: "#6b7280" }}>
              You answered {result.correct_answers} of{" "}
              {result.total_questions} correctly.
            </p>

            {!result.passed && (
              <button
                style={styles.primaryButton}
                onClick={() => {
                  setAnswers({});
                  setResult(null);
                  setError("");
                }}
              >
                Retry Quiz
              </button>
            )}

            <button
              style={styles.secondaryButton}
              onClick={() => navigate(-1)}
            >
              Back to Course
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell" style={styles.page}>
      <header className="app-header" style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>NetSuite Academy</h1>
          <div style={{ marginTop: 5, opacity: 0.85 }}>Course Quiz</div>
        </div>

        <button style={styles.headerButton} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </header>

      <main className="app-main" style={styles.container}>
        <section style={styles.card}>
          <div style={styles.label}>COURSE QUIZ</div>
          <h2 style={styles.title}>{quiz.title}</h2>
          <p style={styles.subtitle}>
            {quiz.questions.length} question
            {quiz.questions.length === 1 ? "" : "s"} • Passing score:{" "}
            <strong>{quiz.passing_score}%</strong>
          </p>
        </section>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {quiz.questions.map((question, index) => {
          const options = [
            ["A", question.option_a],
            ["B", question.option_b],
            ["C", question.option_c],
            ["D", question.option_d],
          ];

          return (
            <section key={question.id} style={styles.card}>
              <div style={styles.label}>QUESTION {index + 1}</div>

              <h3 style={styles.question}>
                {question.question}
              </h3>

              <div style={styles.options}>
                {options.map(([letter, text]) => {
                  const selected = answers[question.id] === letter;

                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => choose(question.id, letter)}
                      style={{
                        ...styles.option,
                        ...(selected ? styles.optionSelected : {}),
                      }}
                    >
                      <span
                        style={{
                          ...styles.radio,
                          ...(selected ? styles.radioSelected : {}),
                        }}
                      >
                        {selected ? "✓" : ""}
                      </span>

                      <span style={styles.letter}>{letter}.</span>

                      <span style={styles.optionText}>{text}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section style={styles.submitBar}>
          <div style={{ color: "#6b7280" }}>
            Answered{" "}
            <strong style={{ color: "#111827" }}>
              {Object.keys(answers).length}
            </strong>{" "}
            of{" "}
            <strong style={{ color: "#111827" }}>
              {quiz.questions.length}
            </strong>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            style={{
              ...styles.primaryButton,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "Submitting..." : "Submit Quiz →"}
          </button>
        </section>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    fontFamily: "Arial, sans-serif",
    color: "#1f2937",
    paddingBottom: 60,
  },
  header: {
    background: "#1f4e79",
    color: "white",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: 8,
    background: "white",
    color: "#1f4e79",
    fontWeight: "bold",
    cursor: "pointer",
  },
  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "40px 20px",
  },
  card: {
    background: "white",
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  },
  cardResult: {
    background: "white",
    borderRadius: 16,
    padding: "50px 30px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  },
  label: {
    color: "#1f4e79",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
  },
  title: {
    margin: "0 0 10px",
    fontSize: 32,
  },
  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: 16,
  },
  question: {
    margin: "0 0 25px",
    fontSize: 21,
    lineHeight: 1.5,
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  option: {
    width: "100%",
    minHeight: 62,
    display: "flex",
    alignItems: "center",
    textAlign: "left",
    gap: 12,
    padding: "16px 18px",
    borderRadius: 10,
    border: "2px solid #d1d5db",
    background: "white",
    color: "#1f2937",
    cursor: "pointer",
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  optionSelected: {
    border: "2px solid #1f4e79",
    background: "#e8f1f8",
  },
  radio: {
    width: 24,
    height: 24,
    minWidth: 24,
    borderRadius: "50%",
    border: "2px solid #9ca3af",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: "bold",
    boxSizing: "border-box",
  },
  radioSelected: {
    border: "2px solid #1f4e79",
    background: "#1f4e79",
    color: "white",
  },
  letter: {
    fontWeight: "bold",
    color: "#1f4e79",
    minWidth: 22,
  },
  optionText: {
    flex: 1,
    pointerEvents: "none",
  },
  submitBar: {
    background: "white",
    borderRadius: 16,
    padding: "25px 30px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "14px 28px",
    border: "none",
    borderRadius: 9,
    background: "#1f4e79",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
  },
  secondaryButton: {
    marginLeft: 10,
    padding: "14px 28px",
    border: "1px solid #d1d5db",
    borderRadius: 9,
    background: "white",
    color: "#1f4e79",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: "15px 18px",
    marginBottom: 20,
    fontWeight: "bold",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
    color: "#1f4e79",
    fontSize: 18,
  },
  scoreCircle: {
    width: 110,
    height: 110,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 25px",
    fontSize: 28,
    fontWeight: "bold",
  },
};

export default QuizPage;
