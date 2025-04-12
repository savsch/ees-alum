import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/alumni.css";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/alumni`;

function Alumni() {
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState("name");
    const [searchText, setSearchText] = useState("");
    const [showOptionsIndex, setShowOptionsIndex] = useState(null);
    const popupRef = useRef(null);
    const [selectedAlumniProfile, setSelectedAlumniProfile] = useState(null);
    const hasAlertedRef = useRef(false);

    // ✅ Check if a user is logged in

    useEffect(() => {
        const storedAlumni = JSON.parse(localStorage.getItem("alumni"));
    
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
    
            if (!currentUser && !storedAlumni && !hasAlertedRef.current) {
                hasAlertedRef.current = true;
                alert("Please login to continue");
                navigate("/"); // or "/login"
            }
    
            if (!currentUser && storedAlumni) {
                setAlumni(storedAlumni);
            }
        });
    }, []);
    

    // ✅ Fetch alumni data from the backend
    useEffect(() => {
        const fetchAlumni = async () => {
            try {
                const res = await axios.get(API_URL); // Fetch alumni data from Google Sheets via backend
                console.log("✅ Alumni Data Received:", res.data);
                setAlumni(res.data); // Save data into alumni state
            } catch (err) {
                console.error("❌ Error fetching alumni data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlumni();
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowOptionsIndex(null);
            }

        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    // ✅ Navigate to chat
    const startChat = (alumnus) => {
        if (!alumnus.name) {
            console.error("❌ ERROR: Alumni has no name!");
            return;
        }
        navigate(`/chat?name=${encodeURIComponent(alumnus.name)}`);
    };
    const viewProfile = async (name) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/profile/${name}`);
            setSelectedAlumniProfile(res.data);
            setShowOptionsIndex(null); // Close popup
        } catch (err) {
            console.error("Error fetching profile:", err);
            alert("Failed to load profile.");
        }
    };


    return (
        <div className="alumni-container">
            <h1>Alumni Network</h1>
            <p>Click on an alumnus to start a private chat.</p>

            {/* ✅ Search Bar */}
            <div className="search-bar">
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="search-dropdown"
                >
                    <option value="name">Name</option>
                    <option value="occupation">Occupation</option>
                    <option value="sector">Sector</option>
                </select>

                <input
                    type="text"
                    placeholder={`Search by ${searchType}`}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* ✅ Alumni List */}
            {loading ? (
                <p>Loading alumni data...</p>
            ) : (
                <div className="alumni-list">
                    {alumni.length > 0 ? (
                        alumni
                            .filter((alumnus) => {
                                const value = alumnus[searchType]?.toLowerCase() || "";
                                return value.includes(searchText.toLowerCase());
                            })
                            .map((alumnus, index) => (
                                <div key={index} className="alumni-card">
                                    <h3
                                        className="alumni-name clickable"
                                        onClick={() => setShowOptionsIndex(index)}
                                    >
                                        {alumnus.name || "Unknown"}
                                    </h3>
                                    {showOptionsIndex === index && (
                                        <div className="alumni-options-popup" ref={popupRef}>

                                            <button onClick={() => viewProfile(alumnus.name)}>
                                                🔍 View Profile
                                            </button>

                                            <button onClick={() => {
                                                startChat(alumnus);
                                                setShowOptionsIndex(null); // close popup
                                            }}>
                                                💬 Chat
                                            </button>
                                        </div>
                                    )}




                                    <p><b>Occupation:</b> {alumnus.occupation || "Not Provided"}</p>
                                    <p><b>Sector:</b> {alumnus.sector || "Not Provided"}</p>
                                </div>
                            ))
                    ) : (
                        <p>No alumni data available.</p>
                    )}
                </div>
            )}
            {selectedAlumniProfile && (
                <div className="alumni-profile-modal">
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setSelectedAlumniProfile(null)}>❌</button>
                        <img
                            src={
                                selectedAlumniProfile.profilePic
                                    ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${selectedAlumniProfile.profilePic}`
                                    : "default-avatar.png"
                            }
                            alt="Profile"
                            className="modal-profile-pic"
                        />
                        <h2>{selectedAlumniProfile.name}</h2>
                        <p><strong>Occupation:</strong> {selectedAlumniProfile.occupation || "Not provided"}</p>
                        <p><strong>Sector:</strong> {selectedAlumniProfile.sector || "Not provided"}</p>

                        {selectedAlumniProfile.linkedin && (
                            <p>
                                <strong>LinkedIn:</strong>{" "}
                                <a href={selectedAlumniProfile.linkedin} target="_blank" rel="noreferrer">
                                    {selectedAlumniProfile.linkedin}
                                </a>
                            </p>
                        )}

                        {selectedAlumniProfile.github && (
                            <p>
                                <strong>GitHub:</strong>{" "}
                                <a href={selectedAlumniProfile.github} target="_blank" rel="noreferrer">
                                    {selectedAlumniProfile.github}
                                </a>
                            </p>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
}

export default Alumni;