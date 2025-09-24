import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import FortuneHeatmap from '../components/FortuneHeatmap';

const ProfilePage = ({ isMePage = false }) => {
    // 如果是/me页面，从useParams获取的username会是undefined，所以我们用isMePage来判断
    const paramsUsername = useParams().username;
    // 从useAuth hook获取当前登录用户名 (假设MePage会传入)
    const username = isMePage ? 'me' : paramsUsername; // 在API中 'me' 是一个特殊标识
    
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            // API服务需要能处理 'me' 这个特殊的username
            const response = await api.getProfileData(username);
            if (response.success) {
                setProfileData(response.data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [username]);

    if (loading) return <div className="page-container">Loading profile...</div>;
    if (!profileData) return <div className="page-container">User not found.</div>;

    return (
        <div className="page-container">
            {isMePage ? <h1>Good Morning, {profileData.username}!</h1> : <h1>{profileData.username}</h1> }
            
            <p className="fortune-summary">
                {isMePage && "今日运势未抽取，前往抽取。"} 过去一年共抽取了50次运势...
            </p>

            <p className="bio">{profileData.bio}</p>
            
            <h3>Fortune History</h3>
            <FortuneHeatmap data={profileData.history} />
            
            <div className="profile-footer">
                <span>Joined: {profileData.joinDate}</span>
                <span>Last seen: {profileData.lastOnline}</span>
            </div>
        </div>
    );
};

export default ProfilePage;