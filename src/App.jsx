import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { I18nProvider } from './contexts/I18nContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MalariaDetection from './pages/MalariaDetection'
import Statistics from './pages/Statistics'
import LocationStats from './pages/LocationStats'
import AdminDashboard from './pages/AdminDashboard'
import Settings from './pages/Settings'
import Feedback from './pages/Feedback'
import NotFound from './pages/NotFound'

function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/home" replace />} />
                  <Route path="home" element={<Home />} />
                  <Route path="detection" element={<MalariaDetection />} />
                  <Route path="statistics" element={<Statistics />} />
                  <Route path="location-stats" element={<LocationStats />} />
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="feedback" element={<Feedback />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}

export default App