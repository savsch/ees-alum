import { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";
import { useLocation } from "react-router-dom";


const PROFILE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/profile`;

function Profile() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const viewedName = searchParams.get("name"); // ✅ this is the name in URL param if clicked from chat

    const [alumni, setAlumni] = useState(JSON.parse(localStorage.getItem("alumni")) || null);

    const [user, setUser] = useState(null);




    const [profileData, setProfileData] = useState({
        name: "",
        department: "",
        degree: "",
        about: "",
        profilePic: "",
        occupation: "",
        sector: "",
        type: "",
        linkedin: "",
        github: "",
        email: ""
        // <- add this!
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const isViewingOwnProfile = !viewedName || (user && viewedName === user.displayName) || (alumni && viewedName === alumni.name);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const isAlumniProfile = profileData.type === "alumni";

    useEffect(() => {
        const storedAlumni = JSON.parse(localStorage.getItem("alumni"));

        if (viewedName) {
            // You're viewing someone else's profile (from chat)
            fetchProfileData(viewedName);
        } else {
            // You're viewing your own profile (student or alumni)
            onAuthStateChanged(auth, (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                    fetchProfileData(currentUser.displayName);
                } else if (storedAlumni) {
                    setAlumni(storedAlumni);
                    fetchProfileData(storedAlumni.name);
                } else {
                    alert("Please login to continue");

                    navigate("/");
                }
            });
        }
    }, []);


    const fetchProfileData = async (username) => {
        try {
            const res = await axios.get(`${PROFILE_API_URL}/${username}`);
            setProfileData(res.data);
        } catch (err) {
            console.error("❌ Error fetching profile:", err);
        }
    };

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setProfileData({ ...profileData, profilePic: URL.createObjectURL(file) }); // Show preview
        }
    };

    const saveProfile = async () => {
        try {
            const formData = new FormData();
            formData.append("name", user ? user.displayName : alumni?.name);
            formData.append("department", profileData.department);
            formData.append("degree", profileData.degree);
            formData.append("about", profileData.about);
            formData.append("occupation", profileData.occupation);
            formData.append("sector", profileData.sector);
            formData.append("email", profileData.email);
            formData.append("linkedin", profileData.linkedin);
            formData.append("github", profileData.github);

            if (selectedFile) {
                formData.append("profilePic", selectedFile);
            }

            const res = await axios.post(`${PROFILE_API_URL}/update`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setProfileData(res.data);
            alert("✅ Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            console.error("❌ Error updating profile:", err);
        }
    };


    return (
        <div className="profile-wrapper">
            <div className="sidebar">
                <h2>Dashboard</h2>
                <ul>
                    <li onClick={() => navigate("/")}>🏠 Home</li>
                    <li className="active">👤 Profile</li>
                </ul>
            </div>

            <div className="profile-container">

                <div className="profile-badges">
                    <h3>🎯 Quick Actions</h3>
                    <div className="badges">
                        <span className="badge">🎓 {isAlumniProfile ? "Alumnus" : "Student"}</span>
                        {viewedName && (
                            <button
                                className="chat-btn"
                                onClick={() => navigate(`/chat?name=${viewedName}`)}
                                style={{
                                    backgroundColor: "#0079d3",
                                    color: "white",
                                    padding: "8px 14px",
                                    borderRadius: "20px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    marginLeft: "10px"
                                }}
                            >
                                💬 Chat
                            </button>
                        )}
                    </div>


                </div>

                <div className="profile-flex">
                    <div className="profile-left">
                        {/* <img
                            src={
                                profileData.profilePic
                                    ? `http://localhost:5001/uploads/${profileData.profilePic}`
                                    : "default-avatar.png"
                            }
                            className="profile-pic-large"

                        /> */}
                        <img
                            src={
                                profileData.profilePic?.startsWith("blob:")
                                    ? profileData.profilePic
                                    : profileData.profilePic
                                        ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${profileData.profilePic}`
                                        : "default-avatar.png"
                            }
                            className="profile-pic-large"
                        />


                        {isEditing && (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                />
                                <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
                                    📤 Upload Photo
                                </button>
                            </>
                        )}
                    </div>

                    <div className="profile-right">
                        <h2>{profileData.name}</h2>
                        {isAlumniProfile ? (
                            <>
                                <p><strong>Occupation:</strong> {isEditing ? <input name="occupation" value={profileData.occupation} onChange={handleChange} /> : profileData.occupation}</p>
                                <p><strong>Sector:</strong> {isEditing ? <input name="sector" value={profileData.sector} onChange={handleChange} /> : profileData.sector}</p>
                                <p><strong>Email:</strong> {isEditing ? <input name="email" value={profileData.email} onChange={handleChange} /> : profileData.email}</p>
                                <p><strong>LinkedIn:</strong> {isEditing ?
                                    <input name="linkedin" value={profileData.linkedin} onChange={handleChange} /> :
                                    <a href={profileData.linkedin} target="_blank" rel="noreferrer">{profileData.linkedin}</a>}</p>

                                <p><strong>GitHub:</strong> {isEditing ?
                                    <input name="github" value={profileData.github} onChange={handleChange} /> :
                                    <a href={profileData.github} target="_blank" rel="noreferrer">{profileData.github}</a>}</p>


                            </>
                        ) : (
                            <>
                                <p><strong>Department:</strong> {isEditing ? <input name="department" value={profileData.department} onChange={handleChange} /> : profileData.department}</p>
                                <p><strong>Degree:</strong> {isEditing ? (
                                    <select name="degree" value={profileData.degree} onChange={handleChange}>
                                        <option value="">Select Degree</option>
                                        <option value="B.Tech">B.Tech</option>
                                        <option value="M.Tech">M.Tech</option>
                                        <option value="IDD">IDD</option>
                                        <option value="Ph.D">Ph.D</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : profileData.degree}</p>
                                <p><strong>Email:</strong> {isEditing ? <input name="email" value={profileData.email} onChange={handleChange} /> : profileData.email}</p>
                                <p><strong>LinkedIn:</strong> {isEditing ?
                                    <input name="linkedin" value={profileData.linkedin} onChange={handleChange} /> :
                                    <a href={profileData.linkedin} target="_blank" rel="noreferrer">{profileData.linkedin}</a>}</p>

                                <p><strong>GitHub:</strong> {isEditing ?
                                    <input name="github" value={profileData.github} onChange={handleChange} /> :
                                    <a href={profileData.github} target="_blank" rel="noreferrer">{profileData.github}</a>}</p>



                                <p><strong>About:</strong> {isEditing ? <textarea name="about" value={profileData.about} onChange={handleChange} /> : profileData.about}</p>
                            </>
                        )}


                        {isViewingOwnProfile && (
                            isEditing ? (
                                <button className="save-btn" onClick={saveProfile}>Save</button>
                            ) : (
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                            )
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}

export default Profile;