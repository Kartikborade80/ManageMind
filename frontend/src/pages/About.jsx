import React from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, Code, FileText, Presentation } from 'lucide-react';

const About = () => {
    return (
        <div className="about-container">
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="about-hero"
            >
                <h1 className="hero-title">About <span className="highlight">Us</span></h1>
                <p className="hero-subtitle">Meet the team behind ManageMind - empowering MSBTE Diploma students.</p>
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="about-project glass-card"
            >
                <h2>About <span className="highlight">ManageMind</span></h2>
                <div className="project-description">
                    <p><strong>ManageMind</strong> is an innovative, interactive learning platform specifically engineered to support <strong>MSBTE Diploma Engineering students</strong> in mastering the critical subject of <strong>Management (22509)</strong>. Developed for the 2026 scheme, our platform bridges the gap between theoretical concepts and practical industrial application.</p>

                    <div className="description-grid">
                        <div className="desc-item">
                            <h3>Our Mission</h3>
                            <p>To empower the next generation of engineers with essential organizational and leadership skills through technology-driven, scenario-based learning that makes complex management theories easy to understand and apply.</p>
                        </div>
                        <div className="desc-item">
                            <h3>Why ManageMind?</h3>
                            <p>Traditional study methods often fall short in explaining dynamic industrial concepts. ManageMind offers interactive quizzes, real-world case studies, and AI-powered insights to ensure every student is industry-ready.</p>
                        </div>
                    </div>

                    <h3>Key Pillars of ManageMind</h3>
                    <ul className="pillars-list">
                        <li><strong>Unit-Wise Mastery:</strong> Deep-dive content covering all 5 core units of the MSBTE syllabus.</li>
                        <li><strong>Smart Quiz Engine:</strong> Adaptive testing with Practice, Timed, and Scenario modes for comprehensive preparation.</li>
                        <li><strong>AI-Driven Insights:</strong> Personalized learning paths that adapt to each student's strengths and weaknesses.</li>
                        <li><strong>Modern Interface:</strong> A premium, responsive design that makes studying engaging and accessible anywhere.</li>
                    </ul>
                </div>

                <div className="project-stats">
                    <div className="p-stat">
                        <div className="p-stat-value">5</div>
                        <div className="p-stat-label">Units Covered</div>
                    </div>
                    <div className="p-stat">
                        <div className="p-stat-value">2026</div>
                        <div className="p-stat-label">Scheme Ready</div>
                    </div>
                    <div className="p-stat">
                        <div className="p-stat-value">AI</div>
                        <div className="p-stat-label">Smart Engine</div>
                    </div>
                    <div className="p-stat">
                        <div className="p-stat-value">Interactive</div>
                        <div className="p-stat-label">Learning Flow</div>
                    </div>
                </div>
            </motion.section>

            <h2 className="section-title">Our <span className="highlight">Team</span></h2>
            <div className="developers-grid">
                <DeveloperCard
                    name="Kartik Borade"
                    education="DY Patil Polytechnic Ambi Pune"
                    branch="AI & ML"
                    roles={[
                        { icon: <Code size={20} />, text: "Developer for website" }
                    ]}
                />
                <DeveloperCard
                    name="Pragati Adasule"
                    education="DY Patil Polytechnic Ambi Pune"
                    branch="AI & ML"
                    roles={[
                        { icon: <FileText size={20} />, text: "Documentations" }
                    ]}
                />
                <DeveloperCard
                    name="Anushka Bhawar"
                    education="DY Patil Polytechnic Ambi Pune"
                    branch="AI & ML"
                    roles={[
                        { icon: <Presentation size={20} />, text: "Presentation" }
                    ]}
                />
            </div>

            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="about-footer"
            >
                <div className="footer-note">
                    <p>Designed and developed with passion to help students excel in their academic journey.</p>
                </div>
            </motion.section>
        </div>
    );
};

const DeveloperCard = ({ name, education, branch, roles }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="developer-card"
    >
        <div className="dev-header">
            <div className="dev-avatar">
                <User size={32} />
            </div>
            <h3>{name}</h3>
        </div>
        <div className="dev-info">
            <p className="dev-edu">
                <GraduationCap size={18} />
                {education}
            </p>
            <p className="dev-branch">{branch} Branch</p>
        </div>
        <div className="dev-roles">
            {roles.map((role, index) => (
                <div key={index} className="role-item">
                    {role.icon}
                    <span>{role.text}</span>
                </div>
            ))}
        </div>
    </motion.div>
);

export default About;
