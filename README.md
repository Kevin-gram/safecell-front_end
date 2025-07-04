# SafeCell Malaria Detection & Statistics Frontend

## 🌍 Project Description

SafeCell is a modern web application designed to visualize, monitor, and analyze malaria detection data across Rwanda. It provides real-time statistics, interactive maps, and risk assessments for healthcare professionals, researchers, and the public. The app leverages advanced data visualization and a user-friendly interface to empower data-driven decisions in the fight against malaria.

**Key Features:**
- Interactive map of Rwanda with district-level malaria statistics
- Real-time risk assessment (low, moderate, high) for each district
- Live data from healthcare facilities
- Detailed statistics and trends by time range (day, week, month, year)
- Multi-language support (English, French, Kinyarwanda)
- Modern, responsive UI with dark mode

---

## 🚀 Live Demo

👉 [SafeCell Live App](https://safecell.netlify.app/)

---

## 🛠️ Requirements

- Node.js (v16 or higher recommended)
- npm (v8 or higher) or yarn
- Modern web browser (Chrome, Firefox, Edge, Safari)

---

## 💻 Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kevin-gram/safecell-front_end.git
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. **Open the app:**
   - Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure & Related Files

- `src/pages/LocationStats.jsx` — District-level malaria statistics and risk map
- `src/pages/MalariaDetection.jsx` — Malaria detection and risk assessment
- `src/pages/Login.jsx` & `src/pages/signup.jsx` — Authentication (not demo focus)
- `src/pages/Settings.jsx` — User preferences (language, theme, etc.)
- `src/i18n/` — Language files (English, French, Kinyarwanda)
- `src/components/` — UI components (map, cards, buttons, etc.)
- `src/services/rwandaLocations.js` — Rwanda location data
- `public/` — Static assets (images, icons)

---

## 🎬 5-Minute Demo Video

[Watch Demo](https://www.loom.com/share/ba94bb2950c24cccb1ee6e20343b25a2?sid=1c1ba3cf-6a54-44f0-b03d-c0834648e4c9)

> **Note:** The demo video focuses on the core functionalities: malaria detection, malaria statistics, interactive map, risk levels, and data visualization. Sign-up and sign-in are briefly shown but not the main focus.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 🙏 Acknowledgements

- Rwanda Open Data
- OpenStreetMap contributors
- React, Vite, Tailwind CSS, Leaflet, Framer Motion

---

**Built with ❤️ for malaria awareness and public health.**
