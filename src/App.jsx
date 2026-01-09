import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/Feed";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";
import AuthRedirect from "./auth/AuthRedirect";
import CreatorBlockHome from "./auth/CreatorBlockHome";
import Footer from "./components/Footer";
import Search from "./pages/Search";
import Profile from "./pages/Profile";

import "./styles/app.css";
import "./styles/auth.css";
import "./styles/feed.css";
import "./styles/modal.css";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Login & Signup — blocked if already logged in */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          }
        />

        <Route
          path="/signup"
          element={
            <AuthRedirect>
              <Signup />
            </AuthRedirect>
          }
        />

        {/* Home (Feed) — blocked for creators */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <CreatorBlockHome>
                <Feed />
              </CreatorBlockHome>
            </ProtectedRoute>
          }
        />

        {/* Creator dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute role="creator">
                <Dashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
