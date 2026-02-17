# Smart Bookmark App

A simple, real-time bookmark manager built to allow users to securely save and manage their favorite URLs. 

## 🚀 Tech Stack
* **Framework:** Next.js (App Router)
* **Backend & Database:** Supabase (PostgreSQL)
* **Authentication:** Supabase Auth (Google OAuth)
* **Real-time:** Supabase Realtime subscriptions
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

## ✨ Features
* **Google Authentication:** Users can only sign up and log in using their Google accounts. No passwords are stored.
* **Private Bookmarks:** Utilizing Supabase Row Level Security (RLS), bookmarks are strictly isolated. Users can only view, add, and delete their own bookmarks.
* **Real-Time Updates:** The bookmark list updates instantly across multiple tabs or devices without requiring a page refresh, powered by Supabase Realtime WebSockets.
* **Session Security:** Automatically logs users out when they close the browser tab, requiring a fresh login for every new session.
* **Interactive UI:** Features custom SVG spinning loaders and disabled button states during database operations to prevent duplicate submissions and improve UX.

## 🧠 Challenges & Solutions (What I Learned)
1. Google Login Setup
Setting up Google authentication took some trial and error. Navigating the Google Cloud Console was a bit tricky, but once I made sure the "Redirect URLs" in Google exactly matched the ones in Supabase, the login worked perfectly.

2. Harmless Console Warnings
I saw a "WebSocket closed" warning in my console while building the real-time updates. I learned this is just a harmless side effect of Next.js testing things in development mode (React Strict Mode). The warning automatically goes away when the app is deployed live.

3. Handling the Loading Button
I added a loading spinner to the "Add" button, but Supabase was so fast you could barely see it! To make it bug-proof, I used a try...catch...finally block to ensure the spinner always turns off properly. I proved it worked by using Chrome DevTools to fake a slow internet connection.

4. Auto-Logout on Close
For security, I wanted users to log in fresh every time they open the app. I solved this by changing Supabase's default settings to use sessionStorage (which deletes data when the tab closes) instead of permanent localStorage.

## 🛠️ Running Locally

1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env.local` file in the root directory and add your Supabase keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
