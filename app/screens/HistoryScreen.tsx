import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export default function HistoryScreen() {
    const { t } = useTranslation();
    return <PlaceholderScreen emoji="📅" title={t('tabs.history')} subtitle={t('subtitles.history')} />;
}
