import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../live_premium.css'
import {
    Users, Play, Clock, Trophy, Loader2, CheckCircle, XCircle,
    ArrowRight, Send, Crown, Star, Zap, BookOpen, Settings, Download,
    Hash, ChevronRight
} from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import QuizEngine from './QuizEngine'

/* ── Syllabus Points for Advanced Mode ──────────────────────────────────── */
const SYLLABUS_POINTS = [
    { id: 'u1-1', label: '1.1 – Concept of Management & Nature' },
    { id: 'u1-2', label: '1.2 – Evolution of Management Thought' },
    { id: 'u1-3', label: '1.3 – Planning & Decision Making' },
    { id: 'u2-1', label: '2.1 – Principles of Organizing' },
    { id: 'u2-2', label: '2.2 – Delegation & Decentralization' },
    { id: 'u2-3', label: '2.3 – Staffing Process & Recruitment' },
    { id: 'u3-1', label: '3.1 – Leadership Styles & Qualities' },
    { id: 'u3-2', label: '3.2 – Motivation Theories (Maslow/Herzberg)' },
    { id: 'u4-1', label: '4.1 – Control Process & Techniques' },
    { id: 'u5-1', label: '5.1 – Marketing & HR Management' },
    { id: 'u5-2', label: '5.2 – Financial & Operations Management' },
]

