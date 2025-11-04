# DayFlow Calendar

DayFlow Calendar is a simple and intuitive calendar application built with Next.js and Firebase. It allows users to manage their daily schedules, create, and organize events with ease. With a clean, modern interface, DayFlow helps you stay on top of your commitments.

## Features

- **User Authentication:** Secure sign-up and sign-in functionality using Firebase Authentication. Users can sign in with email/password or as a guest.
- **Event Management:** Create, view, update, and delete calendar events.
- **Multiple Calendar Views:** Switch between month, week, and day views to visualize your schedule.
- **Smart Scheduling:** AI-powered suggestions for optimal event times based on your existing schedule.
- **Persistent Storage:** Events are saved to a Firestore database, ensuring your data is safe and accessible from anywhere.
- **Responsive Design:** A fully responsive UI that works on desktops, tablets, and mobile devices.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **UI:** [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **AI:** [Genkit](https://firebase.google.com/docs/genkit) for smart scheduling suggestions.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Doosix/Day-flow-calendar.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Run the development server
   ```sh
   npm run dev
   ```

Now you can open [http://localhost:9002](http://localhost:9002) in your browser to see the app.
