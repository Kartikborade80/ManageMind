import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, ThumbsUp, PlusCircle, Loader2, X, Send, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const TrendingTopic = () => {
    const [topics, setTopics] = useState([])
    const [loading, setLoading] = useState(true)
    const [showSuggestModal, setShowSuggestModal] = useState(false)
    const [suggestLoading, setSuggestLoading] = useState(false)
    const [expandedTopic, setExpandedTopic] = useState(null)
    const [expandedInsights, setExpandedInsights] = useState(null)
    const [activeTrendMCQ, setActiveTrendMCQ] = useState(null)
    const [comments, setComments] = useState({}) // { topicId: [comments] }
    const [commentsLoading, setCommentsLoading] = useState({})
    const [newComment, setNewComment] = useState({}) // { topicId: text }
    const [submittingComment, setSubmittingComment] = useState({})
    const { user } = useAuth()

    useEffect(() => {
        fetchTopics()
    }, [])

    const fetchTopics = async () => {
        try {
            const res = await api.get('/api/trending')
            setTopics(res.data)
        } finally {
            setLoading(false)
        }
    }

    const fetchComments = async (topicId) => {
        setCommentsLoading(prev => ({ ...prev, [topicId]: true }))
        try {
            const res = await api.get(`/api/comments/${topicId}`)
            setComments(prev => ({ ...prev, [topicId]: res.data }))
        } catch (err) {
            console.error('Failed to load insights:', err)
        } finally {
            setCommentsLoading(prev => ({ ...prev, [topicId]: false }))
        }
    }

    const toggleInsights = (topicId) => {
        if (expandedInsights === topicId) {
            setExpandedInsights(null)
        } else {
            setExpandedInsights(topicId)
            if (!comments[topicId]) {
                fetchComments(topicId)
            }
        }
    }

    const handleAddComment = async (topicId) => {
        const text = newComment[topicId]?.trim()
        if (!text) return
        setSubmittingComment(prev => ({ ...prev, [topicId]: true }))
        try {
            await api.post('/api/comments/', {
                user_id: String(user.id),
                username: user.full_name || user.username,
                target_id: String(topicId),
                content: text,
            })
            setNewComment(prev => ({ ...prev, [topicId]: '' }))
            await fetchComments(topicId)
        } catch (err) {
            console.error('Failed to post insight:', err)
        } finally {
            setSubmittingComment(prev => ({ ...prev, [topicId]: false }))
        }
    }

    const handleVoteComment = async (commentId, topicId) => {
        try {
            await api.post(`/api/comments/${commentId}/vote?direction=1`)
            await fetchComments(topicId)
        } catch (err) {
            console.error(err)
        }
    }

    const handleVote = async (topicId, type) => {
        try {
            await api.post(`/api/trending/${topicId}/vote?vote_type=${type}`)
            fetchTopics()
        } catch (err) {
            console.error(err)
        }
    }

    const handlePollVote = async (topicId, optionId) => {
        try {
            await api.post(`/api/polls/${topicId}/vote`, {
                user_id: user.id,
                option_id: optionId
            })
            fetchTopics()
        } catch (err) {
            console.error(err)
        }
    }

    const handleSuggest = async (e) => {
        e.preventDefault()
        setSuggestLoading(true)
        const fd = new FormData(e.target)
        try {
            await api.post('/api/trending/suggest', {
                title: fd.get('title'),
                description: fd.get('description'),
                tags: fd.get('tags').split(',').map(t => t.trim()).filter(t => t)
            })
            setShowSuggestModal(false)
            fetchTopics()
        } catch (err) {
            alert('Failed to suggest topic')
        } finally {
            setSuggestLoading(false)
        }
    }

    if (loading) return <div className="loading-state"><Loader2 className="spinner" /> Loading Trends...</div>

    return (
        <div className="trending-container container-fade">
            <header className="page-header header-with-action">
                <div className="header-titles">
                    <h1>Trending Innovation Hub</h1>
                    <p>Suggest and vote on emerging industry trends for management case studies.</p>
                </div>
                <button className="btn-primary btn-with-icon" onClick={() => setShowSuggestModal(true)}>
                    <PlusCircle size={18} /> Suggest New Topic
                </button>
            </header>

            <div className="topics-list">
                {topics.length > 0 ? topics.map(topic => (
                    <motion.div
                        key={topic.id}
                        whileHover={{ y: -3 }}
                        className="topic-card"
                    >
                        <div className={`topic-badge ${topic.is_live ? 'live' : 'pending'}`}>
                            {topic.is_live ? 'Live Trend' : 'Pending Approval'}
                        </div>
                        <div className="topic-header-row">
                            <h3>{topic.title}</h3>
                            <div className="author-badge">
                                <span className="author-label">Posted by</span>
                                <span className="author-name">{topic.author || 'Admin'}</span>
                            </div>
                        </div>
                        <p className="topic-desc">{topic.description}</p>

                        <div className="topic-stats">
                            <span className="stat clickable" onClick={() => handleVote(topic.id, 'approval')}>
                                <ThumbsUp size={16} /> {topic.approval_votes || 0} Votes
                            </span>
                            <span
                                className={`stat clickable ${expandedInsights === topic.id ? 'stat-active' : ''}`}
                                onClick={() => toggleInsights(topic.id)}
                            >
                                <MessageSquare size={16} />
                                {comments[topic.id]?.length ?? (topic.comments?.length || 0)} Insights
                                {expandedInsights === topic.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </span>
                            <button className="btn-text" onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}>
                                {expandedTopic === topic.id ? 'Close Article' : 'Read Case Study'}
                            </button>
                        </div>

                        {/* ── Insights Panel ── */}
                        <AnimatePresence>
                            {expandedInsights === topic.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="insights-panel"
                                >
                                    <h4 className="insights-title"><MessageSquare size={16} /> Community Insights</h4>

                                    {/* Comment Input */}
                                    <div className="insight-input-row">
                                        <div className="insight-avatar">
                                            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                        </div>
                                        <textarea
                                            className="insight-textarea"
                                            placeholder="Share your perspective on this trend..."
                                            value={newComment[topic.id] || ''}
                                            onChange={e => setNewComment(prev => ({ ...prev, [topic.id]: e.target.value }))}
                                            rows={2}
                                        />
                                        <button
                                            className="insight-send-btn"
                                            onClick={() => handleAddComment(topic.id)}
                                            disabled={submittingComment[topic.id] || !newComment[topic.id]?.trim()}
                                        >
                                            {submittingComment[topic.id] ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
                                        </button>
                                    </div>

                                    {/* Comments List */}
                                    {commentsLoading[topic.id] ? (
                                        <div className="insights-loading"><Loader2 className="spinner" size={20} /> Loading insights...</div>
                                    ) : comments[topic.id]?.length > 0 ? (
                                        <div className="comments-list">
                                            {comments[topic.id].map(comment => (
                                                <div key={comment.id} className="comment-item">
                                                    <div className="comment-avatar">
                                                        {comment.username?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="comment-body">
                                                        <div className="comment-meta">
                                                            <span className="comment-username">{comment.username}</span>
                                                            <span className="comment-time">
                                                                {new Date(comment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                        <p className="comment-content">{comment.content}</p>
                                                        <button
                                                            className="comment-vote-btn"
                                                            onClick={() => handleVoteComment(comment.id, topic.id)}
                                                        >
                                                            <ThumbsUp size={12} /> {comment.votes || 0}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="comments-empty">
                                            <Sparkles size={24} />
                                            <p>No insights yet. Be the first to share your perspective!</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Article Expand ── */}
                        <AnimatePresence>
                            {expandedTopic === topic.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="topic-article-body"
                                >
                                    <div className="article-main" dangerouslySetInnerHTML={{ __html: topic.article_content }} />

                                    {topic.real_world_example && (
                                        <div className="real-world-box">
                                            <h5><Sparkles size={14} /> Real World Example</h5>
                                            <p>{topic.real_world_example}</p>
                                        </div>
                                    )}

                                    {topic.poll && topic.poll.options && (
                                        <div className="trend-poll">
                                            <h4>{topic.poll.question}</h4>
                                            <div className="poll-options">
                                                {topic.poll.options.map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        className="poll-option-btn"
                                                        onClick={() => handlePollVote(topic.id, opt.id)}
                                                    >
                                                        <span>{opt.text}</span>
                                                        <span className="vote-badge">{opt.votes || 0}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {topic.mcqs && topic.mcqs.length > 0 && (
                                        <div className="trend-mcqs">
                                            <h4>Check Your Understanding</h4>
                                            {topic.mcqs.map(mcq => (
                                                <div key={mcq.id} className="trend-mcq-item">
                                                    <p className="q-text">{mcq.question}</p>
                                                    <div className="q-options">
                                                        {mcq.options.map(opt => (
                                                            <button
                                                                key={opt.id}
                                                                className={`q-opt-btn ${activeTrendMCQ?.[mcq.id] === opt.id ? (opt.id === mcq.correct_id ? 'correct' : 'wrong') : ''}`}
                                                                onClick={() => setActiveTrendMCQ({ ...activeTrendMCQ, [mcq.id]: opt.id })}
                                                            >
                                                                {opt.text}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {activeTrendMCQ?.[mcq.id] && (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="q-explanation">
                                                            {activeTrendMCQ[mcq.id] === mcq.correct_id ? '✅ Correct! ' : '❌ Incorrect. '}
                                                            {mcq.explanation}
                                                        </motion.div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )) : (
                    <div className="empty-state-full glass-card">
                        <Sparkles className="icon-glow" size={48} />
                        <h3>Curating Hot Topics...</h3>
                        <p>No active trends yet. Be the first to suggest a breakthrough concept!</p>
                        <button className="btn-secondary" onClick={() => setShowSuggestModal(true)}>Suggest Topic</button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showSuggestModal && (
                    <div className="modal-overlay" onClick={() => setShowSuggestModal(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-box suggest-modal"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>Suggest New Topic</h3>
                                <button className="close-btn" onClick={() => setShowSuggestModal(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSuggest} className="suggest-form">
                                <label>Topic Title</label>
                                <input name="title" className="live-input" placeholder="e.g., Lean Six Sigma in Supply Chain" required />
                                <label>Description</label>
                                <textarea name="description" className="live-input text-area" placeholder="Briefly describe why this is trending..." required />
                                <label>Tags (comma separated)</label>
                                <input name="tags" className="live-input" placeholder="e.g., efficiency, strategy, manufacturing" />
                                <button type="submit" className="btn-primary" disabled={suggestLoading}>
                                    {suggestLoading ? <Loader2 className="spinner" /> : <><Send size={16} /> Submit Suggestion</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default TrendingTopic
