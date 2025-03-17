import React, { useState } from "react";
import "./login.css"; 
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { handleError, handleSuccess } from "../utils/toast";
import { baseURL } from "../utils/constant";

const Login = () => {
    const [loginInfo, setloginInfo] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false); // State for loader

    const handleChange = (e) => {
        const { name, value } = e.target;
        setloginInfo((prev) => ({ ...prev, [name]: value }));
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!loginInfo.email || !loginInfo.password) {
            return handleError("Email and password required!");
        }

        setLoading(true); // Show loader

        try {
            const url = `${baseURL}/auth/login`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginInfo),
            });

            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;

            if (success) {
                handleSuccess(message);
                localStorage.setItem("token", jwtToken);
                localStorage.setItem("loggedInUser", name);
                setTimeout(() => {
                    navigate("/home");
                }, 1000);
            } else {
                handleError(error?.details?.[0]?.message || message);
            }
        } catch (error) {
            handleError("Login failed. Please try again.");
        } finally {
            setLoading(false); // Hide loader after completion
        }
    };

    return (
        <div className="login-page">
  <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>FocusFlow🎯</h2>

                <label htmlFor="email">Email:</label>
                <input type="email" name="email" placeholder="Email" value={loginInfo.email} onChange={handleChange} required />

                <label htmlFor="password">Password:</label>
                <input type="password" name="password" placeholder="Password" value={loginInfo.password} onChange={handleChange} required />

                <button type="submit" disabled={loading}>
                {loading ? (
                <div className="login-loader">
                <div></div>
                <div></div>
                <div></div>
                </div>
                ) : "Login"}
                </button>

                <span>
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </span>
            </form>
            <ToastContainer />
        </div>
        </div>
      
    );
};

export default Login;
