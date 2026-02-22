import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/* Animation phases:
   0 → intro (dark room)
   1 → character walks in from left
   2 → character stops, bows
   3 → bag opens (lid flips up)
   4 → login form rises out of bag
   5 → character walks off-screen (right)
   6 → form fully visible, character gone
*/

// ── SVG Character (student with bag) ──
const Student = ({ phase }) => {
    const isWalking = phase === 1 || phase === 5;
    const holdBag = phase >= 2;

    return (
        <svg viewBox="0 0 80 140" width="90" height="140" className="student-svg">
            {/* Shadow */}
            <ellipse cx="40" cy="138" rx="18" ry="4" fill="rgba(79,70,229,0.2)" />

            {/* Body */}
            <rect x="26" y="58" width="28" height="38" rx="10" fill="#4f46e5" />

            {/* Shirt stripe */}
            <rect x="26" y="68" width="28" height="4" rx="2" fill="#6366f1" opacity="0.6" />

            {/* Head */}
            <circle cx="40" cy="42" r="18" fill="#fde68a" />
            {/* Hair */}
            <ellipse cx="40" cy="28" rx="18" ry="8" fill="#1e1b4b" />
            {/* Eyes */}
            <circle cx="34" cy="42" r="3" fill="white" />
            <circle cx="46" cy="42" r="3" fill="white" />
            <circle cx="35" cy="43" r="1.5" fill="#1e1b4b" />
            <circle cx="47" cy="43" r="1.5" fill="#1e1b4b" />
            {/* Smile */}
            <path d="M 35 50 Q 40 55 45 50" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Left arm */}
            <motion.g
                animate={isWalking ? { rotate: [10, -10, 10] } : { rotate: 0 }}
                transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                style={{ transformOrigin: '24px 62px' }}
            >
                <rect x="14" y="60" width="10" height="28" rx="5" fill="#fde68a" />
            </motion.g>

            {/* Right arm holding bag */}
            <motion.g
                animate={isWalking ? { rotate: [-10, 10, -10] } : { rotate: 0 }}
                transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                style={{ transformOrigin: '56px 62px' }}
            >
                <rect x="56" y="60" width="10" height="28" rx="5" fill="#fde68a" />
            </motion.g>

            {/* Legs */}
            <motion.g
                animate={isWalking ? { rotate: [12, -12, 12] } : { rotate: 0 }}
                transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                style={{ transformOrigin: '33px 96px' }}
            >
                <rect x="27" y="94" width="13" height="38" rx="6" fill="#312e81" />
                <rect x="24" y="126" width="16" height="8" rx="4" fill="#4f46e5" />
            </motion.g>
            <motion.g
                animate={isWalking ? { rotate: [-12, 12, -12] } : { rotate: 0 }}
                transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                style={{ transformOrigin: '47px 96px' }}
            >
                <rect x="40" y="94" width="13" height="38" rx="6" fill="#312e81" />
                <rect x="40" y="126" width="16" height="8" rx="4" fill="#4f46e5" />
            </motion.g>
        </svg>
    );
};

// ── SVG Bag ──
const Bag = ({ isOpen }) => (
    <svg viewBox="0 0 70 80" width="80" height="90" className="bag-svg">
        {/* Strap */}
        <path d="M 25 12 Q 25 4 35 4 Q 45 4 45 12" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Bag body */}
        <rect x="8" y="12" width="54" height="52" rx="10" fill="#7c3aed" />
        <rect x="8" y="12" width="54" height="52" rx="10" fill="url(#bagGrad)" />
        <defs>
            <linearGradient id="bagGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
        </defs>

        {/* Bag flap / lid */}
        <motion.path
            d="M 8 30 Q 8 12 35 12 Q 62 12 62 30 L 62 34 Q 62 36 35 36 Q 8 36 8 34 Z"
            fill="#6d28d9"
            animate={isOpen ? { rotateX: -120, y: -20, opacity: 0.3 } : { rotateX: 0, y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: '35px 12px' }}
        />

        {/* Lock clasp */}
        <motion.circle
            cx="35" cy="33" r="5" fill="#fbbf24"
            animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
        />
        <motion.circle cx="35" cy="33" r="2.5" fill="#f59e0b" />

        {/* Bag shine */}
        <ellipse cx="24" cy="22" rx="5" ry="8" fill="white" opacity="0.1" transform="rotate(-20 24 22)" />

        {/* Pencil inside */}
        <motion.rect
            x="32" y="20" width="4" height="16" rx="2" fill="#fbbf24"
            animate={isOpen ? { y: [0, -20], opacity: [1, 0] } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
        />
    </svg>
);

