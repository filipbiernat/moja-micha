import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export default function StatsScreen() {
    const { t } = useTranslation();
    return <PlaceholderScreen emoji="📊" title={t('tabs.stats')} subtitle={t('subtitles.stats')} />;
}
