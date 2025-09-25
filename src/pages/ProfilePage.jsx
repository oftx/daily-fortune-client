// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import api from '../services/api';
import FortuneHeatmap from '../components/FortuneHeatmap';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime } from '../utils/timeUtils';

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

    const hasBackground = !!profileData.background_url;
    const wrapperClassName = hasBackground ? "profile-page-wrapper has-background" : "page-container";
    const pageStyles = hasBackground ? { backgroundImage: `url(${profileData.background_url})` } : {};

    // --- NEW: A variable to determine if the top summary text should be shown ---
    const shouldShowFortuneSummary = (isMePage && !profileData.has_drawn_today) || profileData.has_drawn_today;

    return (
        <div className={wrapperClassName} style={pageStyles}>
            <div className={hasBackground ? "profile-page-content" : ""}>

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
                
                {/* --- MODIFICATION START: This block is now cleaner and conditional --- */}
                {shouldShowFortuneSummary && (
                    <p className="fortune-summary">
                        {/* Case A: Viewing your OWN profile & haven't drawn */}
                        {isMePage && !profileData.has_drawn_today && (
                            <span>
                                {t('notDrawnYet')}{' '}
                                <Link to="/">{t('drawNowLink')}</Link>
                            </span>
                        )}

                        {/* Case B: Any user (self or other) who has drawn */}
                        {profileData.has_drawn_today && (
                             <span>
                                {isMePage ? t('yourTodayFortuneIs') : t('genericTodayFortuneIs')}
                                <strong>{profileData.todays_fortune}</strong>
                            </span>
                        )}
                    </p>
                )}
                {/* --- MODIFICATION END --- */}

                {profileData.bio && (
                    <p className="bio">{profileData.bio}</p>
                )}
                
                <h3>{t('fortuneHistory')}</h3>
                <FortuneHeatmap data={historyData} />
                
                {/* --- MODIFICATION START: Moved total draws count here --- */}
                <div className="profile-footer">
                    <span>
                        <Trans i18nKey="drawnTotalTimes" count={profileData.total_draws}>
                          Drawn a total of <strong>{{count: profileData.total_draws}}</strong> times.
                        </Trans>
                    </span>
                    <span>{t('joined', { date: new Date(profileData.registration_date).toLocaleDateString() })}</span>
                    <span>{t('time.active')}: {formatRelativeTime(profileData.last_active_date, t)}</span>
                </div>
                {/* --- MODIFICATION END --- */}

            </div>
        </div>
    );
};

export default ProfilePage;