import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // ✅ Import BrowserRouter
import Home from "./pages/Home";
import Alumni from "./pages/Alumni";
import Forum from "./pages/Forum";
import Contact from "./pages/Contact";
import Chat from "./pages/Chat";
import Navbar from "./components/Navbar"; // ✅ Navbar added
import About from "./pages/About";
import Events from "./pages/Events"; // Import Events Page
import Profile from "./pages/Profile";  // ✅ Import Profile Page
import ResetPassword from "./pages/ResetPassword"; // adjust path

function App() {
  return (
    <> {/* ✅ Now Router is correctly defined */}
      <Navbar /> {/* ✅ Navbar stays visible on all pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/alumni" element={<Alumni />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/chat" element={<Chat />} /> {/* ✅ Dynamic chat route */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

      </Routes>
    </>
  );
}

export default App;
