// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import api from '../services/api';
import FortuneHeatmap from '../components/FortuneHeatmap';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime } from '../utils/timeUtils'; // <-- IMPORT

const ProfilePage = ({ isMePage = false }) => {
    const { t } = useTranslation();
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
            setError(t('userNotSpecified'));
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            setError('');
            
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
                setError(profileResponse.error || t('userNotFound'));
            }
            
            if (historyResponse.success) {
                setHistoryData(historyResponse.data.history);
            }

            setLoading(false);
        };
        fetchProfile();
    }, [usernameToFetch, isMePage, t]);

    if (loading) return <div className="page-container">{t('loadingProfile')}</div>;
    if (error) return <div className="page-container error-message">{error}</div>;
    if (!profileData) return <div className="page-container">{t('userNotFound')}</div>;

    const pageStyles = { /* ... */ };
    if (profileData.background_url) {
        pageStyles.backgroundImage = `url(${profileData.background_url})`;
    }

    return (
        <div className="profile-page-wrapper" style={pageStyles}>
            <div className="profile-page-content">

                <div className="profile-header">
                    {/* ... Avatar and H1 ... */}
                </div>
                
                <p className="fortune-summary">
                    {/* ... Fortune summary ... */}
                </p>

                {profileData.bio && (
                    <p className="bio">{profileData.bio}</p>
                )}
                
                <h3>{t('fortuneHistory')}</h3>
                <FortuneHeatmap data={historyData} />
                
                <div className="profile-footer">
                    <span>{t('joined', { date: new Date(profileData.registration_date).toLocaleDateString() })}</span>
                    
                    {/* vvv THIS IS THE CHANGE vvv */}
                    <span>{t('time.active')}: {formatRelativeTime(profileData.last_active_date, t)}</span>
                    {/* ^^^ END OF CHANGE ^^^ */}
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;