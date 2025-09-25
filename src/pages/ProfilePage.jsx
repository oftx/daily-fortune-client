// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import api from '../services/api';
import FortuneHeatmap from '../components/FortuneHeatmap';
import { useAuth } from '../hooks/useAuth';

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
    
    // --- NEW: Add useEffect to manage body class for full-screen background ---
    useEffect(() => {
        // When the component mounts and has a background URL, add a class to the body
        if (profileData?.background_url) {
            document.body.classList.add('profile-background-active');
        }
        // Cleanup function to remove the class when the component unmounts
        return () => {
            document.body.classList.remove('profile-background-active');
        };
    }, [profileData]);


    if (loading) return <div className="page-container">{t('loadingProfile')}</div>;
    if (error) return <div className="page-container error-message">{error}</div>;
    if (!profileData) return <div className="page-container">{t('userNotFound')}</div>;

    const pageStyles = {};
    if (profileData.background_url) {
        pageStyles.backgroundImage = `url(${profileData.background_url})`;
    }

    // --- MODIFIED: Removed 'page-container' from the main wrapper ---
    return (
        <div className="profile-page-wrapper" style={pageStyles}>
            <div className="profile-page-content">

                <div className="profile-header">
                    {profileData.avatar_url && (
                        <div className="profile-avatar">
                            <img
                                src={profileData.avatar_url}
                                alt={`${profileData.display_name}'s avatar`}
                                className="profile-avatar-image"
                            />
                        </div>
                    )}
                    <h1>{t('usersProfile', { name: profileData.display_name })}</h1>
                </div>
                
                <p className="fortune-summary">
                    {isMePage && !profileData.has_drawn_today && (
                        <span>
                            {t('notDrawnYet')}. <Link to="/">{t('drawNowLink')}</Link>.{' '}
                        </span>
                    )}
                    <Trans i18nKey="drawnTotalTimes" count={profileData.total_draws}>
                      Drawn a total of <strong>{{count: profileData.total_draws}}</strong> times.
                    </Trans>
                </p>

                {profileData.bio && (
                    <p className="bio">{profileData.bio}</p>
                )}
                
                <h3>{t('fortuneHistory')}</h3>
                <FortuneHeatmap data={historyData} />
                
                <div className="profile-footer">
                    <span>{t('joined', { date: new Date(profileData.registration_date).toLocaleDateString() })}</span>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;