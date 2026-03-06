# TRAK.FIT - Modern Fitness Tracker

TRAK.FIT is a powerful, minimalist workout tracking application built with Next.js 15, TypeScript, and MongoDB. It helps users stay consistent with their fitness goals by providing daily workout plans, logging sessions, and visualizing progress over time.

![Project Preview](https://via.placeholder.com/800x450?text=TRAK.FIT+Dashboard)

## 🚀 Features

### Current Capabilities
- **Intelligent Workout Logging:** Easily log sets, reps, and weights for your daily exercises.
- **Dynamic Daily Plans:** Automatically fetches your workout template based on a 12-week cycle and current day of the week.
- **Weight Trend Visualization:** Interactive charts powered by Recharts to track your body weight progress.
- **Master Plan Updates:** Seamlessly update your recurring workout templates with your latest personal bests.
- **Responsive Design:** A clean, modern UI built with Tailwind CSS v4 that works great on desktop and mobile browsers.
- **PR Tracking:** Automatic identification of personal records for every exercise.

### 🛠 Tech Stack
- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📅 Upcoming Features (Roadmap)

We are constantly working to make TRAK.FIT the ultimate fitness companion. Here's what's coming next:

- [ ] **User Authentication:** Secure login and profile management.
- [ ] **Workout History:** A dedicated page to review every past session with detailed performance analytics.
- [ ] **Custom Plan Builder:** Create and customize your own training cycles and exercise routines.
- [ ] **Exercise Library:** A comprehensive database of exercises with form guides.
- [ ] **AI-Powered Insights:** Smart suggestions for progressive overload based on your historical performance.
- [ ] **Nutrition Integration:** Track your daily macros and calories alongside your workouts.
- [ ] **Rest Timer:** Integrated customizable rest timers between sets.
- [ ] **Social Sharing:** Share your PRs and weekly summaries with your fitness community.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18.x or later
- MongoDB Atlas account or local MongoDB instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/fitness-tracker.git
   cd fitness-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your MongoDB URI:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request if you have ideas to improve TRAK.FIT.

## 📄 License
This project is licensed under the MIT License.
