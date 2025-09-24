import React from 'react';

const AdminPage = () => {
    // In a real app, you would fetch this list from an API
    const users = ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'];

    return (
        <div className="page-container admin-container">
            <h1>User Management</h1>
            <h3>List of all users:</h3>
            <ul className="user-list">
                {users.map(user => <li key={user}>{user}</li>)}
            </ul>
        </div>
    );
};

export default AdminPage;