// ── Interactive Cursor Net (Constellation) Effect ──
const CursorNet = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            const amount = Math.floor((canvas.width * canvas.height) / 15000);
            particles = [];
            for (let i = 0; i < amount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1
                });
            }
        };

        let animationFrameId;

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Mouse interaction
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    ctx.beginPath();
                    ctx.lineWidth = 1 - dist / mouse.radius;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }

                // Particle to particle connection
                for (let i_inner = i + 1; i_inner < particles.length; i_inner++) {
                    const p2 = particles[i_inner];
                    const dx2 = p.x - p2.x;
                    const dy2 = p.y - p2.y;
                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                    if (dist2 < 100) {
                        ctx.beginPath();
                        ctx.lineWidth = 0.5 - dist2 / 100;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener('resize', () => { resize(); createParticles(); });
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        createParticles();
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="cursor-canvas" />;
};

// ── MAIN LOGIN COMPONENT ──
const Login = ({ onToggle }) => {
    const [phase, setPhase] = useState(0);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const { login } = useAuth();

    const charControls = useAnimation();
    const bagControls = useAnimation();
    const roomControls = useAnimation();

    // Full animation sequence
    useEffect(() => {
        const runIntro = async () => {
            // Phase 0: Room lights up
            await roomControls.start({ opacity: 1, transition: { duration: 0.8 } });
            await new Promise(r => setTimeout(r, 300));

            // Phase 1: Character walks in from far left
            setPhase(1);
            await charControls.start({
                x: 0,
                transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] }
            });
            await new Promise(r => setTimeout(r, 200));

            // Phase 2: Character bows / acknowledges
            setPhase(2);
            await charControls.start({ y: [0, -10, 0], transition: { duration: 0.5, ease: 'easeInOut' } });
            await new Promise(r => setTimeout(r, 400));

            // Phase 3: Bag opens
            setPhase(3);
            await new Promise(r => setTimeout(r, 700));

            // Phase 4: Form rises
            setPhase(4);
            await new Promise(r => setTimeout(r, 600));

            // Phase 5: Character waves and walks off right
            setPhase(5);
            await charControls.start({
                x: 600,
                transition: { duration: 1.2, ease: [0.6, 0, 0.8, 1] }
            });

            // Phase 6: Fully in login mode
            setPhase(6);
        };

        runIntro();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(username, password);
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isCovering = passwordFocused || password.length > 0;

    return (
        <motion.div
            className="login-stage"
            initial={{ opacity: 0 }}
            animate={roomControls}
        >
            <CursorNet />
            {/* Background blobs */}
            <div className="stage-blob stage-blob-1" />
            <div className="stage-blob stage-blob-2" />

            {/* ── CHARACTER & BAG SCENE ── */}
            <AnimatePresence>
                {phase < 6 && (
                    <motion.div
                        className="character-scene"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    >
                        {/* Ground line */}
                        <div className="stage-ground" />

                        {/* Character + Bag group */}
                        <motion.div
                            className="char-group"
                            initial={{ x: -400 }}
                            animate={charControls}
                        >
                            {/* Walking body */}
                            <motion.div
                                animate={phase === 1 || phase === 5
                                    ? { y: [0, -6, 0, -6, 0] }
                                    : { y: 0 }}
                                transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                            >
                                <Student phase={phase} />
                            </motion.div>

                            {/* Wave hand on phase 5 */}
                            <AnimatePresence>
                                {phase === 5 && (
                                    <motion.div
                                        className="wave-hand"
                                        initial={{ opacity: 0, rotate: 0 }}
                                        animate={{ opacity: 1, rotate: [0, 30, -10, 30, 0] }}
                                        transition={{ duration: 1, repeat: 0 }}
                                    >
                                        👋
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Bag */}
                            <motion.div
                                className="bag-holder"
                                animate={phase >= 3 ? { y: -20, scale: 1.15 } : { y: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                            >
                                <Bag isOpen={phase >= 3} />
                            </motion.div>
                        </motion.div>

                        {/* Speech bubble on phase 2 */}
                        <AnimatePresence>
                            {phase === 2 && (
                                <motion.div
                                    className="speech-bubble"
                                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    ✨ I have something for you!
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── LOGIN FORM (rises from bag) ── */}
            <AnimatePresence>
                {phase >= 4 && (
                    <motion.div
                        className="auth-card animated-auth from-bag"
                        initial={{ opacity: 0, y: 250, scale: 0.7 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
                    >
                        {/* Mascot peeking from top */}
                        <div className="mascot-mini">
                            <svg viewBox="0 0 60 50" width="60" height="50">
                                <circle cx="30" cy="30" r="22" fill="#6366f1" />
                                <circle cx="22" cy="28" r="6" fill="white" />
                                <circle cx="38" cy="28" r="6" fill="white" />
                                <motion.circle
                                    cx="23" cy="29" r="3"
                                    fill="#1e1b4b"
                                    animate={{ cx: isCovering ? 22 : 24 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                />
                                <motion.circle
                                    cx="39" cy="29" r="3"
                                    fill="#1e1b4b"
                                    animate={{ cx: isCovering ? 38 : 37 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                />
                                {/* Hands if covering */}
                                {isCovering && (
                                    <motion.g
                                        initial={{ y: 15, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <rect x="10" y="22" width="16" height="10" rx="5" fill="#818cf8" />
                                        <rect x="34" y="22" width="16" height="10" rx="5" fill="#818cf8" />
                                    </motion.g>
                                )}
                                {/* Smile */}
                                <path d="M 22 38 Q 30 44 38 38" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                            </svg>
                        </div>

                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Welcome Back!
                        </motion.h2>
                        <p>Ready to level up your management skills?</p>

                        <form onSubmit={handleSubmit}>
                            <motion.div
                                className="input-group"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <span className="input-icon">👤</span>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setPasswordFocused(false)}
                                    required
                                    autoComplete="username"
                                />
                            </motion.div>

                            <motion.div
                                className="input-group"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.65 }}
                            >
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    required
                                    autoComplete="current-password"
                                />
                            </motion.div>

                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        className="error-text"
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                className="btn-primary auth-btn"
                                disabled={loading}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.96 }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                {loading ? <Loader2 className="spinner" size={20} /> : '🚀 Log In'}
                            </motion.button>
                        </form>

                        <motion.p
                            className="auth-footer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                        >
                            Don't have an account? <span onClick={onToggle}>Register</span>
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Login;
