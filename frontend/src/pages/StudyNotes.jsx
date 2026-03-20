import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, ChevronRight, FileText, Search, Layout, Target, Users, Settings, TrendingUp, ShieldCheck, Play } from 'lucide-react';

const STUDY_DATA = [
    {
        unit: 1,
        id: "unit1",
        title: "Introduction to Management",
        icon: <Target className="unit-icon" />,
        readingTime: "25 min",
        description: "Foundations of management, evolution of thought, and essential self-management and managerial skills with deep sub-points.",
        takeaways: ["Understand IKS evolution", "Master 14 Fayol principles", "Develop self-discipline"],
        content: [
            {
                heading: "1.1 Evolution of Management Thoughts",
                text: "Management in India has deep roots in ancient texts, evolving into modern global practices.\n\n" +
                      "• **Kautilya's Arthashastra**: Focuses on statecraft, economic policy, and military strategy. *Example: The structured tax collection and judicial systems of the Mauryan Empire.*\n" +
                      "• **The Bhagavad Gita**: Emphasizes 'Nishkama Karma' (selfless action) and 'Dharma-centric' leadership. *Example: A leader making tough decisions based on ethics rather than personal gain.*\n" +
                      "• **Modern Management**: Evolved from the Industrial Revolution (Classical Theory) to Neo-Classical (Human Relations) and finally to Systems and Contingency approaches. *Example: Google's focus on employee well-being as a driver for productivity (Neo-Classical approach).*"
            },
            {
                heading: "1.2 Management Essentials",
                text: "Management is the backbone of any successful organization.\n\n" +
                      "• **Meaning**: Achieving goals through others. It is both an art (personality) and a science (logic).\n" +
                      "• **Primary Functions (POSDC)**:\n" +
                      "  1. **Planning**: Setting goals. *Example: A startup deciding to launch in 3 new cities by next year.*\n" +
                      "  2. **Organizing**: Assigning tasks. *Example: Creating a dedicated marketing team for the launch.*\n" +
                      "  3. **Staffing**: Hiring. *Example: Recruiting 10 new sales executives.*\n" +
                      "  4. **Directing**: Guiding. *Example: Mentoring the team on sales techniques.*\n" +
                      "  5. **Controlling**: Monitoring. *Example: Checking if sales targets are met weekly.*\n" +
                      "• **Characteristics**: Pervasive, Multidimensional, Dynamic, and Goal-Oriented."
            },
            {
                heading: "1.3 Taylor & Fayol's Principles",
                text: "Foundations of modern administrative and scientific management.\n\n" +
                      "• **F.W. Taylor (Scientific Management)**:\n" +
                      "  - **Science, not rule of thumb**: Decisions based on data. *Example: Timing how long it takes to pack a box to optimize the process.*\n" +
                      "  - **Harmony, not discord**: Cooperation between workers and managers.\n" +
                      "• **Henri Fayol (14 Principles)**:\n" +
                      "  - **Division of Work**: Specialization increases output. *Example: In a car factory, one person fits tires while another paints the body.*\n" +
                      "  - **Unity of Command**: One boss for each worker. *Example: An employee reporting only to the lead designer, not multiple managers.*\n" +
                      "  - **Scalar Chain**: Clear line of authority from top to bottom."
            },
            {
                heading: "1.4 Supervisory Management",
                text: "The critical link between strategic planning and ground-level execution.\n\n" +
                      "• **Role of a Supervisor**: Directs workers, ensures safety, and maintains quality. *Example: A floor supervisor in a textile mill ensuring all machines are running and workers follow safety protocols.*\n" +
                      "• **Key Functions**:\n" +
                      "  - Translating management goals into daily tasks.\n" +
                      "  - Handling grievances and maintaining workspace discipline.\n" +
                      "  - Reporting progress back to middle management."
            },
            {
                heading: "1.5 Self Management Skills",
                text: "A manager must first manage themselves before they can manage a team.\n\n" +
                      "• **Self-Awareness**: Knowing your strengths and biases. *Example: Realizing you are more productive in the morning and scheduling complex tasks then.*\n" +
                      "• **Time Management**: Using the Eisenhower Matrix (Urgent vs. Important). *Example: Spending time on 'Non-Urgent but Important' tasks like team training before they become urgent crises.*\n" +
                      "• **Stress Management**: Techniques like mindfulness or the 'Pomodoro' technique (25 min work, 5 min break)."
            },
            {
                heading: "1.6 Managerial Skills & Leadership",
                text: "Advanced skills required to lead effectively.\n\n" +
                      "• **Negotiation**: Finding a 'Win-Win' solution. *Example: Reaching a compromise with a vendor that lowers price while guaranteeing a long-term contract.*\n" +
                      "• **Team Management**: Synergy where 1+1=3. *Example: Organizing a cross-departmental task force to solve a complex software bug.*\n" +
                      "• **Leadership Styles**:\n" +
                      "  - **Autocratic**: Decision-making stays with the leader.\n" +
                      "  - **Democratic**: Encourages participation. *Example: A manager asking the team for their input on the new project deadline.*"
            }
        ]
    },
    {
        unit: 2,
        id: "unit2",
        title: "Product, Operations and Project Mgmt",
        icon: <Layout className="unit-icon" />,
        readingTime: "30 min",
        description: "Innovation techniques, product life cycles, Agile methodologies, and project planning tools with deep sub-points.",
        takeaways: ["Master creativity techniques", "Understand Agile manifesto", "Learn PERT/CPM tools"],
        content: [
            {
                heading: "2.1 Creativity & Innovation Management",
                text: "Driving growth through new ideas and their implementation.\n\n" +
                      "• **Comparison**: Creativity is thinking of a foldable phone; Innovation is actually manufacturing and selling it.\n" +
                      "• **Techniques for Ideas**:\n" +
                      "  - **Brainstorming**: Group sessions to generate many ideas without judgment.\n" +
                      "  - **De Bono's Six Thinking Hats**: Different perspectives (Logic, Emotion, Risk, Optimism, Creativity, Control). *Example: Using the 'Black Hat' to find risks in a new marketing plan before launch.*\n" +
                      "  - **Morphological Analysis**: Breaking a problem into variables and exploring combinations. *Example: Designing a new chair by varying material, leg type, and backing.*"
            },
            {
                heading: "2.2 NPD & Change Management",
                text: "Keeping the organization relevant in a changing market.\n\n" +
                      "• **New Product Development (NPD)**: Ideation -> Screening -> Prototype -> Launch. *Example: Apple moving from just computers to the MP3 market with the iPod.*\n" +
                      "• **Change Management**: Overcoming resistance. *Example: A company moving from paper-based filing to a cloud-based CRM and training employees to use it.*"
            },
            {
                heading: "2.3 Product Management Strategies",
                text: "Winning in the marketplace through strategic product decisions.\n\n" +
                      "• **Strategic Planning**: Positioning and competitive analysis. *Example: Tesla positioning itself as a high-tech luxury brand rather than just an electric car company.*\n" +
                      "• **Sustainable Design**: Focus on longevity and eco-friendliness. *Example: Using recycled ocean plastics to manufacture laptop cases.*"
            },
            {
                heading: "2.4 Agile Product Management",
                text: "Iterative and flexible development for complex projects.\n\n" +
                      "• **Agile Manifesto**: Customer collaboration over contract negotiation; responding to change over following a plan.\n" +
                      "• **Frameworks**:\n" +
                      "  - **Scrum**: Daily huddles and 2-week 'Sprints'. *Example: A dev team shipping a small feature update every two weeks based on user feedback.*\n" +
                      "  - **Kanban**: Visualizing the workflow to avoid bottlenecks."
            },
            {
                heading: "2.5 Project Management Fundamentals",
                text: "Delivering specific outcomes within time and budget.\n\n" +
                      "• **The 4 Ps**: Plan, Processes, People, and Power.\n" +
                      "• **Project Lifecycle**: Initiation -> Planning -> Execution -> Closing. *Example: Building a new office bridge—from getting government permits (Initiation) to the final ribbon cutting (Closing).*"
            },
            {
                heading: "2.6 Tools of Project Management",
                text: "Technical methods to ensure project success.\n\n" +
                      "• **PERT (Program Evaluation & Review Technique)**: For projects with uncertain times. *Example: Researching a new vaccine where testing might take 3 or 9 months.*\n" +
                      "• **CPM (Critical Path Method)**: Identifying the sequence of steps that determines the minimum project time. *Example: In house construction, the roof can't start until the walls are done—this is the critical path.*\n" +
                      "• **Gantt Charts**: A bar chart for scheduling tasks over time. *Example: Mapping out the 6-month timeline for a movie production.*"
            }
        ]
    },
    {
        unit: 3,
        id: "unit3",
        title: "Modern Management Practices",
        icon: <Settings className="unit-icon" />,
        readingTime: "22 min",
        description: "Modern quality standards, lean manufacturing, and enterprise systems with deep sub-points.",
        takeaways: ["Implement 5S methodology", "Understand ISO standards", "Explore ERP benefits"],
        content: [
            {
                heading: "3.1 Quality Management Tools",
                text: "Quality tools ensure constant excellence.\n\n" +
                      "• **Kaizen (Continuous Improvement)**: Small, daily changes for the better. *Example: A worker suggesting a better placement for tools to save 10 seconds per task.*\n" +
                      "• **Six Sigma**: Using statistics to achieve 99.99966% accuracy. *Example: Motorola reducing defects in mobile chips to fewer than 4 per million.*\n" +
                      "• **Total Quality Management (TQM)**: Every department is responsible for quality."
            },
            {
                heading: "3.2 5S & Lean Manufacturing",
                text: "Eliminating waste and organizing the workspace.\n\n" +
                      "• **5S Methodology**:\n" +
                      "  1. **Sort**: Remove unnecessary items. *Example: Clearing old, broken parts from a workbench.*\n" +
                      "  2. **Set in Order**: A place for everything.\n" +
                      "  3. **Shine**: Regular cleaning.\n" +
                      "  4. **Standardize**: Rules for the above.\n" +
                      "  5. **Sustain**: Discipline to keep it going.\n" +
                      "• **Lean Manufacturing (Muda Elimination)**: Reducing waste. *Example: Toyota producing only the amount of cars ordered.*"
            },
            {
                heading: "3.3 Quality Standards (ISO & OSHA)",
                text: "Global certifications for trust and safety.\n\n" +
                      "• **ISO 9001:2015**: Generic standard for quality management requirements.\n" +
                      "• **ISO 14001**: Environmental responsibility. *Example: A factory tracking and reducing its carbon emissions yearly.*\n" +
                      "• **OSHA 2020**: Occupational Safety standards. *Example: Mandating hard hats and safety harnesses for all construction workers.*"
            },
            {
                heading: "3.4 ERP Overview",
                text: "Integrating all business data into one source of truth.\n\n" +
                      "• **Core Modules**: Finance, HR, Supply Chain, Sales, Manufacturing.\n" +
                      "• **Benefits**: Real-time reporting. *Example: When a sale is made in New York, the factory in India automatically sees the order.*"
            },
            {
                heading: "3.5 Service Quality & Servicescape",
                text: "Managing intangible value and physical environments.\n\n" +
                      "• **Service Quality**: The gap between expectation and perception.\n" +
                      "• **Servicescape**: Physical facility where service is delivered. *Example: A coffee shop's comfortable seating, pleasant lighting, and quiet music.*"
            }
        ]
    },
    {
        unit: 4,
        id: "unit4",
        title: "Marketing Management",
        icon: <TrendingUp className="unit-icon" />,
        readingTime: "20 min",
        description: "Strategic marketing mix, customer relationship management, and event/crisis handling with deep sub-points.",
        takeaways: ["Apply the 7Ps mix", "Differentiate traditional vs digital", "Manage brand crises"],
        content: [
            {
                heading: "4.1 Marketing Meaning & 7Ps",
                text: "Understanding the market and positioning the offer.\n\n" +
                      "• **7Ps Marketing Mix**:\n" +
                      "  1. **Product**: *Example: A high-end smartphone.*\n" +
                      "  2. **Price**: *Example: iPhone's premium pricing vs. Xiaomi's budget pricing.*\n" +
                      "  3. **Place**: *Example: Selling online vs. in exclusive retail stores.*\n" +
                      "  4. **Promotion**: Advertising.\n" +
                      "  5. **People**: Customer service staff.\n" +
                      "  6. **Process**: How the service is delivered.\n" +
                      "  7. **Physical Evidence**: Packaging or store interior."
            },
            {
                heading: "4.2 Customer Needs & CRM",
                text: "Building long-term relationships through understanding.\n\n" +
                      "• **Needs vs. Wants**: Need is a bottle of water; Want is branded sparkling water.\n" +
                      "• **CRM (Customer Relationship Management)**: Tracking customer history. *Example: Amazon suggesting books based on your previous purchases.*"
            },
            {
                heading: "4.3 Traditional vs Digital Marketing",
                text: "Choosing the right medium for the message.\n\n" +
                      "• **Traditional**: Newspaper ads, Billboards. *Example: A local restaurant printing flyers.*\n" +
                      "• **Digital**: Social Media, SEO, Email. *Example: A global app using Google Ads to target 18-24 year olds.*"
            },
            {
                heading: "4.4 Event & Crisis Management",
                text: "Planning experiences and handling emergencies.\n\n" +
                      "• **Event Management**: Planning, Branding, Logistics. *Example: Organizing a product launch gala.*\n" +
                      "• **Crisis Management**: Immediate response to negative events. *Example: A food company recalling products and instantly apologizing on social media.*"
            }
        ]
    },
    {
        unit: 5,
        id: "unit5",
        title: "Supply Chain & HRM",
        icon: <Users className="unit-icon" />,
        readingTime: "28 min",
        description: "Logistics, SCM components, human resource lifecycle, and leadership qualities with deep sub-points.",
        takeaways: ["Optimize supply chains with IT", "Master HR recruitment cycle", "Develop leadership vision"],
        content: [
            {
                heading: "5.1 & 5.2 SCM & Logistics Overview",
                text: "Managing the flow from raw materials to final consumer.\n\n" +
                      "• **SCM (Supply Chain Management)**: The big picture (Suppliers -> Manufacturers -> Retailers).\n" +
                      "• **Logistics**: Movement and storage part. *Example: FedEx managing the shipping route for an online order.*\n" +
                      "• **Components**: Procurement, Inventory, Warehousing, and Transportation."
            },
            {
                heading: "5.3 Role of IT in Supply Chain",
                text: "Digitizing the physical flow of goods.\n\n" +
                      "• **RFID/Barcodes**: For tracking individual items. *Example: Scanning a barcode to see a product's origin instantly.*\n" +
                      "• **Demand Forecasting**: Using AI to predict how many units will sell."
            },
            {
                heading: "5.4 HRM Principles & Significance",
                text: "Acquiring and developing the best talent.\n\n" +
                      "• **Meaning**: Strategic management of employees.\n" +
                      "• **Significance**: Better productivity and improved company culture. *Example: Netflix's famous 'Culture Memo' attracting top-tier engineering talent.*"
            },
            {
                heading: "5.5 Recruitment, Selection & Training",
                text: "The lifecycle of an employee in an organization.\n\n" +
                      "• **Recruitment**: Posting jobs and attracting candidates.\n" +
                      "• **Selection**: Interviewing and testing. *Example: A tech company giving a coding test to find the best developer.*\n" +
                      "• **Training**: On-the-job (mentorship) or Off-the-job (workshops)."
            },
            {
                heading: "5.6 Supervisor Qualities & Leadership",
                text: "What makes a great leader of people?\n\n" +
                      "• **Technical Skills**: *Example: A coding team lead being able to fix complex bugs.*\n" +
                      "• **Styles**:\n" +
                      "  - **Autocratic**: 'Do as I say'.\n" +
                      "  - **Democratic**: 'What do you think?'.\n" +
                      "  - **Transformational**: Inspiring the team toward a shared future goal. *Example: Steve Jobs inspiring Apple to 'Think Different'.*"
            }
        ]
    }
];

