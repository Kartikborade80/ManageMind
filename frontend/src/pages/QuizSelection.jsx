import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, ChevronRight, Play, Info, Layers, CheckCircle } from 'lucide-react';

const UNITS = [
    {
        id: 'unit1',
        title: 'Unit 1: Introduction to Management',
        description: 'Evolution of management thought, scientific management, and essential supervisory skills.',
        topics: [
            'Evolution of management thoughts from ancient/medieval to modern times in India (IKS)',
            'Management: meaning, importance, characteristics, functions & challenges',
            'Introduction to scientific management - Taylor\'s & Fayol\'s principles of management',
            'Levels & functions of management at supervisory level',
            'Self-management skills',
            'Overview of Managerial Skills'
        ]
    },
    {
        id: 'unit2',
        title: 'Unit 2: Product, Operations and Project Management',
        description: 'Creativity, Agile methodologies, and project planning tools like PERT/CPM.',
        topics: [
            'Creativity and innovation management',
            'New product development, change management',
            'Product Management',
            'Agile product management',
            'Project Management',
            'Tools of Project Management'
        ]
    },
    {
        id: 'unit3',
        title: 'Unit 3: Management Practices',
        description: 'Quality standards, Lean manufacturing, Six Sigma, and ERP systems.',
        topics: [
            'Quality circle, kaizen, Six Sigma, TQM',
            '5S, Kanban card system, TPM, Lean Manufacturing',
            'Quality Standards and ISO',
            'The overview of ERP',
            'Service quality and customer/client satisfaction'
        ]
    },
    {
        id: 'unit4',
        title: 'Unit 4: Marketing Management',
        description: "7 P's of marketing, digital strategies, CRM, and event management.",
        topics: [
            'Marketing management',
            'Needs, wants, and demands in marketing. CRM',
            'Types of marketing: Traditional and digital marketing',
            'Event management'
        ]
    },
    {
        id: 'unit5',
        title: 'Unit 5: Supply Chain & Human Resource Management',
        description: 'Supply chain logistics, IT integration, and human resource recruitment/leadership.',
        topics: [
            'Overview of Supply Chain and logistics Management',
            'Components of Supply Chain and logistics Management',
            'Role of information technology in supply chain & logistics management',
            'Overview of Human Resource Management',
            'Recruitment, selection, and training of human resources',
            'Qualities of a successful supervisor/team leader'
        ]
    }
];

const QuizSelection = ({ onStartQuiz }) => {
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [testLength, setTestLength] = useState(10);
    const [isCustomizing, setIsCustomizing] = useState(false);

    const handleBack = () => {
        if (selectedTopic) {
            setSelectedTopic(null);
        } else {
            setSelectedUnit(null);
        }
    };

    const handleStart = () => {
        if (selectedUnit) {
            onStartQuiz({
                unit: selectedUnit.id,
                topic: selectedTopic || 'Full Unit',
                limit: selectedTopic ? 10 : testLength
            });
        }
    };

    return (
        <div className="quiz-selection-container">
            <header className="page-header">
                <h1>{selectedUnit ? 'Select Topic' : 'Select Study Unit'}</h1>
                <p>Choose a specific area to test your knowledge.</p>
            </header>

            <AnimatePresence mode="wait">
                {!selectedUnit ? (
                    <motion.div
                        key="unit-grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="unit-grid"
                    >
                        {UNITS.map((unit, index) => (
                            <motion.div
                                key={unit.id}
                                className="unit-card"
                                whileHover={{ scale: 1.02, translateY: -5 }}
                                onClick={() => setSelectedUnit(unit)}
                            >
                                <div className="unit-icon">
                                    <Book size={24} />
                                </div>
                                <h3>{unit.title}</h3>
                                <p>{unit.description}</p>
                                <div className="unit-footer">
                                    <span>{unit.topics.length} Subtopics</span>
                                    <ChevronRight size={18} />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="topic-selection"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="topic-selection-view"
                    >
                        <div className="selection-breadcrumb">
                            <span onClick={() => setSelectedUnit(null)}>Quizzes</span>
                            <ChevronRight size={14} />
                            <span className="current">{selectedUnit.title}</span>
                        </div>

                        <div className="topics-list">
                            <div
                                className={`topic-item ${!selectedTopic ? 'selected' : ''}`}
                                onClick={() => {
                                    setSelectedTopic(null);
                                    setIsCustomizing(true);
                                }}
                            >
                                <div className="topic-radio">
                                    {!selectedTopic && <CheckCircle size={16} />}
                                </div>
                                <div className="topic-text">
                                    <h4>Attempt Full Unit Test</h4>
                                    <p>Comprehensive exam covering all topics in {selectedUnit.title}</p>
                                </div>
                            </div>

                            {isCustomizing && !selectedTopic && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="custom-test-options"
                                >
                                    <h5>Select Question Count:</h5>
                                    <div className="count-chips">
                                        {[20, 30, 40].map(count => (
                                            <button
                                                key={count}
                                                className={`count-chip ${testLength === count ? 'active' : ''}`}
                                                onClick={() => setTestLength(count)}
                                            >
                                                {count} Questions
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            <div className="topic-divider">Sub-topics (10 MCQs each)</div>

                            {selectedUnit.topics.map((topic) => (
                                <div
                                    key={topic}
                                    className={`topic-item ${selectedTopic === topic ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedTopic(topic);
                                        setIsCustomizing(false);
                                    }}
                                >
                                    <div className="topic-radio">
                                        {selectedTopic === topic && <CheckCircle size={16} />}
                                    </div>
                                    <div className="topic-text">
                                        <h4>{topic}</h4>
                                        <p>Focused practice on this specific topic.</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="selection-actions">
                            <button className="btn-secondary" onClick={() => setSelectedUnit(null)}>
                                Back to Units
                            </button>
                            <button className="btn-primary start-btn" onClick={handleStart}>
                                <Play size={18} /> Start {selectedTopic ? 'Topic Quiz' : 'Unit Test'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizSelection;
