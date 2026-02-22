import { Award, Target, Clock, BarChart2 } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { motion } from 'framer-motion'
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
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

const Dashboard = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/api/quizzes/history/${user.id}`);
            setHistory(res.data);
        } catch (error) {
            console.error("Error fetching history", error);
        } finally {
            setLoading(false);
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
    })).slice(0, 5);

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="dashboard-container">
            <header className="page-header header-with-action">
                <div className="user-profile">
                    <div className="avatar">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" />
                        ) : (
                            user.username.substring(0, 2).toUpperCase()
                        )}
                    </div>
                    <div className="user-meta">
                        <h2>Hello, {user.full_name || user.username}</h2>
                        <p className="level-badge">{user.badges && user.badges.length > 0 ? user.badges[user.badges.length - 1] : 'Beginner'}</p>
                    </div>
                </div>
                <div className="stats-row">
                    <StatBox icon={<Target />} label="Accuracy" val={`${accuracy}%`} />
                    <StatBox icon={<Clock />} label="Avg Time" val={`${avgTime}s`} />
                    <StatBox icon={<Award />} label="Quizzes" val={history.length} />
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="card chart-card">
                    <h3>Personal Performance Graph</h3>
                    <div className="chart-wrapper">
                        <Line data={chartData} />
                    </div>
                </div>

                <div className="card">
                    <h3>Topic Mastery</h3>
                    <div className="progress-list">
                        {topicMastery.length > 0 ? topicMastery.map((topic, idx) => (
                            <div key={idx} className="progress-item">
                                <div className="progress-info">
                                    <span>{topic.name}</span>
                                    <span>{topic.score}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${topic.score}%`, background: `linear-gradient(90deg, #4f46e5 ${100 - topic.score}%, #10b981 100%)` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state-mini">
                                <p>Take your first quiz to see topic mastery!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const StatBox = ({ icon, label, val }) => (
    <div className="stat-box">
        <div className="icon-wrapper">{icon}</div>
        <div className="stat-info">
            <span className="label">{label}</span>
            <span className="value">{val}</span>
        </div>
    </div>
)

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
