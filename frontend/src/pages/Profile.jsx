import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Hash, BookOpen, GraduationCap, Building, Save, Edit2, Camera, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AVATAR_PRESETS = [
    { id: 'm1', gender: 'male', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 'm2', gender: 'male', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' },
    { id: 'm3', gender: 'male', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Klaus' },
    { id: 'm4', gender: 'male', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver' },
    { id: 'f1', gender: 'female', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
    { id: 'f2', gender: 'female', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avery' },
    { id: 'f3', gender: 'female', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella' },
    { id: 'f4', gender: 'female', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cora' },
];

const BRANCH_OPTIONS = [
    'Computer Engineering',
    'Information Technology',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'AIML',
    'Other'
];

const ProfileField = ({ icon: Icon, label, name, value, edit, onChange, children }) => (
    <div className="profile-field">
        <div className="field-label">
            <Icon size={18} />
            <span>{label}</span>
        </div>
        {edit ? (
            children ? children : (
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="profile-input"
                />
            )
        ) : (
            <p className="field-value">{value || 'Not set'}</p>
        )}
    </div>
);

const Profile = () => {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isOtherBranch, setIsOtherBranch] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        roll_number: '',
        course: 'Diploma',
        branch: '',
        semester: '',
        college_name: '',
        avatar_url: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (user) {
            const userBranch = user.branch || '';
            const isStandard = BRANCH_OPTIONS.includes(userBranch) || userBranch === '';
            setIsOtherBranch(!isStandard && userBranch !== '');

            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                roll_number: user.roll_number || '',
                course: user.course || 'Diploma',
                branch: userBranch,
                semester: user.semester || '',
                college_name: user.college_name || '',
                avatar_url: user.avatar_url || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBranchSelect = (e) => {
        const val = e.target.value;
        if (val === 'Other') {
            setIsOtherBranch(true);
            setFormData({ ...formData, branch: '' });
        } else {
            setIsOtherBranch(false);
            setFormData({ ...formData, branch: val });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            await api.patch('/api/auth/profile', formData);
            await refreshUser(); // Re-fetch user from server to reflect changes instantly
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            setIsEditing(false);
        } catch (err) {
            setMessage({ text: 'Failed to update profile.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) return <div className="loading-state"><Loader2 className="spinner" /></div>;

    return (
        <div className="profile-container">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="profile-card"
            >
                <header className="profile-header">
                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            {formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="Profile" className="profile-avatar-large" />
                            ) : (
                                <div className="avatar-placeholder-large">
                                    {user?.full_name?.charAt(0) || user?.username?.charAt(0)}
                                </div>
                            )}
                            {isEditing && (
                                <button
                                    type="button"
                                    className="avatar-edit-btn"
                                    onClick={() => setIsEditingAvatar(true)}
                                >
                                    <Camera size={16} />
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {isEditingAvatar && (
                                <div className="avatar-modal-backdrop" onClick={() => setIsEditingAvatar(false)}>
                                    <motion.div
                                        className="avatar-modal-content"
                                        onClick={e => e.stopPropagation()}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <h3>Choose Your Avatar</h3>
                                        <p>Pick a style that represents you on ManageMind.</p>

                                        <div className="avatar-selection-grid">
                                            {AVATAR_PRESETS.map((avatar) => (
                                                <div
                                                    key={avatar.id}
                                                    className={`avatar-option ${formData.avatar_url === avatar.url ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setFormData({ ...formData, avatar_url: avatar.url });
                                                        setIsEditingAvatar(false);
                                                    }}
                                                >
                                                    <img src={avatar.url} alt={avatar.id} />
                                                    <div className="selection-indicator">
                                                        <Check size={14} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            className="btn-secondary w-full"
                                            onClick={() => setIsEditingAvatar(false)}
                                        >
                                            Close
                                        </button>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                        <div className="user-info-basic">
                            <h2>{formData.full_name || user?.username}</h2>
                            <p className="user-role">Student @ {formData.college_name || 'ManageMind'}</p>
                            <p className="user-branch-tag">{formData.branch || 'Branch Not Set'}</p>
                        </div>
                    </div>
                    <button
                        className={`edit-toggle-btn ${isEditing ? 'active' : ''}`}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'Cancel' : <><Edit2 size={16} /> Edit Profile</>}
                    </button>
                </header>

                <form onSubmit={handleSave} className="profile-content">
                    <div className="profile-section">
                        <h3>General Information</h3>
                        <div className="fields-grid">
                            <ProfileField icon={User} label="Full Name" name="full_name" value={formData.full_name} edit={isEditing} onChange={handleChange} />
                            <ProfileField icon={Mail} label="Email Address" name="email" value={formData.email} edit={isEditing} onChange={handleChange} />
                            <ProfileField icon={Hash} label="Roll Number" name="roll_number" value={formData.roll_number} edit={isEditing} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="profile-section">
                        <h3>Educational Details</h3>
                        <div className="fields-grid">
                            <ProfileField icon={BookOpen} label="Course" name="course" value={formData.course} edit={isEditing} onChange={handleChange} />
                            <ProfileField icon={GraduationCap} label="Branch" name="branch" value={formData.branch} edit={isEditing} onChange={handleChange}>
                                {isEditing && (
                                    <div className="branch-selection">
                                        {!isOtherBranch ? (
                                            <select
                                                className="profile-input"
                                                value={formData.branch || ''}
                                                onChange={handleBranchSelect}
                                            >
                                                <option value="" disabled>Select Branch</option>
                                                {BRANCH_OPTIONS.filter(o => o !== 'Other').map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                                <option value="Other">Other (Please specify)</option>
                                            </select>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    name="branch"
                                                    value={formData.branch}
                                                    onChange={handleChange}
                                                    className="profile-input"
                                                    placeholder="Enter custom branch"
                                                    autoFocus
                                                    style={{ flex: 1 }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsOtherBranch(false); setFormData({ ...formData, branch: '' }); }}
                                                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', whiteSpace: 'nowrap' }}
                                                >
                                                    Back to list
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </ProfileField>
                            <ProfileField icon={Hash} label="Semester" name="semester" value={formData.semester} edit={isEditing} onChange={handleChange} />
                            <ProfileField icon={Building} label="College Name" name="college_name" value={formData.college_name} edit={isEditing} onChange={handleChange} />
                        </div>
                    </div>

                    {message.text && (
                        <div className={`profile-message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    {isEditing && (
                        <div className="profile-actions">
                            <button type="submit" className="save-btn" disabled={saving}>
                                {saving ? <Loader2 className="spinner" size={18} /> : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default Profile;
