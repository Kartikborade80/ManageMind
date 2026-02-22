import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, ChevronRight, FileText, Search, Layout, Target, Users, Settings, TrendingUp, ShieldCheck } from 'lucide-react';

const STUDY_DATA = [
    {
        unit: 1,
        title: "Introduction to Management",
        description: "Evolution of management thought, principles, and supervisory skills.",
        content: [
            {
                heading: "1.1 Concept of Management",
                text: "Management is the process of getting things done through and with people. It involves planning, organizing, leading, and controlling resources to achieve organizational goals effectively and efficiently. In India, management practices date back to ancient times (IKS), emphasizing dharma and social responsibility."
            },
            {
                heading: "1.2 Principles of Management (Taylor & Fayol)",
                text: "F.W. Taylor introduced Scientific Management, focusing on efficiency, standardization, and 'one best way'. Henri Fayol provided 14 Principles of Management, including Division of Work, Authority, Discipline, and Unity of Command, which form the foundation of modern administration."
            },
            {
                heading: "1.3 Levels of Management",
                text: "Generally divided into three levels: Top (Strategy), Middle (Tactical), and Supervisory/Lower (Operational). Supervisors play a critical role as they are the direct link between management and the workforce."
            }
        ]
    },
    {
        unit: 2,
        title: "Operations & Project Management",
        description: "Creativity, innovation, and project planning tools.",
        content: [
            {
                heading: "2.1 Creativity & Innovation",
                text: "Creativity is thinking of new things, while innovation is doing new things. In operations, this involves improving processes and developing new products to meet changing market demands."
            },
            {
                heading: "2.2 Project Management Basics",
                text: "Project management involves initiating, planning, executing, and closing a project. Key objective is to complete the project within time, cost, and quality constraints."
            },
            {
                heading: "2.3 Tools: PERT & CPM",
                text: "Program Evaluation & Review Technique (PERT) and Critical Path Method (CPM) are network-based tools used for scheduling and controlling complex projects. CPM focuses on the longest path of planned activities to the end of the project."
            }
        ]
    },
    {
        unit: 3,
        title: "Management Practices",
        description: "Quality management, Six Sigma, and modern standards.",
        content: [
            {
                heading: "3.1 Total Quality Management (TQM)",
                text: "TQM is a management approach centered on quality, based on the participation of all members and aiming at long-term success through customer satisfaction."
            },
            {
                heading: "3.2 Six Sigma & Kaizen",
                text: "Six Sigma aims to eliminate defects by reducing process variation. Kaizen is a Japanese philosophy of 'continuous improvement' in small steps involving everyone in the organization."
            },
            {
                heading: "3.3 5S Methodology",
                text: "A workplace organization method: Sort (Seiri), Set in order (Seiton), Shine (Seiso), Standardize (Seiketsu), and Sustain (Shitsuke)."
            }
        ]
    },
    {
        unit: 4,
        title: "Marketing Management",
        description: "Marketing mix, digital strategies, and CRM.",
        content: [
            {
                heading: "4.1 The Marketing Mix (7Ps)",
                text: "Includes Product, Price, Place, Promotion, People, Process, and Physical Evidence. These elements are adjusted to meet customer needs and competitive pressures."
            },
            {
                heading: "4.2 Customer Relationship Management (CRM)",
                text: "A technology-led strategy to manage an organization's interactions with current and potential customers, focusing on retention and long-term value."
            },
            {
                heading: "4.3 Traditional vs Digital Marketing",
                text: "Traditional uses print/TV/radio. Digital leverages social media, SEO, and email. Digital marketing offers better targeting, lower cost, and real-time analytics."
            }
        ]
    },
    {
        unit: 5,
        title: "Supply Chain & HR Management",
        description: "Logistics integration and human resource leadership.",
        content: [
            {
                heading: "5.1 Supply Chain Management (SCM)",
                text: "The oversight of materials, information, and finances as they move from supplier to manufacturer to wholesaler to retailer to consumer."
            },
            {
                heading: "5.2 Human Resource Management (HRM)",
                text: "Involves recruitment, selection, orientation, training, and development of employees. The goal is to maximize employee performance in service of their employer's strategic objectives."
            },
            {
                heading: "5.3 Effective Leadership",
                text: "Leadership is the ability to influence a group toward the achievement of goals. Essential qualities include integrity, empathy, communication, and decisiveness."
            }
        ]
    }
];

const StudyNotes = () => {
    const [selectedUnit, setSelectedUnit] = useState(STUDY_DATA[0]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = STUDY_DATA.filter(unit =>
        unit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.content.some(c => c.heading.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="study-notes-container">
            <header className="page-header header-with-action">
                <div className="header-titles">
                    <h2>Academic Study Notes</h2>
                    <p>Comprehensive unit-wise explanations for MSBTE Diploma Management.</p>
                </div>
                <div className="search-bar-wrap">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search topics or units..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
            </header>

            <div className="study-layout">
                <aside className="study-sidebar">
                    {STUDY_DATA.map((unit) => (
                        <motion.div
                            key={unit.unit}
                            whileHover={{ x: 5 }}
                            className={`unit-nav-item ${selectedUnit.unit === unit.unit ? 'active' : ''}`}
                            onClick={() => setSelectedUnit(unit)}
                        >
                            <span className="unit-num">Unit {unit.unit}</span>
                            <span className="unit-title-short">{unit.title}</span>
                            <ChevronRight size={16} />
                        </motion.div>
                    ))}
                </aside>

                <main className="study-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedUnit.unit}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="notes-reader glass-card"
                        >
                            <div className="reader-header">
                                <span className="category-badge">Unit {selectedUnit.unit}</span>
                                <h1>{selectedUnit.title}</h1>
                                <p className="reader-desc">{selectedUnit.description}</p>
                            </div>

                            <div className="reader-body">
                                {selectedUnit.content.map((section, idx) => (
                                    <section key={idx} className="notes-section">
                                        <h3>{section.heading}</h3>
                                        <p>{section.text}</p>
                                    </section>
                                ))}
                            </div>

                            <div className="reader-footer">
                                <p>Source: Official MSBTE Syllabus Alignment 2026</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default StudyNotes;
