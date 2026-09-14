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
}

interface Module {
  id: number;
  course_id: number;
  title: string;
  content: string;
  video_url: string | null;
  module_type: string;
  sort_order: number;
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
}

interface QuizDetails extends Quiz {
  questions: QuizQuestion[];
}

interface Result {
  quiz_id: number;
  total_questions: number;
  correct_answers: number;
  score: number;
  passing_score: number;
  passed: boolean;
}

interface Certificate {
  id: number;
  certificate_number: string;
  final_score: number;
  issued_at: string;
  course_title: string;
  user_name: string;
}

function CourseLearning({
  course,
  onBack,
}: CourseLearningProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [selectedQuiz, setSelectedQuiz] =
    useState<QuizDetails | null>(null);

  const [answers, setAnswers] =
    useState<Record<number, string>>({});

  const [result, setResult] =
    useState<Result | null>(null);

  const [certificate, setCertificate] =
    useState<Certificate | null>(null);

  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [certificateLoading, setCertificateLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [quizError, setQuizError] = useState("");

  /*
   * ---------------------------------------------------------
   * LOAD COURSE
   * ---------------------------------------------------------
   */

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError("");

      const [modulesResponse, quizzesResponse] =
        await Promise.all([
          api.get(`/courses/${course.id}/modules`),
          api.get(`/quizzes/course/${course.id}`),
        ]);

      setModules(modulesResponse.data);
      setQuizzes(quizzesResponse.data);
    } catch (e: any) {
      setError(
        e.response?.data?.detail ||
          "Unable to load course content."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [course.id]);

  /*
   * ---------------------------------------------------------
   * OPEN QUIZ
   * ---------------------------------------------------------
   */

  const openQuiz = async (quiz: Quiz) => {
    try {
      setQuizLoading(true);
      setQuizError("");

      setSelectedQuiz(null);
      setAnswers({});
      setResult(null);
      setCertificate(null);

      const response = await api.get(
        `/quizzes/${quiz.id}`
      );

      setSelectedQuiz(response.data);
    } catch (e: any) {
      setQuizError(
        e.response?.data?.detail ||
          "Unable to load quiz questions."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * CHOOSE ANSWER
   * ---------------------------------------------------------
   */

  const chooseAnswer = (
    questionId: number,
    option: string
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: option,
    }));

    setQuizError("");
  };

  /*
   * ---------------------------------------------------------
   * SUBMIT QUIZ
   * ---------------------------------------------------------
   */

  const submitQuiz = async () => {
    if (!selectedQuiz) {
      return;
    }

    const answeredCount =
      Object.keys(answers).length;

    if (
      answeredCount !==
      selectedQuiz.questions.length
    ) {
      setQuizError(
        `Please answer all ${selectedQuiz.questions.length} questions before submitting.`
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSubmitting(true);
      setQuizError("");

      const response = await api.post(
        `/quizzes/${selectedQuiz.id}/submit`,
        {
          answers,
        }
      );

      const quizResult: Result = response.data;

      setResult(quizResult);

      /*
       * If learner passed the quiz,
       * automatically create the certificate.
       */

      if (quizResult.passed) {
        try {
          const certificateResponse =
            await api.post(
              `/certificates/quiz/${selectedQuiz.id}?score=${quizResult.score}`
            );

          setCertificate(
            certificateResponse.data
          );
        } catch (certificateError) {
          console.error(
            "Certificate creation failed:",
            certificateError
          );

          setQuizError(
            "Quiz passed, but the certificate could not be generated."
          );
        }
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (e: any) {
      setQuizError(
        e.response?.data?.detail ||
          "Unable to submit quiz. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DOWNLOAD CERTIFICATE
   * ---------------------------------------------------------
   */

  const downloadCertificate = async () => {
    if (!certificate) {
      return;
    }

    try {
      setCertificateLoading(true);
      setQuizError("");

      const response = await api.get(
        `/certificates/${certificate.id}/download`,
        {
          responseType: "blob",
        }
      );

      const blobUrl = URL.createObjectURL(
        response.data
      );

      const downloadLink =
        document.createElement("a");

      downloadLink.href = blobUrl;

      downloadLink.download =
        `${certificate.certificate_number}.pdf`;

      document.body.appendChild(downloadLink);

      downloadLink.click();

      downloadLink.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (e: any) {
      console.error(
        "Certificate download failed:",
        e
      );

      setQuizError(
        "Unable to download the certificate. Please try again."
      );
    } finally {
      setCertificateLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * BACK TO COURSE
   * ---------------------------------------------------------
   */

  const backToCourse = () => {
    setSelectedQuiz(null);
    setAnswers({});
    setResult(null);
    setCertificate(null);
    setQuizError("");
  };

  /*
   * ---------------------------------------------------------
   * QUIZ SCREEN
   * ---------------------------------------------------------
   */

  if (selectedQuiz) {
    const answeredCount =
      Object.keys(answers).length;

    return (
      <div style={S.page}>
        <header style={S.header}>
          <div>
            <h1 style={S.headerTitle}>
              NetSuite Academy
            </h1>

            <div style={S.headerSubtitle}>
              Course Quiz
            </div>
          </div>

          <button
            style={S.headerBtn}
            onClick={backToCourse}
          >
            ← Back to Course
          </button>
        </header>

        <main style={S.container}>
          {/* QUIZ HEADER */}

          <section style={S.card}>
            <div style={S.label}>
              COURSE QUIZ
            </div>

            <h2 style={S.title}>
              {selectedQuiz.title}
            </h2>

            <p style={S.sub}>
              {selectedQuiz.questions.length} questions
              {" · "}
              Passing score:
              {" "}
              <strong>
                {selectedQuiz.passing_score}%
              </strong>
            </p>
          </section>

          {/* ERROR */}

          {quizError && (
            <div style={S.error}>
              <span style={S.errorIcon}>!</span>
              {quizError}
            </div>
          )}

          {/* RESULT */}

          {result ? (
            <section style={S.resultCard}>
              <div
                style={{
                  ...S.scoreCircle,
                  background: result.passed
                    ? "#dcfce7"
                    : "#fee2e2",
                  color: result.passed
                    ? "#166534"
                    : "#b91c1c",
                }}
              >
                {result.score}%
              </div>

              <div
                style={{
                  ...S.resultBadge,
                  background: result.passed
                    ? "#ecfdf3"
                    : "#fff1f2",
                  color: result.passed
                    ? "#15803d"
                    : "#b91c1c",
                }}
              >
                {result.passed
                  ? "PASSED"
                  : "NOT PASSED"}
              </div>

              <h2
                style={{
                  ...S.resultTitle,
                  color: result.passed
                    ? "#166534"
                    : "#b91c1c",
                }}
              >
                {result.passed
                  ? "🎉 Quiz Passed!"
                  : "❌ Quiz Failed"}
              </h2>

              <p style={S.resultText}>
                You answered{" "}
                <strong>
                  {result.correct_answers}
                </strong>{" "}
                of{" "}
                <strong>
                  {result.total_questions}
                </strong>{" "}
                correctly.
              </p>

              {/* CERTIFICATE */}

              {result.passed && (
                <div style={S.certificateBox}>
                  <div style={S.certificateIcon}>
                    🏆
                  </div>

                  <div style={S.certificateInfo}>
                    <div style={S.certificateTitle}>
                      Certificate Earned
                    </div>

                    {certificate ? (
                      <>
                        <div
                          style={
                            S.certificateNumber
                          }
                        >
                          Certificate No.
                        </div>

                        <div
                          style={
                            S.certificateNumberValue
                          }
                        >
                          {certificate.certificate_number}
                        </div>
                      </>
                    ) : (
                      <div
                        style={
                          S.certificatePending
                        }
                      >
                        Preparing your certificate...
                      </div>
                    )}
                  </div>

                  <button
                    onClick={
                      downloadCertificate
                    }
                    disabled={
                      !certificate ||
                      certificateLoading
                    }
                    style={{
                      ...S.primary,
                      opacity:
                        !certificate ||
                        certificateLoading
                          ? 0.6
                          : 1,
                      cursor:
                        !certificate ||
                        certificateLoading
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {certificateLoading
                      ? "Generating..."
                      : "Download Certificate ↓"}
                  </button>
                </div>
              )}

              {/* RETRY */}

              {!result.passed && (
                <button
                  onClick={() => {
                    setAnswers({});
                    setResult(null);
                    setCertificate(null);
                    setQuizError("");
                  }}
                  style={S.primary}
                >
                  Retry Quiz
                </button>
              )}

              <button
                onClick={backToCourse}
                style={S.secondary}
              >
                Back to Course
              </button>
            </section>
          ) : (
            <>
              {/* PROGRESS */}

              <section style={S.progressCard}>
                <div>
                  <div style={S.progressLabel}>
                    QUIZ PROGRESS
                  </div>

                  <div style={S.progressText}>
                    {answeredCount} of{" "}
                    {selectedQuiz.questions.length}{" "}
                    answered
                  </div>
                </div>

                <div style={S.progressTrack}>
                  <div
                    style={{
                      ...S.progressFill,
                      width: `${
                        selectedQuiz.questions.length
                          ? (answeredCount /
                              selectedQuiz.questions.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </section>

              {/* QUESTIONS */}

              {selectedQuiz.questions.map(
                (question, index) => {
                  const options = [
                    {
                      letter: "A",
                      text: question.option_a,
                    },
                    {
                      letter: "B",
                      text: question.option_b,
                    },
                    {
                      letter: "C",
                      text: question.option_c,
                    },
                    {
                      letter: "D",
                      text: question.option_d,
                    },
                  ];

                  return (
                    <section
                      key={question.id}
                      style={S.card}
                    >
                      <div style={S.questionTop}>
                        <div
                          style={S.questionNumber}
                        >
                          {index + 1}
                        </div>

                        <div>
                          <div style={S.label}>
                            QUESTION {index + 1}
                          </div>

                          <div
                            style={
                              S.questionCount
                            }
                          >
                            {answeredCount >
                            index
                              ? "Answer selected"
                              : "Not answered"}
                          </div>
                        </div>
                      </div>

                      <h3
                        style={S.question}
                      >
                        {question.question}
                      </h3>

                      <div style={S.options}>
                        {options.map(
                          ({
                            letter,
                            text,
                          }) => {
                            const selected =
                              answers[
                                question.id
                              ] === letter;

                            return (
                              <button
                                type="button"
                                key={letter}
                                onClick={() =>
                                  chooseAnswer(
                                    question.id,
                                    letter
                                  )
                                }
                                style={{
                                  ...S.option,
                                  ...(selected
                                    ? S.selected
                                    : {}),
                                }}
                              >
                                <span
                                  style={{
                                    ...S.radio,
                                    ...(selected
                                      ? S.radioSelected
                                      : {}),
                                  }}
                                >
                                  {selected
                                    ? "✓"
                                    : ""}
                                </span>

                                <span
                                  style={
                                    S.optionLetter
                                  }
                                >
                                  {letter}
                                </span>

                                <span
                                  style={
                                    S.optionText
                                  }
                                >
                                  {text}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </section>
                  );
                }
              )}

              {/* SUBMIT BAR */}

              <section style={S.submitBar}>
                <div>
                  <div style={S.submitLabel}>
                    QUIZ COMPLETION
                  </div>

                  <div style={S.submitCount}>
                    {answeredCount} /{" "}
                    {selectedQuiz.questions.length}{" "}
                    questions answered
                  </div>
                </div>

                <button
                  onClick={submitQuiz}
                  disabled={submitting}
                  style={{
                    ...S.primary,
                    opacity: submitting
                      ? 0.65
                      : 1,
                    cursor: submitting
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Quiz →"}
                </button>
              </section>
            </>
          )}
        </main>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * COURSE LEARNING SCREEN
   * ---------------------------------------------------------
   */

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div>
          <h1 style={S.headerTitle}>
            NetSuite Academy
          </h1>

          <div style={S.headerSubtitle}>
            Course Learning
          </div>
        </div>

        <button
          style={S.headerBtn}
          onClick={onBack}
        >
          ← Back to Courses
        </button>
      </header>

      <main
        style={{
          ...S.container,
          maxWidth: 1100,
        }}
      >
        {/* COURSE HEADER */}

        <section style={S.courseHero}>
          <div style={S.courseHeroContent}>
            <div style={S.label}>
              {course.category ||
                "NETSUITE TRAINING"}
            </div>

            <h2 style={S.title}>
              {course.title}
            </h2>

            <p style={S.sub}>
              {course.description}
            </p>

            <div style={S.courseMeta}>
              <span style={S.pill}>
                Passing Score:{" "}
                {course.passing_score}%
              </span>

              <span style={S.pillSecondary}>
                {modules.length} Modules
              </span>

              <span style={S.pillSecondary}>
                {quizzes.length} Quiz
                {quizzes.length !== 1
                  ? "zes"
                  : ""}
              </span>
            </div>
          </div>
        </section>

        {/* LOADING */}

        {loading && (
          <div style={S.loadingCard}>
            <div style={S.loadingSpinner}>
              ⟳
            </div>

            <div>
              <strong>
                Loading course content
              </strong>

              <div style={S.loadingText}>
                Please wait...
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div style={S.error}>
            <span style={S.errorIcon}>
              !
            </span>

            {error}
          </div>
        )}

        {/* CONTENT */}

        {!loading && !error && (
          <>
            {/* MODULES */}

            <div style={S.sectionHeader}>
              <div>
                <div style={S.sectionEyebrow}>
                  LEARNING PATH
                </div>

                <h2
                  style={S.sectionTitle}
                >
                  Course Modules
                </h2>
              </div>

              <div style={S.moduleCount}>
                {modules.length}{" "}
                {modules.length === 1
                  ? "module"
                  : "modules"}
              </div>
            </div>

            {modules.length === 0 ? (
              <div style={S.card}>
                <div style={S.emptyState}>
                  <div
                    style={
                      S.emptyIcon
                    }
                  >
                    📚
                  </div>

                  <h3>
                    No modules available
                  </h3>

                  <p style={S.sub}>
                    Course content hasn't
                    been added yet.
                  </p>
                </div>
              </div>
            ) : (
              [...modules]
                .sort(
                  (a, b) =>
                    a.sort_order -
                    b.sort_order
                )
                .map(
                  (module, index) => (
                    <section
                      key={module.id}
                      style={S.moduleCard}
                    >
                      <div
                        style={
                          S.moduleHeader
                        }
                      >
                        <div
                          style={
                            S.moduleNo
                          }
                        >
                          {index + 1}
                        </div>

                        <div
                          style={{
                            flex: 1,
                          }}
                        >
                          <div
                            style={
                              S.mini
                            }
                          >
                            MODULE{" "}
                            {index + 1}
                          </div>

                          <h3
                            style={
                              S.moduleTitle
                            }
                          >
                            {module.title}
                          </h3>
                        </div>

                        <div
                          style={
                            S.completedBadge
                          }
                        >
                          ● Learning
                        </div>
                      </div>

                      <div
                        style={
                          S.moduleDivider
                        }
                      />

                      <p
                        style={
                          S.moduleContent
                        }
                      >
                        {module.content ||
                          "No text content available for this module."}
                      </p>

                      {module.video_url && (
                        <a
                          href={
                            module.video_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          style={S.video}
                        >
                          <span>
                            ▶
                          </span>

                          Watch Video
                        </a>
                      )}
                    </section>
                  )
                )
            )}

            {/* ASSESSMENT */}

            <section
              style={S.assessmentCard}
            >
              <div
                style={
                  S.assessmentContent
                }
              >
                <div
                  style={
                    S.assessmentIcon
                  }
                >
                  ✓
                </div>

                <div>
                  <div
                    style={
                      S.label
                    }
                  >
                    FINAL ASSESSMENT
                  </div>

                  <h2
                    style={
                      S.assessmentTitle
                    }
                  >
                    Course Quiz
                  </h2>

                  <p
                    style={
                      S.sub
                    }
                  >
                    Test your knowledge,
                    complete the course,
                    and earn your certificate.
                  </p>
                </div>
              </div>

              <div
                style={
                  S.assessmentActions
                }
              >
                {quizzes.map(
                  (quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() =>
                        openQuiz(
                          quiz
                        )
                      }
                      disabled={
                        quizLoading
                      }
                      style={{
                        ...S.primary,
                        opacity:
                          quizLoading
                            ? 0.65
                            : 1,
                      }}
                    >
                      {quizLoading
                        ? "Loading..."
                        : "Take Quiz →"}
                    </button>
                  )
                )}
              </div>

              {quizzes.length ===
                0 && (
                <div
                  style={
                    S.noQuiz
                  }
                >
                  No quiz available
                  yet.
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

/*
 * =========================================================
 * STYLES
 * =========================================================
 */

const S: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f5f8fc 0%, #eef3f8 100%)",
    color: "#172033",
    fontFamily:
      "Inter, Arial, sans-serif",
    paddingBottom: 70,
  },

  header: {
    background:
      "linear-gradient(135deg, #193650 0%, #102a42 100%)",
    color: "white",
    padding:
      "24px clamp(22px, 5vw, 76px)",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: 20,
    boxShadow:
      "0 8px 30px rgba(15,35,55,.15)",
  },

  headerTitle: {
    margin: 0,
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: -0.7,
  },

  headerSubtitle: {
    opacity: 0.75,
    marginTop: 5,
    fontSize: 15,
    fontWeight: 600,
  },

  headerBtn: {
    padding: "13px 20px",
    border: "1px solid rgba(255,255,255,.25)",
    borderRadius: 11,
    background: "#ffffff",
    color: "#193650",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 14,
    boxShadow:
      "0 5px 15px rgba(0,0,0,.08)",
  },

  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding:
      "44px 22px",
  },

  card: {
    background: "#ffffff",
    border:
      "1px solid #e1e8ef",
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
    boxShadow:
      "0 12px 35px rgba(31,58,82,.07)",
  },

  courseHero: {
    background:
      "linear-gradient(135deg, #ffffff 0%, #f4f9fe 100%)",
    border:
      "1px solid #dbe6ef",
    borderRadius: 22,
    padding: "38px 34px",
    marginBottom: 32,
    boxShadow:
      "0 15px 40px rgba(31,58,82,.08)",
  },

  courseHeroContent: {
    maxWidth: 800,
  },

  label: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.1,
    color: "#1769aa",
    marginBottom: 9,
  },

  title: {
    margin:
      "0 0 10px",
    fontSize: 34,
    lineHeight: 1.15,
    letterSpacing: -0.7,
  },

  sub: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.65,
    fontSize: 15,
  },

  courseMeta: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 22,
  },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "9px 14px",
    borderRadius: 999,
    background: "#eaf5ff",
    color: "#1769aa",
    fontWeight: 800,
    fontSize: 13,
  },

  pillSecondary: {
    display: "inline-flex",
    alignItems: "center",
    padding: "9px 14px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#475569",
    fontWeight: 700,
    fontSize: 13,
  },

  questionTop: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },

  questionNumber: {
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: 13,
    background:
      "linear-gradient(135deg, #1769aa, #155a91)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: 17,
    boxShadow:
      "0 6px 15px rgba(23,105,170,.2)",
  },

  questionCount: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 700,
  },

  question: {
    fontSize: 22,
    lineHeight: 1.5,
    margin:
      "0 0 24px",
    letterSpacing: -0.2,
  },

  options: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  option: {
    width: "100%",
    minHeight: 68,
    display: "flex",
    alignItems: "center",
    gap: 14,
    textAlign: "left",
    padding:
      "16px 19px",
    borderRadius: 14,
    border:
      "2px solid #dbe4ec",
    background: "#ffffff",
    fontSize: 16,
    cursor: "pointer",
    fontFamily: "inherit",
    transition:
      "all .15s ease",
    color: "#26384b",
  },

  selected: {
    border:
      "2px solid #1769aa",
    background: "#eaf5ff",
    boxShadow:
      "0 6px 18px rgba(23,105,170,.12)",
    transform:
      "translateY(-1px)",
  },

  radio: {
    width: 27,
    height: 27,
    minWidth: 27,
    borderRadius: "50%",
    border:
      "2px solid #a8b5c2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 900,
  },

  radioSelected: {
    border:
      "2px solid #1769aa",
    background: "#1769aa",
    color: "#ffffff",
  },

  optionLetter: {
    minWidth: 27,
    height: 27,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    color: "#1f4e79",
    fontWeight: 900,
    fontSize: 13,
  },

  optionText: {
    flex: 1,
    lineHeight: 1.5,
  },

  progressCard: {
    background: "#ffffff",
    border:
      "1px solid #e1e8ef",
    borderRadius: 18,
    padding: "20px 24px",
    marginBottom: 20,
    boxShadow:
      "0 8px 25px rgba(31,58,82,.05)",
  },

  progressLabel: {
    fontSize: 11,
    color: "#1769aa",
    fontWeight: 900,
    letterSpacing: 1,
  },

  progressText: {
    marginTop: 5,
    color: "#475569",
    fontWeight: 700,
    fontSize: 14,
  },

  progressTrack: {
    height: 8,
    borderRadius: 99,
    background: "#e8eef4",
    overflow: "hidden",
    marginTop: 15,
  },

  progressFill: {
    height: "100%",
    borderRadius: 99,
    background:
      "linear-gradient(90deg, #1769aa, #2991d6)",
    transition:
      "width .25s ease",
  },

  submitBar: {
    background: "#ffffff",
    border:
      "1px solid #dce5ed",
    borderRadius: 18,
    padding:
      "20px 24px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
    boxShadow:
      "0 12px 30px rgba(31,58,82,.08)",
    position: "sticky",
    bottom: 18,
    zIndex: 5,
  },

  submitLabel: {
    fontSize: 11,
    color: "#1769aa",
    fontWeight: 900,
    letterSpacing: 1,
  },

  submitCount: {
    marginTop: 5,
    color: "#64748b",
    fontSize: 14,
    fontWeight: 700,
  },

  primary: {
    padding:
      "13px 22px",
    border: 0,
    borderRadius: 11,
    background:
      "linear-gradient(135deg, #1769aa, #155a91)",
    color: "white",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    boxShadow:
      "0 7px 18px rgba(23,105,170,.2)",
  },

  secondary: {
    marginLeft: 10,
    marginTop: 18,
    padding:
      "13px 22px",
    border:
      "1px solid #d4dde6",
    borderRadius: 11,
    background: "white",
    color: "#1769aa",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 15,
  },

  error: {
    background: "#fff1f2",
    color: "#b42318",
    border:
      "1px solid #fecdd3",
    borderRadius: 13,
    padding:
      "14px 18px",
    marginBottom: 20,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  errorIcon: {
    width: 23,
    height: 23,
    borderRadius: "50%",
    background: "#b42318",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 900,
  },

  resultCard: {
    background: "#ffffff",
    border:
      "1px solid #dfe7ee",
    borderRadius: 22,
    padding:
      "55px 30px",
    textAlign: "center",
    boxShadow:
      "0 18px 50px rgba(31,58,82,.09)",
  },

  scoreCircle: {
    width: 130,
    height: 130,
    borderRadius: "50%",
    margin:
      "0 auto 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 36,
    fontWeight: 900,
    boxShadow:
      "inset 0 0 0 10px rgba(255,255,255,.35)",
  },

  resultBadge: {
    display: "inline-flex",
    padding:
      "7px 13px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1,
    marginBottom: 10,
  },

  resultTitle: {
    fontSize: 28,
    margin:
      "0 0 10px",
  },

  resultText: {
    fontSize: 17,
    color: "#64748b",
    margin: 0,
  },

  certificateBox: {
    maxWidth: 680,
    margin:
      "28px auto 0",
    padding: 22,
    border:
      "1px solid #cfe4f5",
    borderRadius: 17,
    background:
      "linear-gradient(135deg, #f7fbff, #eef8ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    flexWrap: "wrap",
    textAlign: "left",
  },

  certificateIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 31,
    boxShadow:
      "0 5px 15px rgba(31,58,82,.08)",
  },

  certificateInfo: {
    flex: 1,
    minWidth: 210,
  },

  certificateTitle: {
    fontSize: 17,
    fontWeight: 900,
    color: "#17324d",
    marginBottom: 5,
  },

  certificateNumber: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  certificateNumberValue: {
    marginTop: 3,
    color: "#1769aa",
    fontSize: 13,
    fontWeight: 900,
  },

  certificatePending: {
    color: "#64748b",
    fontSize: 13,
  },

  sectionHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "end",
    gap: 20,
    margin:
      "34px 0 18px",
  },

  sectionEyebrow: {
    color: "#1769aa",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1,
  },

  sectionTitle: {
    margin:
      "4px 0 0",
    fontSize: 27,
    letterSpacing: -0.4,
  },

  moduleCount: {
    padding:
      "8px 12px",
    borderRadius: 999,
    background: "#ffffff",
    border:
      "1px solid #dce5ed",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 800,
  },

  moduleCard: {
    background: "#ffffff",
    border:
      "1px solid #e1e8ef",
    borderRadius: 19,
    padding: 28,
    marginBottom: 17,
    boxShadow:
      "0 10px 30px rgba(31,58,82,.06)",
  },

  moduleHeader: {
    display: "flex",
    gap: 15,
    alignItems: "center",
  },

  moduleNo: {
    width: 46,
    height: 46,
    minWidth: 46,
    borderRadius: 13,
    background:
      "linear-gradient(135deg, #1769aa, #155a91)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    boxShadow:
      "0 6px 16px rgba(23,105,170,.18)",
  },

  mini: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 900,
    letterSpacing: 0.9,
  },

  moduleTitle: {
    margin:
      "4px 0 0",
    fontSize: 20,
  },

  completedBadge: {
    padding:
      "7px 10px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: 11,
    fontWeight: 800,
  },

  moduleDivider: {
    height: 1,
    background: "#edf1f5",
    margin:
      "23px 0 18px",
  },

  moduleContent: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.8,
    color: "#475569",
    margin: 0,
    fontSize: 15,
  },

  video: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    padding:
      "10px 15px",
    borderRadius: 10,
    background: "#193650",
    color: "white",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 13,
  },

  assessmentCard: {
    background:
      "linear-gradient(135deg, #193650 0%, #102a42 100%)",
    color: "white",
    borderRadius: 20,
    padding: 30,
    marginTop: 30,
    boxShadow:
      "0 18px 40px rgba(15,42,66,.18)",
  },

  assessmentContent: {
    display: "flex",
    alignItems: "center",
    gap: 17,
  },

  assessmentIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    background:
      "rgba(255,255,255,.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 23,
    fontWeight: 900,
  },

  assessmentTitle: {
    margin:
      "2px 0 6px",
    fontSize: 25,
  },

  assessmentActions: {
    marginTop: 24,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  noQuiz: {
    marginTop: 20,
    color: "#cbd5e1",
    fontSize: 14,
  },

  loadingCard: {
    background: "#ffffff",
    border:
      "1px solid #e1e8ef",
    borderRadius: 18,
    padding: 30,
    display: "flex",
    alignItems: "center",
    gap: 15,
    color: "#334155",
    boxShadow:
      "0 10px 30px rgba(31,58,82,.06)",
  },

  loadingSpinner: {
    fontSize: 28,
    color: "#1769aa",
  },

  loadingText: {
    marginTop: 3,
    color: "#94a3b8",
    fontSize: 13,
  },

  emptyState: {
    textAlign: "center",
    padding: 30,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
};

export default CourseLearning;