const LiveSessionManager = () => {
    const { user } = useAuth()
    const [mode, setMode] = useState('select')
    const [sessionData, setSessionData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [joinCode, setJoinCode] = useState('')
    const [leaderboard, setLeaderboard] = useState(null)
    const [myScore, setMyScore] = useState(null)
    const [hostSessions, setHostSessions] = useState([])
    const pollingRef = useRef(null)

    /* ── Polling ─────────────────────────────────────────────────────────── */
    useEffect(() => {
        clearInterval(pollingRef.current)
        if (!sessionData?.id) return
        if (!['host_waiting', 'student_waiting', 'host_active'].includes(mode)) return

        pollingRef.current = setInterval(async () => {
            try {
                const res = await api.get(`/api/live/${sessionData.id}/status`)
                setSessionData(prev => ({ ...prev, ...res.data }))
                if (mode === 'student_waiting' && res.data.status === 'active') {
                    setMode('student_active')
                }
            } catch (e) { /* ignore */ }
        }, 3000)

        return () => clearInterval(pollingRef.current)
    }, [mode, sessionData?.id])

    useEffect(() => {
        if (mode === 'select' && user) {
            fetchHostSessions()
        }
    }, [mode, user])

    const fetchHostSessions = async () => {
        try {
            const res = await api.get(`/api/live/host/${user.id}`)
            setHostSessions(res.data)
        } catch { /* ignore */ }
    }

    /* ── Handlers ────────────────────────────────────────────────────────── */
    const handleCreateBasicInteractive = async ({ unitId, topic, duration }) => {
        setLoading(true); setError('')
        try {
            const res = await api.post(
                `/api/live/create?unit=${unitId}&topic=${encodeURIComponent(topic)}&duration_minutes=${duration}&host_id=${user.id}`
            )
            setSessionData(res.data)
            setMode('host_waiting')
        } catch { setError('Failed to create session.') }
        finally { setLoading(false) }
    }

    const handleCreateAdvanced = async (selections) => {
        setLoading(true); setError('')
        try {
            const res = await api.post('/api/live/create-advanced', {
                host_id: user.id,
                duration_minutes: selections.duration,
                syllabus_selections: selections.points
            })
            setSessionData(res.data)
            setMode('host_waiting')
        } catch { setError('Failed to create advanced session.') }
        finally { setLoading(false) }
    }

    const handleJoin = async (e) => {
        e.preventDefault()
        setLoading(true); setError('')
        try {
            const res = await api.post(`/api/live/join/${joinCode.toUpperCase()}?user_id=${user.id}`)
            const statusRes = await api.get(`/api/live/${res.data.session_id}/status`)
            setSessionData({ ...statusRes.data, id: res.data.session_id })
            if (statusRes.data.status === 'active') setMode('student_active')
            else setMode('student_waiting')
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid code or session unavailable')
        }
        finally { setLoading(false) }
    }

    const handleStartSession = async () => {
        setLoading(true)
        try {
            await api.post(`/api/live/${sessionData.id}/start?host_id=${user.id}`)
            setSessionData(prev => ({ ...prev, status: 'active' }))
            setMode('host_active')
        } catch { setError('Failed to start session.') }
        finally { setLoading(false) }
    }

    const handleEndSession = async () => {
        setLoading(true)
        try {
            await api.post(`/api/live/${sessionData.id}/end?host_id=${user.id}`)
            await fetchLeaderboard()
            setMode('leaderboard')
        } catch { setError('Failed to end session.') }
        finally { setLoading(false) }
    }

    const handleStudentQuizFinish = async ({ score, total, submissions }) => {
        try {
            const res = await api.post(`/api/live/${sessionData.id}/submit`, {
                user_id: user.id,
                answers: submissions.map(s => ({ mcq_id: s.mcq_id, selected_option_id: s.selected_option_id })),
                time_taken_seconds: submissions.reduce((acc, s) => acc + (s.time_taken || 0), 0)
            })
            setMyScore({ score: res.data.score, total: res.data.total })
            setMode('student_result')
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Submission failed'
            setError(errorMsg)
            // Still show local result but with error
            setMyScore({ score, total, sync_error: errorMsg })
            setMode('student_result')
        }
    }

    const fetchLeaderboard = async () => {
        try {
            const res = await api.get(`/api/live/${sessionData.id}/leaderboard`)
            setLeaderboard(res.data)
        } catch { setLeaderboard(null) }
    }

    const reset = () => {
        clearInterval(pollingRef.current)
        setMode('select')
        setSessionData(null)
        setLeaderboard(null)
        setMyScore(null)
        setError('')
        setJoinCode('')
    }

    /* ══════════════════════════════════════════════════════════════════════
       SCREENS
    ══════════════════════════════════════════════════════════════════════ */

    /* ── Mode Select ─────────────────────────────────────────────────────── */
    if (mode === 'select') return (
        <div className="live-page">
            <div className="live-hero">
                <Zap size={32} className="live-icon" />
                <h2>Live Competition</h2>
                <p>Host an exam or join one with a code</p>
            </div>
            <div className="live-mode-cards">
                <motion.div whileHover={{ y: -6 }} className="live-mode-card host-card" onClick={() => setMode('host_select')}>
                    <Crown size={36} />
                    <h3>Host an Exam</h3>
                    <p>Create a session, share the code, control the test</p>
                    <span className="mode-tag">Any user can host</span>
                </motion.div>
                <motion.div whileHover={{ y: -6 }} className="live-mode-card join-card" onClick={() => setMode('student_join')}>
                    <Users size={36} />
                    <h3>Join with Code</h3>
                    <p>Enter the 6-character code to join a live session</p>
                    <span className="mode-tag">Students</span>
                </motion.div>
            </div>

            {hostSessions.length > 0 && (
                <div className="host-history mt-12 w-full max-w-4xl mx-auto">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Clock size={20} /> Your Recent Sessions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {hostSessions.map((s, i) => (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="session-card-premium"
                                onClick={() => {
                                    setSessionData(s)
                                    if (s.status === 'waiting') setMode('host_waiting')
                                    else if (s.status === 'active') setMode('host_active')
                                    else {
                                        fetchLeaderboard()
                                        setMode('leaderboard')
                                    }
                                }}
                            >
                                <div className="session-icon-box">
                                    <Hash size={24} />
                                </div>
                                <div className="session-info-main">
                                    <div className="session-id-row">
                                        <span className="session-id-text">{s.exam_id}</span>
                                        <div className={`status-badge-premium ${s.status}`}>
                                            {s.status === 'active' && <span className="pulse-indicator"></span>}
                                            {s.status.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="session-topic-text">
                                        <BookOpen size={14} /> {s.topic}
                                    </div>
                                </div>
                                <div className="session-meta-right">
                                    <div className="participant-count-pill">
                                        <Users size={14} /> {s.participants_count || 0}
                                    </div>
                                    <div className="chevron-box">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )

    /* ── Host – Choose Basic vs Advanced ─────────────────────────────────── */
    if (mode === 'host_select') return (
        <div className="live-page">
            <div className="live-hero">
                <Crown size={28} className="live-icon" />
                <h2>Create a Session</h2>
                <p>Choose how you want to set up the quiz</p>
            </div>
            <div className="live-mode-cards">
                <motion.div whileHover={{ y: -6 }} className="live-mode-card" onClick={() => setMode('host_create_basic')}>
                    <BookOpen size={32} />
                    <h3>Basic Mode</h3>
                    <p>Quickly start a session using official syllabus units and topics</p>
                </motion.div>
                <motion.div whileHover={{ y: -6 }} className="live-mode-card advanced-card" onClick={() => setMode('host_create_advanced')}>
                    <Settings size={32} />
                    <h3>Teacher Advanced Mode</h3>
                    <p>Customize your exam by selecting specific syllabus points for AI-powered generation</p>
                    <span className="mode-tag ai-tag">✨ AI Powered</span>
                </motion.div>
            </div>
            <button className="btn-back" onClick={() => setMode('select')}>← Back</button>
        </div>
    )

    /* ── Basic Create Form ────────────────────────────────────────────────── */
    if (mode === 'host_create_basic') return (
        <BasicSessionForm
            user={user}
            loading={loading}
            onSubmit={handleCreateBasicInteractive}
            onBack={() => setMode('host_select')}
        />
    )

    /* ── Advanced Create Form ─────────────────────────────────────────────── */
    if (mode === 'host_create_advanced') return (
        <AdvancedSessionForm
            onSubmit={handleCreateAdvanced}
            onBack={() => setMode('host_select')}
            loading={loading}
            error={error}
        />
    )

    /* ── Host Waiting Room ────────────────────────────────────────────────── */
    if (mode === 'host_waiting' && sessionData) return (
        <div className="live-lobby">
            <div className="exam-code-display">
                <p className="code-label">Share this code with students</p>
                <div className="code-box">{sessionData.exam_id}</div>
                <p className="code-hint">Students go to Live Class → Join with Code</p>
            </div>
            <div className="lobby-stats">
                <div className="lobby-stat">
                    <Users size={24} />
                    <span className="ls-num">{sessionData.participants_count || 0}</span>
                    <span className="ls-label">Joined</span>
                </div>
                <div className="lobby-stat">
                    <Clock size={24} />
                    <span className="ls-num">{sessionData.duration_minutes}m</span>
                    <span className="ls-label">Duration</span>
                </div>
                {sessionData.has_ai_questions && (
                    <div className="lobby-stat">
                        <Star size={24} />
                        <span className="ls-num">{sessionData.question_count || '?'}</span>
                        <span className="ls-label">AI Questions</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center gap-4 mt-8">
                <button className="btn-primary" onClick={handleStartSession} disabled={loading}>
                    {loading ? <Loader2 className="spinner" /> : <><Play size={20} /> Start Exam Now</>}
                </button>
                <button className="btn-back" onClick={reset}>Cancel Session</button>
            </div>
        </div>
    )

    /* ── Host Active (monitoring) ─────────────────────────────────────────── */
    if (mode === 'host_active') return (
        <div className="live-lobby">
            <div className="glass-card p-10 text-center">
                <div className="active-badge mb-6" style={{ background: '#fee2e2', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                    <span className="pulse-dot" style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
                    LIVE
                </div>
                <h2 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Exam in Progress</h2>
                <p className="hero-subtitle">Students are answering questions. End the session when time is up.</p>

                <div className="lobby-stats my-10">
                    <div className="lobby-stat glass-card">
                        <Users size={32} color="var(--primary)" />
                        <span className="ls-num">{sessionData?.participants_count || 0}</span>
                        <span className="ls-label">Participants</span>
                    </div>
                    <div className="lobby-stat glass-card">
                        <Clock size={32} color="var(--primary)" />
                        <span className="ls-num">{sessionData?.duration_minutes}m</span>
                        <span className="ls-label">Duration</span>
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <button className="btn-danger" onClick={handleEndSession} disabled={loading}>
                        {loading ? <Loader2 className="spinner" /> : 'End Session & View Results'}
                    </button>
                </div>
            </div>
        </div>
    )

    /* ── Student Join Form ────────────────────────────────────────────────── */
    if (mode === 'student_join') return (
        <div className="live-form-wrap">
            <div className="live-form-card text-center">
                <Users size={40} className="mx-auto mb-4 text-indigo-500" />
                <h3>Join Live Exam</h3>
                {error && <p className="error-text">{error}</p>}
                <form onSubmit={handleJoin} className="live-form">
                    <input
                        value={joinCode}
                        onChange={e => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="live-input code-input"
                        maxLength={6}
                        required
                    />
                    <button type="submit" className="btn-primary" disabled={loading || joinCode.length < 3}>
                        {loading ? <Loader2 className="spinner" size={18} /> : 'Join Waiting Room'}
                    </button>
                </form>
                <button className="btn-back" onClick={reset}>← Back</button>
            </div>
        </div>
    )

    /* ── Student Waiting Room ─────────────────────────────────────────────── */
    if (mode === 'student_waiting') return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="live-lobby text-center">
            <div className="waiting-spinner">
                <div className="pulse-ring" />
                <Loader2 size={40} className="spinner text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold mt-6 mb-2">Waiting for Host...</h2>
            <p className="text-gray-500">The exam will begin when the host starts it</p>
            {(sessionData?.participants_count > 0) && (
                <div className="lobby-stats justify-center mt-8">
                    <div className="lobby-stat" style={{ maxWidth: '180px', padding: '1.5rem' }}>
                        <Users size={24} color="var(--primary)" />
                        <span className="ls-num" style={{ fontSize: '1.8rem' }}>{sessionData.participants_count}</span>
                        <span className="ls-label">in room</span>
                    </div>
                </div>
            )}
        </motion.div>
    )

    /* ── Student Active (taking quiz) ─────────────────────────────────────── */
    if (mode === 'student_active' && sessionData) return (
        <LiveQuizWrapper
            sessionId={sessionData.id}
            duration={sessionData.duration_minutes}
            onFinish={handleStudentQuizFinish}
        />
    )

    /* ── Student Result ───────────────────────────────────────────────────── */
    if (mode === 'student_result') return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="live-lobby text-center">
            <div className="result-emoji">
                {myScore && myScore.score / myScore.total >= 0.7 ? '🏆' : '📊'}
            </div>
            <h2 className="text-3xl font-bold mb-2">Submitted!</h2>
            <p className="text-gray-500 mb-6">Your answers have been recorded</p>
            {myScore && (
                <div className="results-summary">
                    <div className="stat-card">
                        <span className="stat-label">Score</span>
                        <span className="stat-value">{myScore.score} / {myScore.total}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Accuracy</span>
                        <span className="stat-value">{myScore.total ? Math.round((myScore.score / myScore.total) * 100) : 0}%</span>
                    </div>
                </div>
            )}
            {myScore?.sync_error && (
                <p className="text-red-400 text-xs mt-2">Error syncing with server: {myScore.sync_error}</p>
            )}
            <p className="text-gray-400 text-sm mt-4">Waiting for host to close session & release leaderboard</p>
            <button className="btn-back mt-6" onClick={reset}>Return to Home</button>
        </motion.div>
    )

    /* ── Leaderboard (host view) ──────────────────────────────────────────── */
    if (mode === 'leaderboard') return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="live-leaderboard">
            <div className="lb-header">
                <Trophy size={60} className="lb-trophy" />
                <h2>Final Leaderboard</h2>
                <div className="flex flex-col items-center gap-2 mt-2">
                    <p className="text-gray-500 font-semibold">{leaderboard?.session?.exam_id} • {leaderboard?.session?.topic}</p>
                    <a
                        href={`${api.defaults.baseURL}/api/live/${sessionData.id}/export`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-download-pdf mt-2"
                    >
                        <Download size={18} /> Download Results PDF
                    </a>
                </div>
            </div>

            {leaderboard?.leaderboard?.length > 0 ? (
                <div className="lb-table">
                    <div className="lb-row lb-head">
                        <span>Rank</span>
                        <span>Student Name</span>
                        <span className="text-center">Score</span>
                        <span className="text-right">Time</span>
                    </div>
                    {leaderboard.leaderboard.map((row, i) => (
                        <motion.div
                            key={row.user_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`lb-row ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}
                        >
                            <span className="lb-rank">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                            </span>
                            <span className="lb-name">{row.full_name}</span>
                            <span className="lb-score text-center">{row.score} pts</span>
                            <span className="lb-time text-right">{row.time_taken_seconds}s</span>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="lb-empty-state">
                    <div className="lb-empty-icon">
                        <Users size={48} />
                    </div>
                    <h3>No Submissions Yet</h3>
                    <p>Waiting for students to complete and submit their exams.</p>
                </div>
            )}

            <div className="lb-footer">
                <button className="btn-primary btn-new-session" onClick={reset}>
                    <Zap size={20} /> Start New Session
                </button>
            </div>
        </motion.div>
    )

    return null
}

/* ── Advanced Session Form ─────────────────────────────────────────────── */
const AdvancedSessionForm = ({ onSubmit, onBack, loading, error }) => {
    const [selected, setSelected] = useState({})
    const [duration, setDuration] = useState(30)

    const toggle = (id) => setSelected(prev => {
        const n = { ...prev }
        if (n[id]) delete n[id]
        else n[id] = 3 // default 3 questions
        return n
    })

    const setCount = (id, val) => setSelected(prev => ({ ...prev, [id]: Math.max(1, Math.min(15, Number(val))) }))

    const handleSubmit = () => {
        const points = Object.entries(selected).map(([id, count]) => ({
            point: SYLLABUS_POINTS.find(p => p.id === id)?.label || id,
            count
        }))
        if (points.length === 0) return alert('Select at least one syllabus point')
        onSubmit({ duration, points })
    }

    const totalQ = Object.values(selected).reduce((a, b) => a + b, 0)

    return (
        <div className="live-form-wrap">
            <div className="live-form-card advanced-form">
                <div className="adv-header">
                    <Settings size={24} />
                    <h3>Teacher Advanced Mode</h3>
                    <p className="adv-sub">AI generates questions from your selected syllabus points</p>
                </div>
                {error && <p className="error-text">{error}</p>}
                <div className="adv-points">
                    {SYLLABUS_POINTS.map(p => (
                        <div key={p.id} className={`adv-point ${selected[p.id] !== undefined ? 'selected' : ''}`}>
                            <label className="adv-check">
                                <input
                                    type="checkbox"
                                    checked={selected[p.id] !== undefined}
                                    onChange={() => toggle(p.id)}
                                />
                                <span className="adv-label">{p.label}</span>
                            </label>
                            {selected[p.id] !== undefined && (
                                <div className="adv-count">
                                    <button onClick={() => setCount(p.id, selected[p.id] - 1)}>−</button>
                                    <span>{selected[p.id]}Q</span>
                                    <button onClick={() => setCount(p.id, selected[p.id] + 1)}>+</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="adv-footer">
                    <div className="adv-total">
                        Total Questions: <strong>{totalQ}</strong>
                    </div>
                    <div className="adv-duration">
                        <label>Duration</label>
                        <div className="dur-controls">
                            <button onClick={() => setDuration(d => Math.max(5, d - 5))}>−</button>
                            <span>{duration} min</span>
                            <button onClick={() => setDuration(d => Math.min(120, d + 5))}>+</button>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading || totalQ === 0}>
                        {loading ? <><Loader2 className="spinner" size={16} /> Generating questions...</> : <><Zap size={16} /> Create AI Session</>}
                    </button>
                </div>
                <button className="btn-back" onClick={onBack}>← Back</button>
            </div>
        </div>
    )
}

/* ── Live Quiz Wrapper (student during active session) ─────────────────── */
const LiveQuizWrapper = ({ sessionId, duration, onFinish }) => {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [timeLeft, setTimeLeft] = useState(duration * 60)
    const [answers, setAnswers] = useState([])

    useEffect(() => {
        api.get(`/api/live/${sessionId}/questions`)
            .then(res => {
                setQuestions(res.data)
                setAnswers(new Array(res.data.length).fill(null))
            })
            .finally(() => setLoading(false))
    }, [sessionId])

    // Session-level countdown
    useEffect(() => {
        if (loading) return
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(t)
                    autoSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(t)
    }, [loading])

    const autoSubmit = () => {
        const subs = answers.map((a, i) => ({
            mcq_id: questions[i]?.id,
            selected_option_id: a || '',
            time_taken: 30
        }))
        let score = 0
        subs.forEach((s, i) => {
            if (s.selected_option_id === questions[i]?.correct_option_id) score++
        })
        onFinish({ score, total: subs.filter(s => s.selected_option_id).length, submissions: subs.filter(s => s.selected_option_id) })
    }

    const handleEarlyExit = () => {
        // Just submit whatever was done without waiting
        autoSubmit()
    }

    if (loading) return <div className="loading-state"><Loader2 className="spinner" />Loading exam questions...</div>

    const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
    const ss = String(timeLeft % 60).padStart(2, '0')

    return (
        <div>
            <div className="live-session-timer">
                <Clock size={16} />
                <span>Session ends in: <strong className={timeLeft < 120 ? 'text-red-500' : ''}>{mm}:{ss}</strong></span>
            </div>
            <QuizEngine
                sessionQuestions={questions}
                sessionId={sessionId}
                onAnswerChange={(updated) => setAnswers(updated)}
                onFinish={({ score, total }) => {
                    const subs = answers.map((a, i) => ({
                        mcq_id: questions[i]?.id,
                        selected_option_id: a || '',
                        time_taken: 30
                    })).filter(s => s.selected_option_id)
                    onFinish({ score, total, submissions: subs })
                }}
                onComplete={handleEarlyExit}
            />
        </div>
    )
}

export default LiveSessionManager

/* ── Basic Create Form (extracted to fix Hook rules) ─────────────────────── */
const BasicSessionForm = ({ onSubmit, onBack, loading }) => {
    const [selUnit, setSelUnit] = useState(null)
    const [selTopic, setSelTopic] = useState(null)
    const [duration, setDuration] = useState(20)

    const handleFinalCreate = () => {
        if (!selUnit) return alert('Please select a unit')
        onSubmit({ unitId: selUnit.id, topic: selTopic || 'Full Unit', duration })
    }

    return (
        <div className="live-selection-panel">
            <header className="page-header">
                <h1>Live Class Arena</h1>
                <p>Join or host real-time competitive practice sessions.</p>
            </header>

            <AnimatePresence mode="wait">
                {!selUnit ? (
                    <motion.div key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="unit-selection-mini">
                        <div className="mini-grid">
                            {[
                                { id: 'unit1', title: 'Unit 1' },
                                { id: 'unit2', title: 'Unit 2' },
                                { id: 'unit3', title: 'Unit 3' },
                                { id: 'unit4', title: 'Unit 4' },
                                { id: 'unit5', title: 'Unit 5' }
                            ].map(u => (
                                <div key={u.id} className="mini-card" onClick={() => setSelUnit(u)}>
                                    {u.title}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="topic-selection-mini">
                        <div className="mini-breadcrumb" onClick={() => setSelUnit(null)}>← Back to Units</div>
                        <div className="mini-topics">
                            <div className={`mini-topic ${!selTopic ? 'active' : ''}`} onClick={() => setSelTopic(null)}>
                                Full Unit Quiz
                            </div>
                            {(
                                selUnit.id === 'unit1' ? ['Concept of Management', 'Evolution of Thought', 'Planning & Decision Making'] :
                                    selUnit.id === 'unit2' ? ['Principles of Organizing', 'Delegation & Decentralization', 'Staffing Process'] :
                                        selUnit.id === 'unit3' ? ['Leadership Styles', 'Motivation Theories (Maslow, Herzberg)', 'Communication Flow'] :
                                            selUnit.id === 'unit4' ? ['Control Process', 'Control Techniques', 'Budgetary Control'] :
                                                ['Marketing Management', 'HR Management', 'Financial Management', 'Operations Management']
                            ).map(t => (
                                <div key={t} className={`mini-topic ${selTopic === t ? 'active' : ''}`} onClick={() => setSelTopic(t)}>
                                    {t}
                                </div>
                            ))}
                        </div>
                        <div className="mini-footer">
                            <div className="mini-duration">
                                <label>Duration (mins)</label>
                                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min={5} />
                            </div>
                            <button className="btn-primary" onClick={handleFinalCreate} disabled={loading}>
                                {loading ? <Loader2 className="spinner" /> : 'Create Session'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <button className="btn-back mt-4" onClick={onBack}>← Back</button>
        </div>
    )
}
