import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export default function TodayScreen() {
    const { t } = useTranslation();
    return <PlaceholderScreen emoji="🍽️" title={t('tabs.today')} subtitle={t('subtitles.today')} />;
}
