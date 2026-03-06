import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, ArrowRight, Loader2, BookOpen, Send, RotateCcw, ArrowLeft, TrendingUp, BarChart, Trophy, Zap, Info, Download } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

/* ── helpers ──────────────────────────────────────────────────── */
const LETTERS = ['A', 'B', 'C', 'D']

const QuizEngine = ({ unit = null, topic = null, sessionQuestions = null, sessionId = null, onFinish = null, onComplete = null, onAnswerChange = null }) => {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentStep, setCurrentStep] = useState(0)
    // answers[i] = selected option id or null
    const [answers, setAnswers] = useState([])
    const [reviewData, setReviewData] = useState([])
    const [finished, setFinished] = useState(false)
    const [score, setScore] = useState(0)
    const [attemptId, setAttemptId] = useState(null)
    const [timeLeft, setTimeLeft] = useState(30)
    const [showConfirm, setShowConfirm] = useState(false)
    const [pendingAnswer, setPendingAnswer] = useState(null)
    const timerRef = useRef(null)
    const { user } = useAuth()

    /* Load questions */
    useEffect(() => {
        if (sessionQuestions) {
            setQuestions(sessionQuestions)
            setAnswers(new Array(sessionQuestions.length).fill(null))
            setLoading(false)
        } else {
            const params = {}
            if (unit) params.unit = unit
            if (topic) params.topic = topic

            api.get('/api/quizzes', { params }).then(res => {
                setQuestions(res.data)
                setAnswers(new Array(res.data.length).fill(null))
            }).finally(() => setLoading(false))
        }
    }, [unit, topic])

    /* Per-question countdown timer */
    useEffect(() => {
        clearInterval(timerRef.current)
        if (finished || loading || questions.length === 0) return
        setTimeLeft(30)
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current)
                    // auto-advance on timeout if not answered
                    setAnswers(prev => {
                        if (prev[currentStep] !== null) return prev
                        const next = [...prev]
                        next[currentStep] = '__timeout__'
                        return next
                    })
                    return 0
                }
                return t - 1
            })
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [currentStep, finished, loading])

    const isAnswered = idx => answers[idx] !== null
    const answeredCount = answers.filter(a => a !== null).length

    const handleSelect = (optId) => {
        if (answers[currentStep] !== null) return
        setPendingAnswer(optId)
    }

    const handleConfirm = () => {
        if (pendingAnswer === null || answers[currentStep] !== null) return
        clearInterval(timerRef.current)
        const updated = [...answers]
        updated[currentStep] = pendingAnswer
        setAnswers(updated)
        setPendingAnswer(null)
        if (onAnswerChange) onAnswerChange(updated)
    }

    const goToQuestion = (idx) => setCurrentStep(idx)

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setPendingAnswer(null)
            setCurrentStep(currentStep + 1)
        }
    }

    /* Submit only answered questions */
    const handleSubmit = async (forceAll = false) => {
        setShowConfirm(false)
        setLoading(true)
        const unanswered = answers.filter(a => a === null).length
        const toSubmit = []
        const review = []
        let correct = 0

        questions.forEach((q, i) => {
            const sel = answers[i]
            if (!forceAll && sel === null) return // skip unanswered unless forced
            if (sel === null) return // always skip null
            const selId = sel === '__timeout__' ? '' : sel
            const isCorrect = selId === q.correct_option_id
            if (isCorrect) correct++
            toSubmit.push({ mcq_id: q.id, selected_option_id: selId, time_taken: 30 })
            review.push({
                question: q.question,
                options: q.options,
                correct_option_id: q.correct_option_id,
                selected_option_id: sel,
                explanation: q.explanation,
                is_correct: isCorrect
            })
        })

        setScore(correct)
        setReviewData(review)

        try {
            const payload = {
                user_id: user.id,
                topic: questions[0]?.topic || 'General',
                mode: 'practice',
                submissions: toSubmit
            }
            const res = await api.post('/api/quizzes/submit', payload)
            setAttemptId(res.data.attempt_id)
        } catch (_) { }
        finally {
            setLoading(false)
            setFinished(true)
            if (onFinish) onFinish({ score: correct, total: toSubmit.length })
        }
    }

    const handleDownload = async () => {
        if (!attemptId) return
        const res = await api.get(`/api/quizzes/export/${attemptId}`, { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `ManageMind_Quiz_${attemptId}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
    }

    if (loading) return <div className="loading-state"><Loader2 className="spinner" /> Loading Quiz...</div>
    if (questions.length === 0) return <div className="loading-state">No questions available.</div>

    /* ── Results Screen ─────────────────────────────────────── */
    if (finished) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="quiz-results-premium">
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="results-hero-premium"
                >
                    <div className="hero-glow" />
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="results-emoji-large"
                    >
                        {score / reviewData.length > 0.8 ? '🏆' : '🎉'}
                    </motion.div>
                    <h2 className="premium-title">Quiz Completed!</h2>
                    <p className="premium-subtitle">Expert analysis of your performance is ready</p>
                </motion.div>

                <div className="results-summary-premium">
                    {[
                        { label: 'Total Score', value: `${score} / ${reviewData.length}`, icon: <Trophy size={20} /> },
                        { label: 'Accuracy', value: `${reviewData.length > 0 ? Math.round((score / reviewData.length) * 100) : 0}%`, icon: <TrendingUp size={20} /> },
                        { label: 'Attempted', value: `${reviewData.length} / ${questions.length}`, icon: <CheckCircle size={20} /> }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            className="premium-stat-card"
                        >
                            <div className="stat-icon-box">{stat.icon}</div>
                            <div className="stat-info">
                                <span className="stat-label-modern">{stat.label}</span>
                                <span className="stat-value-modern">{stat.value}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="performance-premium-card"
                >
                    <div className="card-header-modern">
                        <Zap className="text-amber-500" size={24} />
                        <h3>Performance Analysis</h3>
                    </div>

                    <div className="analysis-grid-premium">
                        <div className="analysis-text-box">
                            <h4 className="analysis-heading">Insights</h4>
                            <p className="analysis-desc">
                                {score / reviewData.length > 0.8
                                    ? "Spectacular work! You've mastered these concepts with high precision. Your understanding of the core principles is exceptionally strong."
                                    : score / reviewData.length > 0.5
                                        ? "Solid foundation. You've grasped the main points, but a few nuances still require attention. Focus on the review section below to bridge the gaps."
                                        : "You're building momentum. While some areas were challenging, this is a great starting point for deeper study. Reviewing the explanations is key to your growth."
                                }
                            </p>
                        </div>

                        <div className="analysis-visual-box">
                            <div className="performance-gauge-container">
                                <div className="gauge-header">
                                    <span>Proficiency Level</span>
                                    <span className="gauge-percent">{reviewData.length > 0 ? Math.round((score / reviewData.length) * 100) : 0}%</span>
                                </div>
                                <div className="premium-progress-track">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${reviewData.length > 0 ? Math.round((score / reviewData.length) * 100) : 0}%` }}
                                        transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                                        className="premium-progress-fill"
                                    />
                                </div>
                                <p className="gauge-footer">Real-time accuracy based on this attempt</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="results-review-premium">
                    <h3 className="review-heading-premium">
                        <BookOpen size={20} className="text-indigo-600" />
                        Detailed Explanations
                    </h3>
                    {reviewData.map((ans, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className={`review-card-modern ${ans.is_correct ? 'is-correct' : 'is-wrong'}`}
                        >
                            <div className="review-card-header">
                                <span className="q-badge">Question {idx + 1}</span>
                                {ans.is_correct ?
                                    <span className="status-chip correct">Correct</span> :
                                    <span className="status-chip wrong">Incorrect</span>
                                }
                            </div>
                            <p className="review-question-text">{ans.question}</p>

                            <div className="review-options-grid">
                                {ans.options.map((opt, oi) => (
                                    <div
                                        key={opt.id}
                                        className={`review-option-pill ${opt.id === ans.correct_option_id ? 'correct-pill' :
                                            opt.id === ans.selected_option_id ? 'wrong-pill' : 'idle-pill'
                                            }`}
                                    >
                                        <div className="pill-letter">{LETTERS[oi]}</div>
                                        <span className="pill-text">{opt.text}</span>
                                        {opt.id === ans.correct_option_id && <CheckCircle size={14} className="ml-auto text-emerald-500" />}
                                        {opt.id === ans.selected_option_id && opt.id !== ans.correct_option_id && <XCircle size={14} className="ml-auto text-rose-500" />}
                                    </div>
                                ))}
                            </div>

                            <div className="explanation-luxury">
                                <div className="exp-icon"><Info size={16} /></div>
                                <div className="exp-content">
                                    <h5>Insightful Explanation</h5>
                                    <p>{ans.explanation}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="results-actions-premium mt-12 pb-12 overflow-visible">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-premium-action main"
                        onClick={() => onComplete ? onComplete() : window.location.reload()}
                    >
                        <RotateCcw size={18} /> {onComplete ? 'Back to Library' : 'Retake Quiz'}
                    </motion.button>
                    {attemptId && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-premium-action sub"
                            onClick={handleDownload}
                        >
                            <Download size={18} /> Download Results PDF
                        </motion.button>
                    )}
                </div>
            </motion.div>
        )
    }

    const q = questions[currentStep]
    const currentAnswer = answers[currentStep]
    const timerPct = (timeLeft / 30) * 100

    /* ── Quiz Layout ────────────────────────────────────────── */
    return (
        <div className="quiz-layout">

            {/* ── Sidebar ── */}
            <aside className="quiz-sidebar">
                <div className="sidebar-title">Questions</div>
                <div className="q-dot-grid">
                    {questions.map((_, i) => (
                        <button
                            key={i}
                            className={`q-dot ${i === currentStep ? 'active' : ''} ${answers[i] !== null ? 'done' : ''}`}
                            onClick={() => goToQuestion(i)}
                            title={`Q${i + 1}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <div className="sidebar-divider" />

                <div className="sidebar-stats">
                    <div className="sstat">
                        <span className="sstat-num answered">{answeredCount}</span>
                        <span className="sstat-label">Answered</span>
                    </div>
                    <div className="sstat">
                        <span className="sstat-num unanswered">{questions.length - answeredCount}</span>
                        <span className="sstat-label">Remaining</span>
                    </div>
                </div>

                <button
                    className="submit-sidebar-btn"
                    onClick={() => answeredCount < questions.length ? setShowConfirm(true) : handleSubmit()}
                    disabled={answeredCount === 0}
                >
                    <Send size={16} />
                    Submit Quiz
                </button>

                <button
                    className="submit-sidebar-btn"
                    style={{ marginTop: '12px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fda4af' }}
                    onClick={() => {
                        if (window.confirm('Are you sure you want to end the test? Your progress will not be saved.')) {
                            if (typeof onComplete === 'function') {
                                onComplete()
                            } else {
                                window.location.reload()
                            }
                        }
                    }}
                >
                    <ArrowLeft size={16} />
                    End Test
                </button>
            </aside>

            {/* ── Main Quiz Area ── */}
            <div className="quiz-main">
                {/* Top progress bar */}
                <div className="top-progress-bar">
                    <div className="top-progress-fill" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
                </div>

                <div className="quiz-header">
                    {/* Timer */}
                    <div className="timer-wrap">
                        <svg width="56" height="56" className="timer-svg">
                            <circle cx="28" cy="28" r="24" fill="none" stroke="#e8e8f0" strokeWidth="4" />
                            <motion.circle
                                cx="28" cy="28" r="24"
                                fill="none"
                                stroke={timeLeft <= 10 ? '#ef4444' : '#7c3aed'}
                                strokeWidth="4"
                                strokeDasharray="150.8"
                                animate={{ strokeDashoffset: 150.8 - (150.8 * timerPct) / 100 }}
                                transform="rotate(-90 28 28)"
                            />
                        </svg>
                        <span className="timer-text" style={{ color: timeLeft <= 10 ? '#ef4444' : '#7c3aed' }}>{timeLeft}s</span>
                    </div>
                    <div className="hdr-center">
                        <span className="question-counter">Question {currentStep + 1} of {questions.length}</span>
                        <span className="topic-chip">{q.topic ? `Unit ${q.topic}` : ''}</span>
                    </div>
                    <div className="score-badge">✓ {answeredCount}/{questions.length}</div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ x: 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -60, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="question-card"
                    >
                        <h3 className="question-text">{q.question}</h3>

                        <div className="options-list">
                            {q.options.map((opt, oi) => {
                                let state = 'idle'
                                if (answers[currentStep] !== null) {
                                    if (opt.id === q.correct_option_id) state = 'correct'
                                    else if (opt.id === answers[currentStep]) state = 'wrong'
                                    else state = 'dim'
                                } else if (pendingAnswer === opt.id) {
                                    state = 'pending'
                                }

                                return (
                                    <motion.button
                                        key={opt.id}
                                        whileHover={answers[currentStep] === null ? { x: 6 } : {}}
                                        whileTap={answers[currentStep] === null ? { scale: 0.98 } : {}}
                                        onClick={() => handleSelect(opt.id)}
                                        className={`option-btn-v2 state-${state}`}
                                        disabled={answers[currentStep] !== null}
                                    >
                                        <span className="opt-letter">{LETTERS[oi]}</span>
                                        <span className="opt-text">{opt.text}</span>
                                        {state === 'correct' && <CheckCircle size={18} className="opt-icon" />}
                                        {state === 'wrong' && <XCircle size={18} className="opt-icon" />}
                                        {state === 'pending' && <div className="pending-dot" />}
                                    </motion.button>
                                )
                            })}
                        </div>

                        <div className="quiz-footer mt-8">
                            {currentAnswer === null && pendingAnswer !== null && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex justify-end"
                                >
                                    <button
                                        className="btn-primary confirm-btn"
                                        onClick={handleConfirm}
                                    >
                                        Confirm Answer
                                    </button>
                                </motion.div>
                            )}

                            {currentAnswer !== null && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between w-full"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={currentAnswer === q.correct_option_id ? 'fb-correct' : 'fb-wrong'}>
                                            {currentAnswer === q.correct_option_id ? '✅ Correct' : '❌ Incorrect'}
                                        </span>
                                    </div>

                                    {currentStep < questions.length - 1 && (
                                        <button className="btn-next" onClick={handleNext}>
                                            Next Question <ArrowRight size={16} />
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Confirm Submit Dialog ── */}
            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="modal-box"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3>Submit Quiz?</h3>
                        <p>You have <strong>{questions.length - answeredCount}</strong> unanswered question{questions.length - answeredCount !== 1 ? 's' : ''}. Unanswered questions will not be counted.</p>
                        <div className="modal-actions">
                            <button className="btn-primary" onClick={() => handleSubmit(false)}>Submit Anyway</button>
                            <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Go Back</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

export default QuizEngine
