import "../styles/about.css";

function About() {
    return (
        <div className="about-container">
            <h1>About Us</h1>
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

            <div className="team-section">
                <h2>👥 Meet Our Team</h2>
                <div className="team-grid">
                    <div className="team-card">John Doe <br /> President</div>
                    <div className="team-card">Jane Smith <br /> Vice President</div>
                    <div className="team-card">Raj Patel <br /> Secretary</div>
                </div>
            </div>
        </div>
    );
}

export default About;
