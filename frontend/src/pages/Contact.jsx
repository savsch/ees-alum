import { useState } from "react";
import axios from "axios";
import "../styles/contact.css";

const CONTACT_API_URL = `${import.meta.env.VITE_API_BASE_URL}/contact/send`;

function Contact() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const res = await axios.post(CONTACT_API_URL, formData);
            if (res.data.success) {
                setSubmitted(true);
                setFormData({ name: "", email: "", message: "" });
                setTimeout(() => setSubmitted(false), 3000);
            }
        } catch (err) {
            console.error("❌ Error sending message:", err);
            setError("Failed to send message. Please try again.");
        }
    };

    return (
        <div className="contact-container">
            <h1>Contact Us</h1>
            <p>We would love to hear from you! Reach out with your queries or feedback.</p>

            <div className="contact-form">
                {submitted ? (
                    <p className="success-message">✅ Message sent successfully! We will get back to you soon.</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" required />
                        <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your Message" required></textarea>
                        <button type="submit">Send Message</button>
                        {error && <p className="error-message">{error}</p>}
                    </form>
                )}
            </div>
        </div>
    );
}

export default Contact;
