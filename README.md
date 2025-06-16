# GitHub Repository Search

A React Native app for searching GitHub repositories. Built with Expo and TypeScript.

## Setup

1. Clone and install:

```bash
git clone https://github.com/your-username/rn-github-repo-search.git
cd rn-github-repo-search
npm install
```

2. Start the app:

```bash
npm start
```

## GitHub Token (Recommended)

While the app works without authentication, adding a GitHub token is **highly recommended** to avoid rate limits, secondary rate limts and ensure optimal performance.

## Features

- Search GitHub repositories
- Infinite scrolling
- Pull to refresh
- Repository details

## Tech Stack

- Expo SDK 53+
- TypeScript
- Expo Router
- SWR for data fetching and caching
- React Native Paper for UI
- FlashList for performance

## Project Structure

```
src/
  app/           # Pages (Expo Router)
  hooks/         # Custom hooks
  services/      # API calls
  utils/         # Helper functions
```
