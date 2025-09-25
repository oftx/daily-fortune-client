// src/pages/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const actionButtonStyle = {
  marginLeft: '10px',
  padding: '4px 8px',
  fontSize: '0.8rem',
  cursor: 'pointer',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const AdminPage = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [confirmAction, setConfirmAction] = useState(null); // { action, user }

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

    if (loading) return <div className="page-container">{t('loading')}</div>;
    if (error) return <div className="page-container error-message">{error}</div>;

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
                                {user.status === 'inactive' && <span style={{color: 'red', marginLeft: '10px'}}>[{t('deactivate')}d]</span>}
                                {user.is_hidden && <span style={{color: 'grey', marginLeft: '10px'}}>[{t('hide')}n]</span>}
                            </div>
                            <div>
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
        </>
    );
};

export default AdminPage;