// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import FortuneHeatmap from '../components/FortuneHeatmap';
import { useAuth } from '../hooks/useAuth';

const ProfilePage = ({ isMePage = false }) => {
    const paramsUsername = useParams().username;
    const { user: currentUser } = useAuth();
    
    const usernameToFetch = isMePage ? currentUser?.username : paramsUsername;

    const [profileData, setProfileData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!usernameToFetch) {
            if (isMePage) return;
            setError("User not specified.");
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            setError('');
            
            // For the user's own page, we use getMyProfile to get the extra `has_drawn_today` flag
            const profilePromise = isMePage 
                ? api.getMyProfile() 
                : api.getUserProfile(usernameToFetch);

            const [profileResponse, historyResponse] = await Promise.all([
                profilePromise,
                api.getUserFortuneHistory(usernameToFetch)
            ]);

            if (profileResponse.success) {
                setProfileData(profileResponse.data);
            } else {
                setError(profileResponse.error || "User not found.");
            }
            
            if (historyResponse.success) {
                setHistoryData(historyResponse.data.history);
            }

            setLoading(false);
        };
        fetchProfile();
    }, [usernameToFetch, isMePage]);

    if (loading) return <div className="page-container">Loading profile...</div>;
    if (error) return <div className="page-container error-message">{error}</div>;
    if (!profileData) return <div className="page-container">User not found.</div>;

    return (
        <div className="page-container">
            <h1>{profileData.display_name}'s Profile</h1>
            
            <p className="fortune-summary">
                {/* vvv MODIFICATION FOR PROBLEM 1 vvv */}
                {isMePage && !profileData.has_drawn_today && (
                    <span>
                        Today's fortune not yet drawn. <Link to="/">Draw now</Link>.{' '}
                    </span>
                )}
                Drawn a total of <strong>{profileData.total_draws}</strong> times.
            </p>

            {/* vvv MODIFICATION FOR PROBLEM 2 vvv */}
            {profileData.bio && (
                <p className="bio">{profileData.bio}</p>
            )}
            
            <h3>Fortune History</h3>
            <FortuneHeatmap data={historyData} />
            
            <div className="profile-footer">
                <span>Joined: {new Date(profileData.registration_date).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default ProfilePage;