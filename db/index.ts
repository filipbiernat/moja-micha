// Database layer – public API
export { DatabaseProvider, useDatabase } from './DatabaseProvider';

// Schema & Types
export {
    meals,
    favorites,
    settings,
    dailySummaries,
    SETTING_KEYS,
    type Meal,
    type NewMeal,
    type MealType,
    type Favorite,
    type NewFavorite,
    type FavoriteType,
    type Setting,
    type SettingKey,
    type DailySummary,
    type UserSex,
    type DietGoal,
} from './schema';

// CRUD – Meals
export {
    getMealsByDate,
    getMealById,
    createMeal,
    updateMeal,
    deleteMeal,
    toggleMealStarred,
    isMealStarred,
    getRecentUniqueMeals,
    getStreak,
    getRecordStreak,
    getDatesWithMeals,
    getCalorieSummary,
    getAverageCaloriesForPreviousDays,
    type CreateMealInput,
    type UpdateMealInput,
} from './meals';

// CRUD – Favorites
export {
    getFavoritesByType,
    getFavoriteById,
    createFavorite,
    updateFavorite,
    deleteFavorite,
    isMealStarred as isMealStarredInFavorites,
    toggleStarredMeal,
    type CreateFavoriteInput,
    type UpdateFavoriteInput,
} from './favorites';

// CRUD – Settings
export {
    getSetting,
    setSetting,
    getAllSettings,
    deleteSetting,
    getUserProfileSettings,
    type UserProfileSettings,
} from './settings';

export {
    getDailySummary,
    upsertDailySummary,
    deleteDailySummary,
} from './dailySummaries';
