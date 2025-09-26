// src/pages/ProfilePage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import api from '../services/api';
import FortuneHeatmap from '../components/FortuneHeatmap';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime } from '../utils/timeUtils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with the necessary plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const tagStyle = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    marginRight: '6px',
    marginBottom: '6px',
};

const customTagStyle = {
    ...tagStyle,
    backgroundColor: 'var(--link-color)',
    color: 'white',
};

const systemTagStyle = {
    ...tagStyle,
    backgroundColor: '#d9534f',
    color: 'white',
};

const ProfilePage = ({ isMePage = false }) => {
    const { t } = useTranslation();
    const paramsUsername = useParams().username;
    const { user: currentUser } = useAuth();
    
    const usernameToFetch = isMePage ? currentUser?.username : paramsUsername;

    const [profileData, setProfileData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const heatmapData = useMemo(() => {
        const displayTimezone = currentUser?.timezone;

        if (!historyData || !displayTimezone || historyData.length === 0) {
            return [];
        }

        const groupedByDate = {};

        historyData.forEach(item => {
            try {
                // --- THIS IS THE FIX ---
                // After fixing api.js, `item.date` now holds the correct date string.
                const date = dayjs(item.date);
                // --- END OF FIX ---
                if (!date.isValid()) return;

                const localDateStr = date.tz(displayTimezone).format('YYYY-MM-DD');
                groupedByDate[localDateStr] = item.fortune; // Use `item.fortune` here
            } catch (e) {
                console.error("Error processing date for heatmap:", item.date, e);
            }
        });
        
        return Object.entries(groupedByDate).map(([date, fortune]) => ({
            date: date,
            fortune: fortune,
        }));

    }, [historyData, currentUser?.timezone]);

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

    const shouldShowFortuneSummary = (isMePage && !profileData.has_drawn_today) || profileData.has_drawn_today;

    const allTags = [];
    if (profileData.status === 'inactive') {
        allTags.push({ text: t('deactivatedTag'), style: systemTagStyle });
    }
    if (profileData.is_hidden) {
        allTags.push({ text: t('hiddenTag'), style: systemTagStyle });
    }
    if (profileData.tags) {
        profileData.tags.forEach(tag => {
            allTags.push({ text: tag, style: customTagStyle });
        });
    }

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
                    <div>
                        <h1>{t('usersProfile', { name: profileData.display_name })}</h1>
                        {allTags.length > 0 && (
                            <div style={{ marginTop: '0.5rem' }}>
                                {allTags.map((tag, index) => (
                                    <span key={index} style={tag.style}>{tag.text}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                {shouldShowFortuneSummary && (
                    <p className="fortune-summary">
                        {isMePage && !profileData.has_drawn_today && (
                            <span>
                                {t('notDrawnYet')}{' '}
                                <Link to="/">{t('drawNowLink')}</Link>
                            </span>
                        )}
                        {profileData.has_drawn_today && (
                             <span>
                                {isMePage ? t('yourTodayFortuneIs') : t('genericTodayFortuneIs')}
                                <strong>{profileData.todays_fortune}</strong>
                            </span>
                        )}
                    </p>
                )}

                {profileData.bio && (
                    <p className="bio">{profileData.bio}</p>
                )}
                
                <h3>{t('fortuneHistory')}</h3>
                <FortuneHeatmap data={heatmapData} />
                
                <div className="profile-footer">
                    <span>
                        <Trans i18nKey="drawnTotalTimes" count={profileData.total_draws}>
                          Drawn a total of <strong>{{count: profileData.total_draws}}</strong> times.
                        </Trans>
                    </span>
                    <span>{t('joined', { date: new Date(profileData.registration_date).toLocaleDateString() })}</span>
                    <span>{t('time.active')}: {formatRelativeTime(profileData.last_active_date, t)}</span>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;