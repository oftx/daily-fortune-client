// src/pages/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPage = () => {
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

    if (loading) return <div className="page-container">Loading users...</div>;
    if (error) return <div className="page-container error-message">{error}</div>;

    return (
        <div className="page-container admin-container">
            <h1>User Management</h1>
            <h3>List of all users ({users.length}):</h3>
            <ul className="leaderboard-list">
                {users.map(user => (
                    <li key={user.id}>
                        <strong>{user.username}</strong> ({user.email}) - Role: {user.role}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminPage;