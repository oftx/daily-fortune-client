// src/pages/MePage.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import ProfilePage from './ProfilePage';

const MePage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    if (!user) {
        return <div className="page-container">{t('loadingYourProfile')}</div>;
    }

    return <ProfilePage isMePage={true} />;
};

export default MePage;