// src/pages/ProfilePage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Tooltip } from 'react-tooltip';
import api from '../services/api';
import FortuneHeatmap from '../components/FortuneHeatmap';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime } from '../utils/timeUtils';
import { getDisplayAvatar } from '../utils/userUtils';
import { calculateEnhancedRarityScore, calculateRarityScoreHistory } from '../utils/fortuneUtils';
import Modal from '../components/Modal';
import RarityScoreChart from '../components/RarityScoreChart';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

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
    const [rarityScore, setRarityScore] = useState(null);
    const [isChartModalOpen, setIsChartModalOpen] = useState(false);
    const [chartData, setChartData] = useState([]);

    // Comparison State
    const [comparisonUser, setComparisonUser] = useState('');
    const [comparisonData, setComparisonData] = useState([]);
    const [leaderboardUsers, setLeaderboardUsers] = useState([]);
    const [inputMode, setInputMode] = useState('manual'); // Default to manual input
    const [isComparing, setIsComparing] = useState(false);

    const heatmapData = useMemo(() => {
        const displayTimezone = currentUser?.timezone;
        if (!historyData || !displayTimezone || historyData.length === 0) return [];
        const groupedByDate = {};
        historyData.forEach(item => {
            try {
                const date = dayjs(item.date);
                if (!date.isValid()) return;
                const localDateStr = date.tz(displayTimezone).format('YYYY-MM-DD');
                groupedByDate[localDateStr] = item.fortune;
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
            const profilePromise = isMePage ? api.getMyProfile() : api.getUserProfile(usernameToFetch);
            const [profileResponse, historyResponse] = await Promise.all([
                profilePromise,
                api.getUserFortuneHistory(usernameToFetch)
            ]);
            if (profileResponse.success) {
                const userProfile = isMePage ? profileResponse.data.user : profileResponse.data;
                setProfileData(userProfile);
            } else {
                setError(profileResponse.error || t('userNotFound'));
            }
            if (historyResponse.success) {
                setHistoryData(historyResponse.data.history);

                const oneYearAgo = dayjs().subtract(1, 'year');
                const recentHistory = historyResponse.data.history.filter(item => dayjs(item.date).isAfter(oneYearAgo));

                if (recentHistory.length > 0) {
                    const counts = recentHistory.reduce((acc, item) => {
                        acc[item.fortune] = (acc[item.fortune] || 0) + 1;
                        return acc;
                    }, {});

                    const score = calculateEnhancedRarityScore(counts);
                    setRarityScore(score);

                    // Calculate history for chart
                    const history = calculateRarityScoreHistory(recentHistory);
                    setChartData(history);
                }

            }
            setLoading(false);
        };
        fetchProfile();
    }, [usernameToFetch, isMePage, t]);

    // Fetch leaderboard for dropdown
    useEffect(() => {
        if (isChartModalOpen && leaderboardUsers.length === 0) {
            const fetchLeaderboard = async () => {
                const response = await api.getLeaderboard();
                if (response.success) {
                    // Flatten the leaderboard data: [{ fortune, users: [...] }] -> [user1, user2, ...]
                    const users = [];
                    response.data.forEach(group => {
                        if (group.users) {
                            users.push(...group.users);
                        }
                    });
                    // Remove duplicates just in case
                    const uniqueUsers = Array.from(new Set(users.map(u => u.username)))
                        .map(username => users.find(u => u.username === username));
                    setLeaderboardUsers(uniqueUsers);
                }
            };
            fetchLeaderboard();
        }
    }, [isChartModalOpen, leaderboardUsers.length]);

    const handleComparisonUserChange = async (username) => {
        setComparisonUser(username);
        if (!username) {
            setComparisonData([]);
            return;
        }

        setIsComparing(true);
        const response = await api.getUserFortuneHistory(username);
        if (response.success) {
            const oneYearAgo = dayjs().subtract(1, 'year');
            const recentHistory = response.data.history.filter(item => dayjs(item.date).isAfter(oneYearAgo));
            const history = calculateRarityScoreHistory(recentHistory);
            setComparisonData(history);
        } else {
            console.error("Failed to fetch comparison data");
            setComparisonData([]);
        }
        setIsComparing(false);
    };

    if (loading) return <div className="page-container">{t('loadingProfile')}</div>;
    if (error) return <div className="page-container error-message">{error}</div>;
    if (!profileData) return <div className="page-container">{t('userNotFound')}</div>;

    const hasBackground = !!profileData.background_url;
    const wrapperClassName = hasBackground ? "profile-page-wrapper has-background" : "page-container";
    const pageStyles = hasBackground ? { backgroundImage: `url(${profileData.background_url})` } : {};
    const shouldShowFortuneSummary = (isMePage && !profileData.has_drawn_today) || profileData.has_drawn_today;

    const allTags = [];
    if (profileData.status === 'inactive') allTags.push({ text: t('deactivatedTag'), style: systemTagStyle });
    if (profileData.is_hidden) allTags.push({ text: t('hiddenTag'), style: systemTagStyle });
    if (profileData.tags) profileData.tags.forEach(tag => allTags.push({ text: tag, style: customTagStyle }));

    const hasAvatarToShow = profileData.avatar_url || (profileData.use_qq_avatar && profileData.qq);

    return (
        <div className={wrapperClassName} style={pageStyles}>
            <div className={hasBackground ? "profile-page-content" : ""}>
                <div className="profile-header">
                    {hasAvatarToShow && (
                        <div className="profile-avatar">
                            <img
                                src={getDisplayAvatar(profileData)}
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
                            Drawn a total of <strong>{{ count: profileData.total_draws }}</strong> times.
                        </Trans>
                    </span>

                    {/* --- 最终版稀有度分数，已按要求集成 --- */}
                    {rarityScore && (
                        <span>
                            {t('rarityScore')}:{' '}
                            <strong
                                data-tooltip-id="rarity-tooltip"
                                data-tooltip-html={`<div style='text-align: center;'>${t('rarityScoreDescription')}<br/>${rarityScore.distributionScore.toFixed(4)} + ${rarityScore.compositionScore.toFixed(4)}<br/><span style='font-size:0.8em; color: #aaa'>(${t('clickToViewChart')})</span></div>`}
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => setIsChartModalOpen(true)}
                            >
                                {Math.round(rarityScore.totalScore)}
                            </strong>
                        </span>
                    )}


                    {/* Rarity Score Chart Modal */}

                    <Modal
                        isOpen={isChartModalOpen}
                        onClose={() => setIsChartModalOpen(false)}
                        title={t('rarityScoreHistory')}
                    >
                        <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>{t('compareWith')}:</label>

                            <select
                                className="theme-input"
                                value={inputMode === 'manual' ? 'manual' : comparisonUser}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === 'manual') {
                                        setInputMode('manual');
                                        setComparisonUser('');
                                        setComparisonData([]);
                                    } else {
                                        setInputMode('select');
                                        handleComparisonUserChange(value);
                                    }
                                }}
                                style={{ minWidth: '150px' }}
                            >
                                <option value="manual">{t('inputUsername')}</option>

                                {/* Option to select self if viewing another user's profile */}
                                {!isMePage && currentUser && (
                                    <option value={currentUser.username}>
                                        {t('me')} ({currentUser.display_name || currentUser.username})
                                    </option>
                                )}

                                {leaderboardUsers
                                    .filter(user => user.username !== (profileData?.username)) // Exclude the user whose profile we are viewing
                                    .filter(user => !(!isMePage && currentUser && user.username === currentUser.username)) // Exclude 'me' from the list if already added above
                                    .map(user => (
                                        <option key={user.username} value={user.username}>
                                            {user.display_name || user.username}
                                        </option>
                                    ))}
                            </select>

                            {inputMode === 'manual' && (
                                <div style={{ display: 'flex', gap: '5px', flexGrow: 1 }}>
                                    <input
                                        type="text"
                                        className="theme-input"
                                        placeholder={t('enterUsername')}
                                        value={comparisonUser}
                                        onChange={(e) => setComparisonUser(e.target.value)}
                                        style={{ flexGrow: 1 }}
                                    />
                                    <button
                                        onClick={() => handleComparisonUserChange(comparisonUser)}
                                        disabled={isComparing || !comparisonUser}
                                        style={{
                                            padding: '0.5rem 1.5rem',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            border: 'none',
                                            backgroundColor: 'var(--accent-color)',
                                            color: 'var(--accent-text-color)',
                                            fontWeight: 'bold',
                                            transition: 'opacity 0.2s',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {isComparing ? '...' : t('compare')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {isComparing && <p style={{ fontSize: '0.9em', color: '#888' }}>{t('loadingComparison')}</p>}

                        <RarityScoreChart
                            data={chartData}
                            comparisonData={comparisonData}
                            comparisonName={comparisonUser}
                            timezone={currentUser?.timezone || 'UTC'}
                            primaryName={isMePage ? t('me') : profileData?.display_name || profileData?.username}
                        />
                    </Modal>

                    <span>{t('joined', { date: new Date(profileData.registration_date).toLocaleDateString() })}</span>
                    <span>{t('time.active')}: {formatRelativeTime(profileData.last_active_date, t)}</span>
                </div>

            </div>
            <Tooltip id="rarity-tooltip" style={{ zIndex: 9999 }} />
        </div>
    );
};

export default ProfilePage;
