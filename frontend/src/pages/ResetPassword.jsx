import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/reset.css"; // optional if you want to style
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/alumni`;

function ResetPassword() {

    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            return alert("Both fields are required.");
        }

        if (password !== confirmPassword) {
            return alert("Passwords do not match.");
        }

        try {
            const res = await axios.post(`${API_URL}/reset-password/${token}`, {
                password,
            });
            alert("✅ Password reset successfully!");
            navigate("/");
        } catch (err) {
            console.error("❌ Error resetting password:", err);
            alert(err.response?.data?.message || "Reset failed.");
        }
    };

    return (
        <div className="reset-container">
            <h2>🔐 Reset Password</h2>
            <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={handleReset}>Reset Password</button>
        </div>
    );
}

export default ResetPassword;
