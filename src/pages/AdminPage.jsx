// src/pages/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';

const actionButtonStyle = {
  marginLeft: '10px',
  padding: '4px 8px',
  fontSize: '0.8rem',
  cursor: 'pointer',
  border: '1px solid var(--border-color)',
  borderRadius: '4px',
  backgroundColor: 'var(--bg-primary)'
};

const tagBadgeStyle = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    marginRight: '6px',
    marginBottom: '6px',
    backgroundColor: 'var(--link-color)',
    color: 'white',
};

const AdminPage = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [confirmAction, setConfirmAction] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [currentTags, setCurrentTags] = useState([]);
    const [newTag, setNewTag] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        const response = await api.getAllUsers();
        if (response.success) {
            setUsers(response.data);
        } else {
            setError(response.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleActionClick = (action, user) => {
        setConfirmAction({ action, user });
    };

    const handleConfirm = async () => {
        if (!confirmAction) return;
        const { action, user } = confirmAction;
        let response;
        if (action === 'activate' || action === 'deactivate') {
            const newStatus = action === 'activate' ? 'active' : 'inactive';
            response = await api.updateUserStatus(user.id, newStatus);
        } else if (action === 'hide' || action === 'unhide') {
            const newVisibility = action === 'hide';
            response = await api.updateUserVisibility(user.id, newVisibility);
        }
        if (response.success) {
            fetchUsers(); 
        } else {
            setError(response.error || 'An unknown error occurred.');
        }
        setConfirmAction(null);
    };
    
    const openTagEditor = (user) => {
        setEditingUser(user);
        setCurrentTags(user.tags || []);
        setNewTag('');
    };

    const closeTagEditor = () => {
        setEditingUser(null);
        setCurrentTags([]);
    };

    const handleAddTag = () => {
        if (newTag && !currentTags.includes(newTag)) {
            setCurrentTags([...currentTags, newTag]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
    };

    const handleSaveTags = async () => {
        if (!editingUser) return;
        const response = await api.updateUserTags(editingUser.id, currentTags);
        if (response.success) {
            fetchUsers();
            closeTagEditor();
        } else {
            setError(response.error || 'Failed to save tags.');
        }
    };

    if (loading) return <div className="page-container">{t('loading')}</div>;
    if (error) return <div className="page-container error-message">{error}</div>;

    const getModalContent = () => {
        if (!confirmAction) return { title: '', content: '' };
        const { action, user } = confirmAction;
        const name = user.display_name || user.username;
        switch(action) {
            case 'deactivate': return { title: t('deactivate'), content: t('confirmDeactivateUser', { name }) };
            case 'activate': return { title: t('activate'), content: t('confirmActivateUser', { name }) };
            case 'hide': return { title: t('hide'), content: t('confirmHideUser', { name }) };
            case 'unhide': return { title: t('unhide'), content: t('confirmUnhideUser', { name }) };
            default: return { title: '', content: '' };
        }
    };
    const modalInfo = getModalContent();

    return (
        <>
            <div className="page-container admin-container">
                <h1>{t('adminTitle')}</h1>
                <h3>{t('userListTitle', { count: users.length })}</h3>
                <ul className="leaderboard-list">
                    {users.map(user => (
                        <li key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Link to={`/u/${user.username}`}>
                                    <strong>{user.display_name || user.username}</strong>
                                </Link>
                                {' '}
                                ({user.email}) - {t('userRole', { role: user.role })}
                                {user.status === 'inactive' && <span style={{color: 'red', marginLeft: '10px'}}> [{t('deactivatedTag')}]</span>}
                                {user.is_hidden && <span style={{color: 'grey', marginLeft: '10px'}}> [{t('hiddenTag')}]</span>}
                            </div>
                            <div>
                                <button style={actionButtonStyle} onClick={() => openTagEditor(user)}>{t('editTags')}</button>
                                <button style={actionButtonStyle} onClick={() => handleActionClick(user.status === 'active' ? 'deactivate' : 'activate', user)}>
                                    {user.status === 'active' ? t('deactivate') : t('activate')}
                                </button>
                                <button style={actionButtonStyle} onClick={() => handleActionClick(user.is_hidden ? 'unhide' : 'hide', user)}>
                                    {user.is_hidden ? t('unhide') : t('hide')}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            
            <ConfirmModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirm}
                title={modalInfo.title}
            >
                <p>{modalInfo.content}</p>
            </ConfirmModal>

            <Modal
                isOpen={!!editingUser}
                onClose={closeTagEditor}
                title={`${t('editTags')} - ${editingUser?.display_name || ''}`}
            >
                <div style={{ marginBottom: '1rem' }}>
                    {currentTags.map(tag => (
                        <span key={tag} style={tagBadgeStyle}>
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} style={{ marginLeft: '5px', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer' }}>&times;</button>
                        </span>
                    ))}
                    {currentTags.length === 0 && <p>No tags yet.</p>}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder={t('addTag')}
                        style={{ flexGrow: 1, padding: '8px' }}
                    />
                    <button onClick={handleAddTag}>{t('addTag')}</button>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={closeTagEditor}>{t('cancel')}</button>
                    <button onClick={handleSaveTags} style={{ fontWeight: 'bold' }}>{t('save')}</button>
                </div>
            </Modal>
        </>
    );
};

export default AdminPage;