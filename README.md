# Gitstreak 🔥

Gitstreak is a minimalist browser extension that tracks your GitHub commit streak Duolingo-style. Built for developers who want to stay consistent, it visualizes your current streak, your longest historical streak, and gently reminds you to code every day.

## ✨ Features

- **Real-time Tracking:** See your current streak and historical max streak at a glance.
- **Native Dark Mode:** A sleek UI that perfectly matches GitHub's design system.
- **Private Repositories:** Supports Personal Access Tokens (PAT) to track your private commits.
- **Smart Reminders:** Optional 8:00 PM desktop notification if you haven't pushed code today.
- **Privacy First:** 100% local processing. No external servers, no tracking.

## 🚀 Manual Installation (Developer Mode)

If you want to install Gitstreak locally from source, follow these steps:

1. Download or clone this repository to your computer.
2. Open your Chromium-based browser (Chrome, Brave, Edge).
3. Go to `chrome://extensions/` (or `brave://extensions/`).
4. Enable **Developer mode** in the top right corner.
5. Click **Load unpacked** and select the `Gitstreak` folder.
6. Pin the extension to your toolbar and click it to set up your profile!

## ⚙️ Configuration

To track private contributions:
1. Go to your GitHub **Settings** > **Developer Settings** > **Personal access tokens** > **Tokens (classic)**.
2. Generate a new token with the `read:user` scope.
3. Paste the token into the Gitstreak extension settings.

## 🛠️ Built With
- Vanilla JavaScript (Manifest V3)
- HTML5 / CSS3
- GitHub GraphQL API & Public Profile Parsing
