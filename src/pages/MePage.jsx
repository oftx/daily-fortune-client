import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ProfilePage from './ProfilePage'; // We reuse the ProfilePage component

const MePage = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="page-container">Loading your profile...</div>;
    }

    // *** FIX: Simply render ProfilePage with the isMePage flag. ***
    // The ProfilePage component will handle fetching the correct user ('me').
    return <ProfilePage isMePage={true} />;
};

export default MePage;