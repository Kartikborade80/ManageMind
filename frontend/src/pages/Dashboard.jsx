import { Award, Target, Clock, BarChart2, Zap, TrendingDown, Search, FileText, Download, Brain, HelpCircle, ChevronRight, Info } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const Dashboard = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (user) {
            Promise.all([
                fetchHistory(),
                fetchNews()
            ]).finally(() => setLoading(false));
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/api/quizzes/history/${user.id}`);
            setHistory(res.data);
        } catch (error) {
            console.error("Error fetching history", error);
        }
    }

    const fetchNews = async () => {
        try {
            const res = await api.get('/api/news');
            setNews(res.data);
        } catch (error) {
            console.error("Error fetching news", error);
        }
    }

    // Aggregate data from backend history
    const accuracy = history.length > 0
        ? (history.reduce((acc, curr) => acc + (curr.score / curr.total_questions) * 100, 0) / history.length).toFixed(1)
        : 0;

    const avgTime = history.length > 0
        ? (history.reduce((acc, curr) => acc + (curr.time_taken_seconds / curr.total_questions), 0) / history.length).toFixed(0)
        : 0;

    const chartData = {
        labels: history.map((_, i) => `Attempt ${i + 1}`).reverse(),
        datasets: [
            {
                label: 'Accuracy %',
                data: history.map(h => (h.score / h.total_questions) * 100).reverse(),
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const topicMastery = Object.entries(
        history.reduce((acc, curr) => {
            if (!acc[curr.topic]) acc[curr.topic] = { total: 0, correct: 0 };
            acc[curr.topic].total += curr.total_questions;
            acc[curr.topic].correct += curr.score;
            return acc;
        }, {})
    ).map(([name, stats]) => ({
        name,
        score: Math.round((stats.correct / stats.total) * 100)
    })).sort((a, b) => b.score - a.score).slice(0, 5);

    if (loading) return (
        <div className="flex items-center justify-center p-24">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-purple-600">
                <Clock size={40} />
            </motion.div>
        </div>
    );

    return (
        <div className="dashboard-container-premium">
            <header className="premium-dashboard-header">
                <div className="header-left">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="premium-avatar-box"
                    >
                        <div className="avatar-glow" />
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="premium-avatar" />
                        ) : (
                            <div className="avatar-placeholder">{user.username.substring(0, 2).toUpperCase()}</div>
                        )}
                    </motion.div>
                    <div className="welcome-text">
                        <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                            Welcome back, {user.full_name?.split(' ')[0] || user.username}
                        </motion.h2>
                        <p className="premium-rank-pill">{user.badges?.[user.badges.length - 1] || 'Level 1 Strategic Mind'}</p>
                    </div>
                </div>

                <div className="premium-stats-grid">
                    {[
                        { icon: <Target className="text-indigo-500" />, label: 'Accuracy', val: `${accuracy}%`, delay: 0.1 },
                        { icon: <Clock className="text-amber-500" />, label: 'Avg Time', val: `${avgTime}s`, delay: 0.2 },
                        { icon: <Award className="text-emerald-500" />, label: 'Total Quizzes', val: history.length, delay: 0.3 }
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: s.delay }}
                            className="premium-stat-pill"
                        >
                            <div className="stat-pill-icon">{s.icon}</div>
                            <div className="stat-pill-content">
                                <span className="stat-pill-val">{s.val}</span>
                                <span className="stat-pill-label">{s.label}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </header>

            <div className="dashboard-pill-tabs">
                {[
                    { id: 'overview', label: 'Dashboard', icon: <BarChart2 size={16} /> },
                    { id: 'quizzes', label: 'My Attempts', icon: <Clock size={16} /> },
                    { id: 'news', label: 'Updates', icon: <Search size={16} /> }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={`pill-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div layoutId="active-pill" className="pill-active-bg" />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="dashboard-grid"
                    >
                        <div className="premium-card chart-card-large">
                            <div className="card-header-premium">
                                <TrendingDown size={20} className="text-indigo-500" />
                                <h3>Performance Evolution</h3>
                            </div>
                            <div className="premium-chart-container">
                                <Line
                                    data={chartData}
                                    options={{
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: { beginAtZero: true, grid: { display: false } },
                                            x: { grid: { display: false } }
                                        },
                                        plugins: { legend: { display: false } }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="dashboard-sidebar-panels">
                            <BrainInsights history={history} topicMastery={topicMastery} />

                            <div className="premium-card mt-6">
                                <div className="card-header-premium">
                                    <Target size={20} className="text-amber-500" />
                                    <h3>Topic Proficiency</h3>
                                </div>
                                <div className="premium-progress-list">
                                    {topicMastery.length > 0 ? topicMastery.map((topic, idx) => (
                                        <div key={idx} className="premium-progress-item">
                                            <div className="prog-info-modern">
                                                <span>{topic.name}</span>
                                                <span className="prog-val">{topic.score}%</span>
                                            </div>
                                            <div className="premium-prog-track">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${topic.score}%` }}
                                                    transition={{ delay: 1 + idx * 0.1, duration: 1 }}
                                                    className="premium-prog-fill"
                                                />
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="empty-state-nebula">
                                            <Info size={24} />
                                            <p>Take your first quiz to begin intelligence mapping.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'quizzes' && (
                    <motion.div
                        key="quizzes"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="dashboard-content"
                    >
                        {/* Placeholder for User's Screenshot */}
                        <div className="screenshot-section card mb-8 overflow-hidden">
                            <div className="p-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
                                <p className="text-gray-400 italic">User's Requested Screenshot Placeholder</p>
                                <p className="text-xs text-gray-300 mt-2">Displaying recent quiz score analysis summary here</p>
                            </div>
                        </div>

                        <div className="premium-card">
                            <div className="card-header-premium">
                                <FileText size={20} className="text-indigo-500" />
                                <h3>Comprehensive Attempt History</h3>
                            </div>
                            <div className="premium-history-table">
                                {history.length > 0 ? history.map((quiz, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="premium-history-row"
                                    >
                                        <div className="row-main">
                                            <div className="row-icon-box">
                                                <Zap className={quiz.score / quiz.total_questions > 0.75 ? 'text-emerald-500' : 'text-amber-500'} size={18} />
                                            </div>
                                            <div className="row-meta">
                                                <h4 className="row-topic">{quiz.topic}</h4>
                                                <p className="row-sub">Attempted on {new Date(quiz.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="row-stats">
                                            <div className="stat-unit">
                                                <span className="stat-v">{quiz.score}/{quiz.total_questions}</span>
                                                <span className="stat-l">Score</span>
                                            </div>
                                            <div className="stat-unit">
                                                <span className="stat-v">{Math.round((quiz.score / quiz.total_questions) * 100)}%</span>
                                                <span className="stat-l">Accuracy</span>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="row-action-download"
                                            onClick={() => {/* Mocking download for now */ alert('Downloading PDF Report...') }}
                                            title="Download PDF Result"
                                        >
                                            <Download size={18} />
                                        </motion.button>
                                    </motion.div>
                                )) : (
                                    <div className="empty-state-nebula">
                                        <Info size={30} />
                                        <p>No intelligence records found yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'news' && (
                    <motion.div
                        key="news"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="dashboard-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {news.map((item) => (
                            <div key={item.id} className="news-card card border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                                {item.image_url && (
                                    <div className="h-48 overflow-hidden">
                                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}
                                <div className="p-5">
                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{item.category}</span>
                                    <h3 className="text-lg font-bold text-gray-800 mt-2 line-clamp-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm mt-3 line-clamp-3 leading-relaxed">{item.content}</p>
                                    <div className="flex items-center justify-between mt-6">
                                        <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                        <button className="text-indigo-600 font-semibold text-sm hover:underline">Read More →</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const BrainInsights = ({ history, topicMastery }) => {
    // Logic to find weak areas
    const weakTopics = topicMastery.filter(t => t.score < 60);
    const topTopic = topicMastery[0];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="brain-insight-card"
        >
            <div className="insight-glow" />
            <div className="insight-header">
                <Brain className="text-indigo-500" size={24} />
                <h3>Brain Improvement Insights</h3>
            </div>

            <div className="insight-content">
                {weakTopics.length > 0 ? (
                    <div className="insight-item-premium">
                        <div className="item-icon-warn"><Zap size={16} /></div>
                        <div className="item-text">
                            <h6>Immediate Focus Required</h6>
                            <p>Your performance in <strong>{weakTopics[0].name}</strong> is currently at {weakTopics[0].score}%. We suggest intensive review of Unit {(weakTopics[0].id || '1').split('-')[0]} fundamentals.</p>
                        </div>
                    </div>
                ) : topTopic ? (
                    <div className="insight-item-premium success">
                        <div className="item-icon-success"><Award size={16} /></div>
                        <div className="item-text">
                            <h6>Mastery Detected</h6>
                            <p>You have exceptional clarity in <strong>{topTopic.name}</strong>. You're ready to tackle advanced strategic simulations in this area.</p>
                        </div>
                    </div>
                ) : (
                    <p className="no-data-insight">Begin your first assessment to unlock cognitive mapping and strategic insights.</p>
                )}

                <div className="insight-footer-modern">
                    <TrendingDown size={14} />
                    <span>AI-Generated Study Path</span>
                </div>
            </div>
        </motion.div>
    );
};

const TopicProgress = ({ label, progress }) => (
    <div className="progress-item">
        <div className="progress-info">
            <span>{label}</span>
            <span>{progress}%</span>
        </div>
        <div className="progress-bar">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="progress-fill"
            />
        </div>
    </div>
)

export default Dashboard
