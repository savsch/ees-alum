import { useState, useEffect } from "react";
import { signInWithGoogle, auth, logout } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import Logo from "../assets/log.jpeg";
import ParticlesComponent from "./Particles";
import Sponsors from '../components/Sponsors/';

import img1 from "../assets/gallery1.jpg";
import img2 from "../assets/gallery2.jpg";
import img3 from "../assets/gallery3.jpg";
import img4 from "../assets/gallery4.jpg";
import img5 from "../assets/gallery5.jpg";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/alumni`;

function Home() {
    const [user, setUser] = useState(null);
    const [showAlumniPopup, setShowAlumniPopup] = useState(false);
    const [alumniData, setAlumniData] = useState({ name: "", email: "", occupation: "", password: "", interests: "", experience: "" });
    const [alumni, setAlumni] = useState(JSON.parse(localStorage.getItem("alumni")) || null);
    const navigate = useNavigate();
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [resetEmail, setResetEmail] = useState(""); // to store the email entered for password reset
    const [isRegistering, setIsRegistering] = useState(false);  // Add this line


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const emailDomain = currentUser.email.split("@")[1];
                if (emailDomain === "itbhu.ac.in") {
                    setUser(currentUser);
                } else {
                    alert("❌ Only IIT BHU students can log in.");
                    logout();
                    setUser(null);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const handleStudentLogin = () => {
        signInWithGoogle()
            .then((result) => {
                const emailDomain = result.user.email.split("@")[1];
                if (emailDomain !== "itbhu.ac.in") {
                    alert("❌ Only IIT BHU students can log in.");
                    logout();
                }
                window.location.reload(); // Refresh the page

            })
            .catch((error) => console.error("❌ Error signing in:", error));
    };

    const handlePasswordReset = async () => {
        if (!resetEmail) {
            alert("Please enter your email.");
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/request-reset`, {
                email: resetEmail,
            });


            alert("✅ Reset email sent. Check your inbox!");
            setResetEmail(""); // ✅ clears the email input
            setShowPasswordReset(false); // ✅ closes the reset popup
        } catch (err) {
            console.error("❌ Error sending reset request:", err);
            alert("Failed to send reset email.");
        }
    };




    const handleStudentLogout = async () => {
        try {
            await logout();
            setUser(null);
            setAlumni(null);
            localStorage.removeItem("alumni");
            navigate("/");
        } catch (error) {
            console.error("❌ Error logging out:", error);
        }
    };

    // Handle Alumni Login
    const handleAlumniLogin = async () => {
        try {
            console.log("Sending login request with data:", alumniData);
            const res = await axios.post(`${API_URL}/login`, {
                email: alumniData.email,
                password: alumniData.password,
            });
            window.location.reload(); // Refresh the page


            // Handle the response
            console.log("Login response:", res.data);

            // Store alumni data and token in local storage
            localStorage.setItem("alumni", JSON.stringify(res.data.alumni)); // Store the alumni details
            localStorage.setItem("token", res.data.token); // Store the JWT token

            setAlumni(res.data.alumni); // Update state with alumni data
            setShowAlumniPopup(false); // Close the login popup
            alert("✅ Login successful!");
        } catch (err) {
            console.log("Error logging in:", err);
            alert("❌ Login failed: " + err.response.data.message); // Show error message if login fails
        }
    };


    // Handle logout
    const handleAlumniLogout = () => {
        setAlumni(null);
        localStorage.removeItem("alumni");
        localStorage.removeItem("token");
        window.location.reload(); // Refresh the page

        navigate("/");
    };

    const [currentSlide, setCurrentSlide] = useState(0);
    const images = [img1, img2, img3, img4, img5];


    const moveSlide = (direction) => {
        let newSlide = currentSlide + direction;

        // Loop around
        if (newSlide < 0) {
            newSlide = images.length - 1;
        } else if (newSlide >= images.length) {
            newSlide = 0;
        }

        setCurrentSlide(newSlide);
    };






    return (
        <>
            <div className="home-container">
                <ParticlesComponent id="particles" />

                <div className="hero-section">
                    <h1>Electronics Engineering Society</h1>
                    <p>Innovate, Collaborate, and Excel at IIT BHU</p>

                    {!alumni && !user ? (
                        <div className="auth-buttons">
                            <button className="login-btn" onClick={handleStudentLogin}>Login as Student</button>
                            <button className="alumni-btn" onClick={() => setShowAlumniPopup(true)}>Login as Alumni</button>
                        </div>
                    ) : null}

                    {user && (
                        <div className="auth-buttons">
                            <p>Logged in as {user.displayName}</p>
                            <button className="logout-btn" onClick={handleStudentLogout}>Logout</button>
                        </div>
                    )}

                    {alumni && (
                        <div className="auth-buttons">
                            <p>Logged in as {alumni.name} ({alumni.occupation})</p>
                            <button className="logout-btn" onClick={handleAlumniLogout}>Logout</button>
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ About Section */}
            <div className="about-container">
                <h1>ABOUT US</h1>
                <p className="about-description">
                    Welcome to the <b>Society of Electronics Engineering</b> at IIT BHU! We are a dynamic community of
                    students, faculty, and professionals dedicated to fostering innovation in electronics and technology.
                </p>

                <div className="about-section">
                    <h2>🎯 Our Mission</h2>
                    <p>
                        To empower students with knowledge and hands-on experience in electronics, bridging the gap between
                        academia and industry through workshops, hackathons, and research.
                    </p>
                </div>

                <div className="about-section">
                    <h2>🌍 Our Vision</h2>
                    <p>
                        To be a hub of innovation where future engineers and tech leaders emerge, solving real-world
                        challenges with cutting-edge technology.
                    </p>
                </div>
            </div>

            {/* ✅ Image Carousel Section */}
            <div className="image-carousel">
                <h1>IMAGE VAULT</h1>
                <div className="carousel-container">
                    <button className="carousel-button left" onClick={() => moveSlide(-1)}>&#10094;</button>
                    <div className="carousel-images">
                        {/* Display 3 images at once */}
                        {[0, 1, 2].map((offset) => {
                            const index = (currentSlide + offset) % images.length;
                            return (
                                <img
                                    key={index}
                                    src={images[index]}
                                    alt={`image ${index + 1}`}
                                    className={`carousel-image ${offset === 1 ? "active" : "adjacent"}`}
                                />
                            );
                        })}

                    </div>
                    <button className="carousel-button right" onClick={() => moveSlide(1)}>&#10095;</button>
                </div>
            </div>






            {/* ✅ Alumni Login & Registration Popup */}
            {showAlumniPopup && (
                <div className="alumni-popup">
                    <div className="alumni-popup-content">
                        <button className="close-btn" onClick={() => setShowAlumniPopup(false)}>❌</button>
                        <h2>Alumni Login</h2>

                        <input type="email" name="email" placeholder="Your Email" onChange={(e) => setAlumniData({ ...alumniData, email: e.target.value })} />
                        <input type="password" name="password" placeholder="Password" onChange={(e) => setAlumniData({ ...alumniData, password: e.target.value })} />


                        <button className="submit-btn" onClick={handleAlumniLogin}>Login</button>
                        <button className="forgot-password-btn" onClick={() => setShowPasswordReset(true)}>
                            Forgot Password?

                        </button>
                        {/* Password Reset Form (Shown when Forgot Password is clicked) */}
                        {showPasswordReset && (
                            <div className="password-reset-popup">
                                <h2>Reset Your Password</h2>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                />
                                <button onClick={handlePasswordReset}>Send Reset Link</button>
                                <button onClick={() => setShowPasswordReset(false)}>Cancel</button>
                            </div>
                        )}
                    </div>
                </div>

            )}





            {/* ✅ Footer Section */}

            <footer className="footer">

                <div className="footer-content">

                    <div className="footer-logos">
                        <img src={Logo} alt="Society Logo" className="footer-logo" />
                    </div>


                    <div className="footer-links">
                        <h3>Important Links</h3>
                        <ul>
                            <li><a href="https://github.com/electronics-society" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                            <li><a href="https://www.linkedin.com/in/electronics-society/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                            <li><a href="/contact">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
                <p className="footer-bottom">© 2025 Electronics Engineering Society, IIT BHU. All rights reserved.</p>
            </footer>
            



        </>
    );
}

export default Home;
