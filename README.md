# TARS Chat

A full-stack real-time chat application built with Next.js, Convex, and Clerk.

## Features

### Core
- **Real-time messaging** — Messages appear instantly via Convex subscriptions
- **User authentication** — Sign up/sign in with Clerk (email, Google, GitHub)
- **1-on-1 direct messages** — Click any user to start a private conversation
- **Group chats** — Create groups with multiple participants
- **User search** — Find users by name to start conversations
- **Online/offline status** — Green indicator shows who's active
- **Typing indicators** — See when someone is typing in real-time
- **Unread message counts** — Badge showing unread messages per conversation
- **Message timestamps** — Smart formatting (time for today, date for older)
- **Responsive design** — Works on mobile and desktop with adaptive layout

### Additional
- **Message reactions** — React with 👍 ❤️ 😂 😮 😢 on any message
- **Delete messages** — Soft delete with "This message was deleted" placeholder
- **Smart auto-scroll** — Scrolls to new messages when near bottom, shows "New messages" button otherwise
- **Loading skeletons** — Shimmer placeholders while data loads
- **Error boundary** — Graceful error handling with retry option
- **Failed message retry** — Retry sending if a message fails

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui (Button, Input, Avatar, Badge, Dialog, Tooltip, ScrollArea)
- **Backend/Database**: Convex (real-time database with subscriptions)
- **Authentication**: Clerk
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tars-chat.git
cd tars-chat
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your credentials:
```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

4. Set up Convex:
```bash
npx convex dev
```

5. In another terminal, start the dev server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── convex/                  # Backend (Convex)
│   ├── schema.ts           # Database schema (users, conversations, messages, etc.)
│   ├── users.ts            # User management functions
│   ├── conversations.ts    # Conversation CRUD
│   ├── messages.ts         # Messages, reactions, typing, read receipts
│   └── auth.config.ts      # Clerk auth configuration
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with providers
│   │   ├── page.tsx        # Landing page + chat app
│   │   └── globals.css     # Tailwind v4 theme
│   ├── components/
│   │   ├── chat-area.tsx       # Message display, input, reactions
│   │   ├── chat-layout.tsx     # Main layout (sidebar + chat)
│   │   ├── conversation-list.tsx # Conversation sidebar list
│   │   ├── create-group.tsx    # Group chat creation dialog
│   │   ├── error-boundary.tsx  # Error boundary component
│   │   ├── providers.tsx       # Clerk + Convex providers
│   │   ├── sidebar.tsx         # Sidebar with tabs (Chats/Users)
│   │   ├── skeletons.tsx       # Loading skeleton components
│   │   ├── user-list.tsx       # User search and list
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/
│   │   └── useStoreUser.ts    # Syncs Clerk user to Convex
│   ├── lib/
│   │   └── utils.ts           # Utility functions
│   └── middleware.ts          # Clerk auth middleware
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | User profiles synced from Clerk |
| `conversations` | 1-on-1 and group conversations |
| `messages` | Chat messages with soft delete |
| `typingIndicators` | Real-time typing status |
| `unreadCounts` | Per-user unread message counts |
