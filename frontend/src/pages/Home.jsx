import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Target, TrendingUp, FileText } from 'lucide-react'

const Home = ({ onStart, onTrending, onNotes }) => {
    return (
        <div className="home-container">
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero-section"
            >
                <h1 className="hero-title">Master Management with <span className="highlight">ManageMind</span></h1>
                <p className="hero-subtitle">The ultimate interactive platform for MSBTE Diploma Management, covering all 5 units for the 2026 scheme.</p>
                <div className="hero-actions">
                    <button className="btn-primary" onClick={onStart}>Start Learning</button>
                    <button className="btn-secondary" onClick={onTrending}>Explore Trends</button>
                </div>
            </motion.section>

            <section className="features-grid">
                <FeatureCard
                    icon={<BookOpen size={32} />}
                    title="Interactive Units"
                    desc="Units 1 to 5 explained through simple, scenario-based learning."
                    onClick={onStart}
                />
                <FeatureCard
                    icon={<Target size={32} />}
                    title="Smart Quiz"
                    desc="Practice, Timed, and Scenario modes with instant feedback."
                    onClick={onStart}
                />
                <FeatureCard
                    icon={<TrendingUp size={32} />}
                    title="Trending Tech"
                    desc="Stay updated with the latest in Industrial Management and Organizational trends."
                    onClick={onTrending}
                />
                <FeatureCard
                    icon={<FileText size={32} />}
                    title="Detailed Notes"
                    desc="Unit-wise structured explanations for your study preparation."
                    onClick={onNotes}
                />
            </section>
        </div>
    )
}

const FeatureCard = ({ icon, title, desc, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className="feature-card"
        onClick={onClick}
        style={{ cursor: 'pointer' }}
    >
        <div className="feature-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{desc}</p>
    </motion.div>
)

export default Home
