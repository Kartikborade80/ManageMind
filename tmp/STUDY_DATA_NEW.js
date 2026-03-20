const STUDY_DATA = [
    {
        unit: 1,
        title: "Introduction to Management",
        description: "Foundations of management, evolution of thought, and essential self-management and managerial skills.",
        content: [
            {
                heading: "1.1 Evolution of Management Thoughts",
                text: "Management in India has deep roots in ancient texts like Kautilya's Arthashastra and the Bhagavad Gita, focusing on 'Dharma-centric' leadership and collective welfare. Modern management has evolved from classical theories to human-relations approaches and system-thinking, integrating global practices with Indian Knowledge Systems (IKS)."
            },
            {
                heading: "1.2 Management Essentials",
                text: "Management is the process of planning, organizing, leading, and controlling resources to achieve goals efficiently. Its importance lies in optimal resource utilization and goal attainment. Characteristics include being goal-oriented, multi-dimensional, and a continuous process. Primary functions are Planning, Organizing, Staffing, Directing, and Controlling."
            },
            {
                heading: "1.3 Taylor & Fayol's Principles",
                text: "F.W. Taylor's Scientific Management focuses on 'Science, not rule of thumb,' emphasizing work study and standardization. Henri Fayol's 14 Principles (e.g., Unity of Command, Scalar Chain, Division of Work) provide a universal administrative framework still used in modern organizations."
            },
            {
                heading: "1.4 Supervisory Management",
                text: "The supervisory level (Lower Management) acts as the bridge between execution and strategy. Key functions include planning daily work, issuing instructions, maintaining discipline, ensuring safety, and providing direct feedback from the shop floor to middle management."
            },
            {
                heading: "1.5 Self Management Skills",
                text: "Essential skills for a modern manager: Self-awareness (strengths/weaknesses), self-discipline, intrinsic motivation, SMART goal setting, effective time management (Eisenhower Matrix), logical decision making, stress management, maintaining work-life balance, and productive multitasking."
            },
            {
                heading: "1.6 Managerial Skills & Leadership",
                text: "Core competencies include negotiation skills (reaching agreements), team management (building synergy), conflict resolution (handling disputes), constructive feedback mechanisms, and leadership (the ability to inspire and guide a group toward a common vision)."
            }
        ]
    },
    {
        unit: 2,
        title: "Product, Operations and Project Management",
        description: "Innovation techniques, product life cycles, Agile methodologies, and project planning tools.",
        content: [
            {
                heading: "2.1 Creativity & Innovation Management",
                text: "Creativity is the generation of ideas; Innovation is their implementation. Techniques include Brainstorming, Checklists, Reverse Brainstorming (identifying problems to find solutions), Morphological Analysis (breaking down complex problems), and De Bono's Six Thinking Hats for diverse perspectives."
            },
            {
                heading: "2.2 NPD & Change Management",
                text: "New Product Development (NPD) involves steps from ideation to commercialization. Change Management is the structured approach to transitioning individuals, teams, and organizations from a current state to a desired future state while minimizing resistance."
            },
            {
                heading: "2.3 Product Management Strategies",
                text: "Product management involves overseeing a product's lifecycle. Strategic steps include visioning, market research, sustainable design (focusing on eco-friendly and long-term viability), and feature prioritization based on customer value."
            },
            {
                heading: "2.4 Agile Product Management",
                text: "Agile emphasizes iterative development, cross-functional teams, and customer collaboration. The Agile Manifesto prioritizes individuals and interactions over processes and tools, and responding to change over following a rigid plan."
            },
            {
                heading: "2.5 Project Management Fundamentals",
                text: "Project management ensures specific goals are met within constraints. The 4Ps of project management are Plan, Processes, People, and Power. Project phases include Initiation, Planning, Execution, Monitoring/Control, and Closing."
            },
            {
                heading: "2.6 Tools of Project Management",
                text: "Key tools include PERT (Program Evaluation and Review Technique) for uncertain timelines, CPM (Critical Path Method) for identifying the longest path of tasks, GANTT charts for visual scheduling, and formal methods for Estimate and Budget tracking."
            }
        ]
    },
    {
        unit: 3,
        title: "Management Practices",
        description: "Modern quality standards, lean manufacturing, and enterprise systems.",
        content: [
            {
                heading: "3.1 Quality Management Tools",
                text: "Quality Circles involve small groups solving work-related problems. Kaizen focuses on continuous small improvements. Six Sigma aims for near-perfection (3.4 defects per million), and Total Quality Management (TQM) integrates quality into all organizational processes."
            },
            {
                heading: "3.2 5S & Lean Manufacturing",
                text: "5S methodology: Sort, Set in Order, Shine, Standardize, Sustain. Lean Manufacturing focuses on waste (Muda) elimination. Tools include Kanban boards for visual flow, TPM (Total Productive Maintenance), and JIT (Just-In-Time) production."
            },
            {
                heading: "3.3 Quality Standards (ISO & OSHA)",
                text: "ISO 9001:2015 is the gold standard for Quality Management Systems. ISO 14000 focuses on Environmental Management. OSHA 2020 (Occupational Safety and Health) ensures workplace safety and health compliance."
            },
            {
                heading: "3.4 ERP Overview",
                text: "Enterprise Resource Planning (ERP) is software that integrates core business processes—finance, HR, sales, and supply chain—into a single system, improving data flow and decision-making across the organization."
            },
            {
                heading: "3.5 Service Quality & Servicescape",
                text: "Service quality measures how well a service meets customer expectations. The Servicescape refers to the physical environment (ambience, layout, signs) where service happens, which significantly influences client satisfaction."
            }
        ]
    },
    {
        unit: 4,
        title: "Marketing Management",
        description: "Strategic marketing mix, customer relationship management, and event/crisis handling.",
        content: [
            {
                heading: "4.1 Marketing Meaning & 7Ps",
                text: "Marketing management is the analysis, planning, and control of programs designed to create exchanges with target buyers. The 7Ps include Product, Price, Place, Promotion, People, Process, and Physical Evidence."
            },
            {
                heading: "4.2 Customer Needs & CRM",
                text: "Marketing begins with identifying Needs, Wants, and Demands. Customer Relationship Management (CRM) uses data analysis to manage relationships with customers, focusing on retention and long-term loyalty."
            },
            {
                heading: "4.3 Traditional vs Digital Marketing",
                text: "Traditional marketing includes print, TV, and mail. Digital marketing leverages the internet, social media, and search engines. Digital offers better targeting, real-time tracking, and often higher ROI for modern businesses."
            },
            {
                heading: "4.4 Event & Crisis Management",
                text: "Event management involves planning and executing large-scale gatherings. Crisis management is the process by which an organization deals with a major disruptive event that threatens to harm the brand or its stakeholders."
            }
        ]
    },
    {
        unit: 5,
        title: "Supply Chain & Human Resource Management",
        description: "Logistics, SCM components, human resource lifecycle, and leadership qualities.",
        content: [
            {
                heading: "5.1 & 5.2 SCM & Logistics Overview",
                text: "Supply Chain Management (SCM) is the management of the flow of goods and services. Logistics is a component of SCM focused on movement and storage. Components include sourcing, warehousing, distribution, and inventory management."
            },
            {
                heading: "5.3 Role of IT in Supply Chain",
                text: "Information Technology enables real-time tracking (RFID, GPS), automated warehousing, demand forecasting via AI/ML, and seamless integration between suppliers and retailers for streamlined logistics."
            },
            {
                heading: "5.4 HRM Principles & Significance",
                text: "Human Resource Management (HRM) is the strategic approach to managing an organization's most valuable asset—its people. Principles include employee development, fair selection, and aligning personal goals with organizational objectives."
            },
            {
                heading: "5.5 Recruitment, Selection & Training",
                text: "Recruitment attracts candidates; Selection chooses the best fit; Training develops necessary skills. The 'Chalk Circle' approach often emphasizes holistic, inclusive, and community-based workforce development."
            },
            {
                heading: "5.6 Supervisor Qualities & Leadership",
                text: "A successful supervisor needs technical competence and emotional intelligence. Leadership types include Autocratic (centralized), Democratic (participative), Laissez-faire (hands-off), and Transformational (inspirational)."
            }
        ]
    }
];
