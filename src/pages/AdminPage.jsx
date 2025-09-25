// src/pages/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const AdminPage = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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
        fetchUsers();
    }, []);

    if (loading) return <div className="page-container">{t('loading')}</div>;
    if (error) return <div className="page-container error-message">{error}</div>;

    return (
        <div className="page-container admin-container">
            <h1>{t('adminTitle')}</h1>
            <h3>{t('userListTitle', { count: users.length })}</h3>
            <ul className="leaderboard-list">
                {users.map(user => (
                    <li key={user.id}>
                        <strong>{user.username}</strong> ({user.email}) - {t('userRole', { role: user.role })}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminPage;