# GetUp ↑

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://lachyjp.github.io/GetUp/)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)](https://www.typescriptlang.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-purple)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A modern, responsive web dashboard for **Up Bank** customers, providing a comprehensive desktop and mobile experience for managing finances. Built with React, TypeScript, and Bootstrap.

🌐 **Live Demo**: [https://lachyjp.github.io/GetUp/](https://lachyjp.github.io/GetUp/)

## 🚀 Overview

Up Bank is an Australian neobank owned by Bendigo/Adelaide Bank that is currently mobile-app exclusive. GetUp fills the gap by providing a beautiful, feature-rich web interface that allows users to:

- View account balances and transaction history
- Set savings goals with progress tracking
- Analyse spending patterns and statistics
- Access merchant logos and transaction details
- Enjoy a responsive design that works on all devices

## ✨ Features

### 🏦 Account Management
- **Multi-Account Support**: View all your Up Bank accounts in one place
- **Account Categorization**: Automatic grouping by account type (Transactional, Saver, Essentials, Maybuy)
- **Real-time Balances**: Live account balance updates
- **Account Filtering**: Filter transactions by specific accounts

### 💰 Savings Goals
- **Goal Setting**: Set custom savings goals for saver accounts
- **Progress Tracking**: Visual progress bars showing goal completion
- **Goal Management**: Edit, update, or remove savings goals
- **Persistent Storage**: Goals are saved locally and persist across sessions

### 📊 Spending Analytics
- **Transaction Statistics**: Total spent, average daily spending, unique merchants
- **Time-based Analysis**: Spending patterns over different time periods
- **Account-specific Stats**: Detailed analytics for individual accounts
- **Transfer Filtering**: Smart filtering to exclude internal transfers

### 🛍️ Transaction Management
- **Comprehensive Transaction List**: View all transactions with detailed information
- **Merchant Logos**: Automatic merchant logo detection and display
- **Transaction Grouping**: Group transactions by date for easy browsing
- **Month Navigation**: Easy navigation between different months
- **Transfer Coalescing**: Smart pairing of transfer transactions

### 🔒 Security & Privacy
- **Local Storage**: All sensitive data stored locally on your device
- **Encrypted Storage**: API keys encrypted to browser with user-defined PIN
- **No Data Transmission**: No personal data sent to external servers
- **Secure API Integration**: Direct, secure connection to Up Bank API

## 🛠️ Technology Stack

- **Frontend**: React 19.2.0 with TypeScript
- **Styling**: Bootstrap 5.3.8 with custom CSS
- **HTTP Client**: Axios for API communication
- **State Management**: React Hooks (useState, useEffect, useMemo, useCallback)
- **Build Tool**: Create React App with custom build scripts
- **Deployment**: GitHub Pages with automated deployment

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Up Bank API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/lachyjp/GetUp.git
   cd GetUp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

## 🔑 Getting Your Up Bank API Key

1. Visit [Up Bank API Documentation](https://api.up.com.au/getting_started)
2. Follow the authentication process to get your API key
3. Your API key will look like: `up:yeah:your-unique-key-here`
4. **Important**: Keep your API key secure and never share it

## 🚀 Usage

### First Time Setup
1. Open the application in your browser
2. Enter your Up Bank API key
3. Optionally set a PIN for encrypted local storage
4. Choose to remember your API key for future sessions

### Daily Usage
1. **Login**: Enter your API key or use saved credentials
2. **View Accounts**: See all your account balances at a glance
3. **Set Goals**: Click the menu (⋯) on saver accounts to set savings goals
4. **Analyse Spending**: Review spending statistics and transaction history
5. **Filter Transactions**: Use account tabs to filter by specific accounts

### Features Guide

#### Setting Savings Goals
1. Click the menu button (⋯) on any saver account
2. Click "Set Goal" or "Edit Goal"
3. Enter your target amount
4. Click "Save" to store your goal
5. View progress in the account card and dropdown

#### Viewing Transaction Details
- **Merchant Logos**: Automatically fetched and displayed
- **Transaction Status**: See if transactions are settled or pending
- **Transfer Detection**: Internal transfers are automatically paired
- **Date Grouping**: Transactions grouped by date for easy browsing

#### Account Management
- **Account Types**: 
  - 💳 **Transactional**: Everyday spending accounts
  - 🏠 **Essentials**: Bills and essential expenses
  - 💰 **Saver**: Savings and investment accounts
  - 🤔 **Maybuy**: Future purchases and goals

## 🔧 Configuration

The application uses a centralized configuration system. Key settings can be found in `src/config/constants.ts`:

- **API Settings**: Timeout, retry attempts, cache duration
- **UI Settings**: Loading delays, logo cache duration
- **Storage Keys**: Local storage identifiers
- **Validation Rules**: API key format, PIN requirements

## 🔒 Privacy & Security

### Data Storage
- **Local Only**: All data stored locally in your browser
- **Encrypted Keys**: API keys encrypted with user-defined PIN
- **No Cloud Storage**: No data sent to external servers
- **Session Management**: Secure session handling with automatic cleanup

### API Security
- **Direct Connection**: Direct HTTPS connection to Up Bank API
- **No Proxying**: No data passes through third-party servers
- **Secure Headers**: Proper authentication and security headers
- **Error Handling**: Secure error handling without data leakage

## 🐛 Troubleshooting

### Common Issues

**API Key Not Working**
- Verify your API key format: `up:yeah:your-key-here`
- Check if your Up Bank account is active
- Ensure you have API access enabled

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Roadmap

### Upcoming Features
- [ ] Budget tracking
- [ ] Export transactions to CSV
- [ ] Advanced filtering and search
- [ ] Spending category analysis

### Recent Updates
- ✅ Sticky footer with build information
- ✅ Enhanced error handling
- ✅ Improved responsive design
- ✅ Performance optimizations
- ✅ Accessibility improvements

---

**⚠️ Disclaimer**: This is an unofficial third-party application. It is not affiliated with or endorsed by Up Bank. Use at your own risk and always keep your API credentials secure.

**🔒 Security Notice**: This application stores your API key locally on your device. Never share your API key with anyone and always use a secure device.