# MoneyLens.ai

Take control of your finances with AI-powered insights. Track income, manage expenses, and make smarter money decisions—all in one beautiful dashboard.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![AI Powered](https://img.shields.io/badge/AI-Gemini-orange)

## ✨ What You Can Do

### Track Your Money

- Add income and expenses with detailed notes
- Organize by categories (Rent, Groceries, Shopping, etc.)
- Tag expenses as Need, Want, or Neutral
- Set up recurring expenses (rent, subscriptions, etc.)
- Track balance across months automatically

### Get Smart Insights

- See your financial health score (0-100)
- Get personalized recommendations from AI
- Compare spending month-over-month
- Spot trends and patterns automatically
- All insights cached for 24 hours for fast access

### Visualize Your Data

- Interactive pie charts for expense breakdown
- Bar charts comparing income vs expenses
- Track your savings over time
- Filter by Need/Want/Neutral tags
- Export data to Excel anytime

### Stay Secure

- Password-protected accounts with security questions
- Account recovery via security questions (no email needed)
- Each user's data is isolated
- Change password, security questions, or delete account anytime

### Mobile-First Design

- Fully responsive interface optimized for all screen sizes
- Touch-friendly navigation with swipe gestures
- Mobile-optimized layouts for dashboard, insights, and profile sections
- Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Try the Demo

**Login:** `admin` / `admin`

### Setup Your Own

**Prerequisites:** Node.js 18+, Yarn, MongoDB Atlas account, Gemini API key

1. **Install**

```bash
git clone <repository-url>
cd moneylens-ai
yarn install
```

2. **Configure**

Create `server/.env`:

```env
DB_PASSWORD=your_mongodb_password
PORT=5001
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

3. **Run**

```bash
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

### Getting Started

1. Create an account with mandatory security question setup
2. Login with your credentials
3. Click "Add Period" to start tracking a new month
4. Add your income sources
5. Record your expenses with categories and tags
6. View your financial insights on the dashboard

### Key Features

- **Search & Filter**: Find transactions instantly
- **Edit Anytime**: Modify amounts, notes, or tags
- **AI Insights**: Get financial advice on dashboard and month details
- **Export Data**: Download Excel reports
- **Profile Settings**: Update name, currency (INR/USD), password, security questions, or manage recurring expenses
- **Password Recovery**: Reset forgotten password using security questions (no email required)

## 🏗️ Built With

**Frontend:** React 18, TypeScript, TailwindCSS, shadcn/ui, Chart.js, Framer Motion  
**Backend:** Node.js, Express, MongoDB Atlas, Gemini AI  
**Tools:** Vite, ESLint, Yarn Workspaces, ExcelJS  
**UI Components:** Radix UI, Lucide Icons, Sonner (Toast Notifications)

## 📋 Categories

**Income:** Salary • Carry Forward • Bonus • Freelance • Investment Returns • Rental Income • Others

**Expenses:** Rent • EMIs • Groceries • Shopping • Food & Drinks • Credit Card • Bills & Utility • Transportation • Medical • Personal Care • Entertainment • Insurance • Investment • Miscellaneous

## 🎯 Planned Features

- [x] ~~🔐 User Authentication & Security~~
- [x] ~~🔑 Password Recovery via Security Questions~~
- [x] ~~💰 Multi-Period Financial Tracking~~
- [x] ~~📊 Interactive Charts & Visualizations~~
- [x] ~~🤖 AI-Powered Insights with Gemini~~
- [x] ~~🏷️ Need/Want/Neutral Expense Tagging~~
- [x] ~~🔄 Recurring Expenses Management~~
- [x] ~~👤 Profile & Account Management~~
- [x] ~~💱 Multi-Currency Support (INR/USD)~~
- [x] ~~📝 Entry-Based Transaction System~~
- [x] ~~🔍 Search, Sort & Filter Capabilities~~
- [x] ~~✏️ Edit Individual Entries~~
- [x] ~~🗑️ Bulk Delete with Confirmation~~
- [x] ~~📤 Excel Export (Year & Month views)~~
- [x] ~~🌙 Dark Mode Interface~~
- [x] ~~📱 Responsive Design~~
- [x] ~~🔔 Toast Notifications~~
- [x] ~~💾 24-Hour AI Cache Management~~

- [ ] 🤖 Custom AI Model Integration
- [ ] 📊 Budget planning with alerts
- [ ] 📅 Bill reminders and due dates
- [ ] 📁 Receipt attachments
- [ ] 📈 Year-over-year comparisons
- [ ] 📱 Mobile app (iOS/Android)
- [ ] 👥 Shared/Family accounts
- [ ] 🎮 Gamification (achievements, streaks)
- [ ] 📊 Custom category creation
- [ ] 🔔 Email notifications
- [ ] 🌍 Multi-language support
- [ ] 📊 Investment portfolio tracking

## 💡 Contributing

Contributions welcome! Fork, create a feature branch, commit your changes, and open a Pull Request.

## 📝 License

MIT License - Copyright (c) 2025 Gonga Akshay

---

**Built with ❤️ by [Gonga Akshay](https://github.com/gongaakshay)**

⭐ Star this repo if you find it helpful!
