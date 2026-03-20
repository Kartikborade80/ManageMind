import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Leaf, Globe, Activity, ArrowUpRight, Clock, Box } from 'lucide-react';

const CATEGORY_MAP = {
    'Technology': { icon: <Cpu size={14} />, color: '#4f46e5' },
    'Sustainability': { icon: <Leaf size={14} />, color: '#10b981' },
    'Cloud': { icon: <Box size={14} />, color: '#0ea5e9' },
    'Healthcare': { icon: <Activity size={14} />, color: '#ef4444' },
    'Global': { icon: <Globe size={14} />, color: '#f59e0b' }
};

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
];

const TrendingNewsItem = ({ item, index }) => {
    const category = CATEGORY_MAP[item.category] || CATEGORY_MAP['Global'];
    const formattedDate = new Date(item.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const handleImageError = (e) => {
        e.target.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="trend-card-premium"
        >
            <div className="trend-img-container">
                <img 
                    src={item.image_url} 
                    alt={item.title} 
                    onError={handleImageError}
                    className="trend-main-img"
                />
                <div className="trend-img-overlay" />
                <div className="trend-category-tag" style={{ borderLeft: `3px solid ${category.color}` }}>
                    {category.icon}
                    <span>{item.category}</span>
                </div>
            </div>

            <div className="trend-content-premium">
                <div className="trend-meta-top">
                    <span className="trend-date">
                        <Clock size={12} /> {formattedDate}
                    </span>
                    <span className="trend-score">
                        <ArrowUpRight size={12} /> Trending
                    </span>
                </div>
                
                <h3 className="trend-title-premium">{item.title}</h3>
                <p className="trend-desc-premium">{item.content}</p>

                <div className="trend-footer-premium">
                    <button className="btn-read-more-modern">
                        Read Case Study <ArrowUpRight size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const TrendingNews = ({ news }) => {
    if (!news || news.length === 0) {
        return (
            <div className="empty-trends-state">
                <Box size={40} className="text-gray-300" />
                <p>No trending updates available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="trending-news-grid-premium">
            {news.map((item, index) => (
                <TrendingNewsItem key={item.id} item={item} index={index} />
            ))}
        </div>
    );
};

export default TrendingNews;
