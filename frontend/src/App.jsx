import React, { useState } from 'react'
import Home from './pages/Home'
import QuizEngine from './components/QuizEngine'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import StudyNotes from './pages/StudyNotes'
import TrendingTopic from './pages/TrendingTopic'
import LiveSessionManager from './components/LiveSessionManager'
import Login from './pages/Login'
import Register from './pages/Register'
import QuizSelection from './pages/QuizSelection'
import { useAuth } from './context/AuthContext'
import { LogOut, Loader2 } from 'lucide-react'

function App() {
    const [view, setView] = useState('home')
    const [authMode, setAuthMode] = useState('login')
    const [activeQuiz, setActiveQuiz] = useState(null)
    const { user, loading, logout } = useAuth()

    if (loading) return (
        <div className="loading-state">
            <Loader2 className="spinner" size={48} />
            <p>Authenticating...</p>
        </div>
    )

    if (!user) {
        return (
            <div className="auth-container">
                {authMode === 'login' ? (
                    <Login onToggle={() => setAuthMode('register')} />
                ) : (
                    <Register onToggle={() => setAuthMode('login')} />
                )}
            </div>
        )
    }

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="logo" onClick={() => setView('home')}>ManageMind</div>
                <div className="nav-links">
                    <span className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>Home</span>
                    <span className={view === 'quizzes' ? 'active' : ''} onClick={() => setView('quizzes')}>Quizzes</span>
                    <span className={view === 'live' ? 'active' : ''} onClick={() => setView('live')}>Live Test</span>
                    <span className={view === 'trending' ? 'active' : ''} onClick={() => setView('trending')}>Trending</span>
                    <span className={view === 'notes' ? 'active' : ''} onClick={() => setView('notes')}>Study Notes</span>
                    <span className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Dashboard</span>
                </div>
                <div className="nav-user">
                    <div className="nav-avatar" onClick={() => setView('profile')} title="View Profile">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" />
                        ) : (
                            <div className="avatar-placeholder">
                                {user.full_name?.charAt(0) || user.username.charAt(0)}
                            </div>
                        )}
                    </div>
                    <button className="logout-btn" onClick={logout} title="Sign Out">
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main>
                {view === 'home' && (
                    <Home
                        onStart={() => setView('quizzes')}
                        onTrending={() => setView('trending')}
                        onNotes={() => setView('notes')}
                    />
                )}
                {view === 'quizzes' && !activeQuiz && (
                    <QuizSelection onStartQuiz={(params) => setActiveQuiz(params)} />
                )}
                {view === 'quizzes' && activeQuiz && (
                    <QuizEngine
                        unit={activeQuiz.unit}
                        topic={activeQuiz.topic}
                        onComplete={() => setActiveQuiz(null)}
                    />
                )}
                {view === 'live' && <LiveSessionManager />}
                {view === 'trending' && <TrendingTopic />}
                {view === 'notes' && <StudyNotes />}
                {view === 'dashboard' && <Dashboard />}
                {view === 'profile' && <Profile />}
            </main>
        </div>
    )
}

export default App
