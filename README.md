# 🍜 Moja Micha

> **Your personal, offline-first meal diary and calorie tracker — built for the way you actually eat.**

[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue?logo=react)](https://expo.dev)
[![Platform](https://img.shields.io/badge/Platform-Android-green?logo=android)](https://www.android.com)
[![Storage](https://img.shields.io/badge/Storage-Local%20SQLite-orange)](https://docs.expo.dev/versions/latest/sdk/sqlite/)
[![Languages](https://img.shields.io/badge/Languages-PL%20%7C%20EN-purple)](#)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](#)

---

## What is Moja Micha?

**Moja Micha** (Polish for *My Bowl*) is a no-nonsense, privacy-first meal tracking app that lives entirely on your device. No accounts, no servers, no cloud sync — just you, your food, and your data.

Log what you eat, when you eat it, track your calories over time, and build a streak worth keeping. Simple as that.

---

## ✨ Features

### 📋 Meal Logging
- Log meals with a **single tap** from the main screen via a quick-entry bottom sheet
- Fields auto-fill based on the **time of day** (Breakfast, Lunch, Dinner, etc.)
- Free-text meal description — works great with **GBoard dictation**
- Optional calorie count and personal notes per meal
- Log meals **retroactively** for any past date and time

### 📅 Browse & Edit History
- **Swipe** between days directly from the Today screen
- Browse past entries via a **full calendar** view
- Edit or delete any historical meal entry

### ⭐ Favorites
- **Star any meal entry** to save it as a favorite
- Create **custom meal templates** (e.g. "My morning oatmeal — 350 kcal")
- One-tap reuse: your content is pre-filled, date and time are always fresh

### 📊 Statistics
- **Bar chart** showing daily calorie intake (7-day or 30-day view)
- Moving average trend line
- Daily summary: average, max, min
- **Streak counter** — how many days in a row you've logged meals

### ⚙️ Settings
- **Dark / Light theme** — with system default support
- **Polish / English language** — with system default support
- **Daily calorie goal** — optional; shows a progress bar when set

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo Managed Workflow) |
| Language | TypeScript |
| Storage | `expo-sqlite` (local, on-device) |
| Navigation | React Navigation (Bottom Tabs) |
| Localization | `i18next` + `expo-localization` |
| Calendar | `react-native-calendars` |
| Bottom Sheet | `@gorhom/bottom-sheet` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- Expo CLI: `npm install -g expo-cli`
- Android device or emulator with Expo Go installed

### Installation

```bash
git clone https://github.com/filipbiernat/moja-micha.git
cd moja-micha
npm install
```

### Running the App

```bash
npx expo start
```

---

## 📁 Project Structure

```
moja-micha/
├── app/                    # Screens (Expo Router)
│   └── (tabs)/
│       ├── today.tsx       # Today's meals + swipe navigation
│       ├── history.tsx     # Calendar + day view
│       ├── favorites.tsx   # Templates & starred meals
│       ├── stats.tsx       # Weekly/monthly charts
│       └── settings.tsx    # Theme, language, calorie goal
├── components/             # Reusable UI components
├── db/                     # SQLite schema, migrations & queries
├── hooks/                  # Custom React hooks
├── i18n/                   # PL / EN translation files
├── theme/                  # Color tokens, dark/light theme
└── utils/                  # Helpers (time-to-meal-type, etc.)
```

---

## 📝 License

MIT © filipbiernat