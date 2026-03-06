# Penny - Personal Finance Tracker

A polished personal finance tracking mobile app built with Expo React Native and Express backend.

## Architecture

- **Frontend**: Expo React Native (expo-router file-based routing), targeting iOS/Android/Web
- **Backend**: Express + TypeScript (port 5000), serves API and static Expo files
- **State**: React Context + AsyncStorage (no database — fully local persistence)
- **AI**: Anthropic Claude (claude-sonnet-4-6) via Replit AI Integration, SSE streaming

## Key Features

- **Onboarding** — 4-screen flow: welcome → profile name → currency selection → savings goal
- **Dashboard** — hero balance card (income/expense/net), recent transactions list
- **Analytics** — custom DonutChart component, spending by category breakdown, date range selector
- **Budget** — monthly budget progress bars per category, over-budget alerts
- **AI Insights** — Claude-powered chat, streaming responses, quick-action buttons
- **Add Transaction** — custom numpad modal, category picker with 50+ categories, notes + date
- **Floating Tab Bar** — custom pill-shaped glass tab bar with coral FAB (+) button in center

## Design System

- **Primary**: Coral `#FF6B6B`
- **Background**: Cream `#FFF8F0`
- **Success**: Teal `#4ECDC4`
- **Typography**: Inter (Google Fonts via @expo-google-fonts/inter)
- **Icons**: Ionicons from @expo/vector-icons
- **Glass cards**: GlassCard component with rgba white background + blur-style styling

## Project Structure

```
app/
  _layout.tsx                  # Root layout, font loading, AppContext provider
  (onboarding)/
    _layout.tsx                # Stack layout for onboarding
    index.tsx                  # Welcome screen
    profile.tsx                # Name input
    currency.tsx               # Currency selector
    goal.tsx                   # Savings goal + complete onboarding
  (tabs)/
    _layout.tsx                # Custom floating tab bar layout
    index.tsx                  # Dashboard (home)
    analytics.tsx              # Charts + spending breakdown
    budget.tsx                 # Budget tracking
    ai.tsx                     # AI chat with Claude
  add-transaction.tsx          # Modal: numpad, type toggle, category, note, date
  category-picker.tsx          # Modal: 50+ categories in searchable grid

components/
  GlassCard.tsx                # Frosted glass card container
  CategoryIcon.tsx             # Icon + color for transaction categories
  TransactionRow.tsx           # Single transaction list item
  DonutChart.tsx               # SVG-based donut chart component
  ErrorBoundary.tsx            # Error boundary with reload

constants/
  colors.ts                    # Full color palette
  categories.ts                # 50+ categories with icons, colors, types

context/
  AppContext.tsx                # Global state: profile, transactions, budget goals
                               # Persists to AsyncStorage

server/
  index.ts                     # Express server setup
  routes.ts                    # API routes: POST /api/ai/insights (SSE streaming)
  templates/landing-page.html  # Static landing page on port 5000
```

## API Routes

- `POST /api/ai/insights` — streams AI insights from Claude; body: `{ transactions, profile, prompt }`

## Workflows

- **Start Backend**: `npm run server:dev` (port 5000)
- **Start Frontend**: `npm run expo:dev` (port 8081)

## Category-Picker → Add-Transaction Communication

The category picker writes the selected category ID to AsyncStorage key `@penny_selected_category`. The add-transaction screen reads and clears it via `useFocusEffect` on return.

## Onboarding Flow

Onboarding state stored in AsyncStorage via AppContext (`@penny_onboarding_complete`). Once completed, root layout redirects to `/(tabs)`.
