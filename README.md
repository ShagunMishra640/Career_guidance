CareerPath — AI-Driven Career Guidance App

CareerPath is a professional-grade, self-contained career exploration engine. It helps users discover their ideal career paths using the RIASEC (Holland Codes) psychological framework and provides real-time market data through global job feed APIs.

🚀 Key Features

RIASEC Personality Assessment: A built-in 12-question quiz that calculates your Holland Code (Realistic, Investigative, Artistic, Social, Enterprising, Conventional).

Client-Side Recommendation Engine: Matches your personality profile to specific career clusters using a local logic engine.

Global Job Market Explorer: Fetches live job opportunities using the Jobicy Open API (No key required) with optional support for Adzuna.

Smart Redirects: Avoids broken link errors by intelligently constructing Google Search queries for job details, ensuring users always find up-to-date information.

Privacy-First Persistence: Saves your "Career Roadmap" using localStorage. No accounts, no backend, and no data leaves your browser.

Modern Responsive Design: Fully mobile-responsive UI built with Tailwind CSS and Lucide icons.

🛠️ Tech Stack

Framework: React 18+ (Vite)

Styling: Tailwind CSS

Icons: Lucide React

APIs:

Jobicy (Remote/Global jobs)

Adzuna (Localized job aggregator - Optional)

State Management: React Hooks (useState, useEffect, useMemo)

📦 Installation & Setup

Follow these steps to get the project running locally:

1. Initialize the Project

# Create Vite project
npm create vite@latest career-app -- --template react
cd career-app

# Install dependencies
npm install
npm install lucide-react


2. Set Up Tailwind CSS

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p


Update tailwind.config.js:

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


Add the directives to your ./src/index.css:

@tailwind base;
@tailwind components;
@tailwind utilities;


3. Implement the Code

Replace the contents of src/App.jsx with the provided code in this repository.

4. Run the App

npm run dev


🔑 API Configuration (Optional)

The app works out-of-the-box using the Jobicy Open API. To unlock localized results for specific countries (like the US or UK), you can add an Adzuna API key:

Register at Adzuna Developers.

Locate the variables at the top of App.jsx:

const ADZUNA_ID = "YOUR_ID"; 
const ADZUNA_KEY = "YOUR_KEY"; 


Once added, the app will automatically prioritize Adzuna for localized results and fallback to Jobicy for remote roles.

🧠 How the RIASEC Logic Works

The app calculates scores based on user responses to specific traits:

Realistic (R): Hands-on, practical work.

Investigative (I): Analytical, scientific approach.

Artistic (A): Creative and intuitive.

Social (S): Helpful and people-oriented.

Enterprising (E): Leadership and persuasion.

Conventional (C): Organized and data-driven.

The useMemo hook calculates the "Top Category" in real-time as the user finishes the quiz, triggering a custom filter on the CAREER_SUGGESTIONS database.

📜 License

This project is open-source. Feel free to modify and use it for your own career guidance tools.