const StudyNotes = ({ onStartQuiz }) => {
    const [selectedUnit, setSelectedUnit] = useState(STUDY_DATA[0]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = STUDY_DATA.filter(unit =>
        unit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.content.some(c => c.heading.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderText = (text) => {
        return text.split('\n').map((line, i) => {
            if (line.startsWith('•')) {
                const content = line.replace('•', '').trim();
                return (
                    <div key={i} className="bullet-line">
                        <span className="bullet">→</span>
                        <span>{parseBoldAndItalic(content)}</span>
                    </div>
                );
            }
            return <p key={i}>{parseBoldAndItalic(line)}</p>;
        });
    };

    const parseBoldAndItalic = (text) => {
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <i key={i} className="example-text">{part.slice(1, -1)}</i>;
            }
            return part;
        });
    };

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
                            <div className="unit-icon-box">
                                {unit.icon}
                            </div>
                            <div className="unit-nav-info">
                                <span className="unit-num">Unit {unit.unit}</span>
                                <span className="unit-title-short">{unit.title}</span>
                            </div>
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
                                <div className="reader-meta">
                                    <span className="category-badge">Unit {selectedUnit.unit}</span>
                                    <span className="reading-time">
                                        <Book size={14} className="inline-icon" /> {selectedUnit.readingTime} read
                                    </span>
                                </div>
                                <h1>{selectedUnit.title}</h1>
                                <p className="reader-desc">{selectedUnit.description}</p>
                                
                                <div className="takeaways-box">
                                    <h4>Key Takeaways:</h4>
                                    <ul>
                                        {selectedUnit.takeaways.map((tk, i) => (
                                            <li key={i}>{tk}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="reader-body">
                                {selectedUnit.content.map((section, idx) => (
                                    <section key={idx} className="notes-section">
                                        <h3>{section.heading}</h3>
                                        <div className="section-text-content">
                                            {renderText(section.text)}
                                        </div>
                                    </section>
                                ))}
                            </div>

                            <div className="reader-footer">
                                <div className="footer-flex">
                                    <p>Source: Official MSBTE Syllabus Alignment 2026</p>
                                    <button 
                                        className="btn-quick-test"
                                        onClick={() => onStartQuiz({ unit: selectedUnit.id, topic: 'Full Unit' })}
                                    >
                                        <Play size={16} /> Take Unit {selectedUnit.unit} Test
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default StudyNotes;
