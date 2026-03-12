import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export default function FavoritesScreen() {
    const { t } = useTranslation();
    return <PlaceholderScreen emoji="⭐" title={t('tabs.favorites')} subtitle={t('subtitles.favorites')} />;
}
