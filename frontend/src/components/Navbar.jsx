import { NavLink } from "react-router-dom";
import "../styles/navbar.css";
import Logo from "../assets/log.jpeg"; // ✅ Import your society's logo
import { Menu, X } from "lucide-react"; // Using lucide-react for icons

//for profile 
import { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import profileIcon from "../assets/profile.png"; // Make sure to have a small icon
import "../styles/navbar.css";




function Navbar() {
    // Profile state
    const [user, setUser] = useState(null);
    const [alumni, setAlumni] = useState(JSON.parse(localStorage.getItem("alumni")) || null);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [profilePic, setProfilePic] = useState(profileIcon); // Default icon

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Sets user (student) state
        });

        const alumni = JSON.parse(localStorage.getItem("alumni"));
        setAlumni(alumni); // Sets alumni state

        if (alumni && alumni.name) {
            // If alumni is present, fetch the profile picture from the server
            fetch(`${import.meta.env.VITE_API_BASE_URL}/profile/${alumni.name}`)
                .then(res => res.json())
                .then(data => {
                    if (data.profilePic) {
                        setProfilePic(`${import.meta.env.VITE_API_BASE_URL}/uploads/${data.profilePic}`);
                    }
                })
                .catch(err => console.error("❌ Failed to fetch profile picture", err));
        }

        return () => unsubscribe();
    }, []);

    // ✅ Handle Profile Click (Redirect Logic)
    const handleProfileClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleLogout = async () => {
        if (user) {
            await signOut(auth);
            setUser(null);
        }
        if (alumni) {
            localStorage.removeItem("alumni");
            setAlumni(null);
        }
        navigate("/");

    };

    return (
        <nav className="navbar">
            {/* Logo and Title */}
            <div className="logo-container">
                <img src={Logo} alt="Society Logo" className="logo" />
                <h1 className="nav-title">EES IIT BHU</h1>
            </div>

            {/* Navigation Links */}
            <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
                <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
                <li><NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""}>Events</NavLink></li>
                <li><NavLink to="/forum" className={({ isActive }) => isActive ? "active" : ""}>Forum</NavLink></li>
                <li><NavLink to="/alumni" className={({ isActive }) => isActive ? "active" : ""}>Alumni</NavLink></li>
                <li><NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""}>Contact</NavLink></li>
                <li><NavLink to="/chat" className={({ isActive }) => isActive ? "active" : ""}>Chat</NavLink></li>
            </ul>

            {/* Render profile icon if either user (student) or alumni is logged in */}
            {(user || alumni) && (
                <>
                    <img
                        src={profilePic}
                        alt="Profile"
                        className="profile-icon"
                        onClick={handleProfileClick}
                    />

                    {showDropdown && (
                        <div className="profile-dropdown" ref={dropdownRef}>
                            <p onClick={() => { navigate("/profile"); setShowDropdown(false); }}>👤 View Profile</p>
                            <p onClick={handleLogout}>🚪 Logout</p>
                        </div>
                    )}
                </>
            )}

            {/* Hamburger Menu Toggle (For Mobile) */}
            <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
                <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>Home</NavLink>
                <NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>Events</NavLink>
                <NavLink to="/forum" className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>Forum</NavLink>
                <NavLink to="/alumni" className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>Alumni</NavLink>
                <NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>Contact</NavLink>
                <NavLink to="/chat" className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>Chat</NavLink>
            </div>

        </nav>
    );
}

export default Navbar;

