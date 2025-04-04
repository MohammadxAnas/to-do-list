import React, { useEffect, useState } from "react";
import "./confirmation.css"; 
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { handleError, handleSuccess } from "../utils/toast";
import { baseURL } from "../utils/constant";

const Conf = () => {
    const [confCode, setConfCode] = useState({ code: "" });
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState(""); // State to store email

    const navigate = useNavigate();

    useEffect(() => {
        const storedEmail = localStorage.getItem("userEmail");
        if (!storedEmail) {
            navigate("/login");
        } else {
            setUserEmail(storedEmail); // Store email in state
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfCode((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!confCode.code) {
            return handleError("Confirmation code required!");
        }
    
        setLoading(true); // Show loader
    
        try {
            const data = { email: userEmail, code: confCode.code };
            const url = `${baseURL}/auth/verify`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
    
            const result = await response.json();
            const { success, message, error } = result;
    
            if (success) {
                handleSuccess(message);
                
                //  Remove email from localStorage after successful verification
                localStorage.removeItem("userEmail");
    
                setTimeout(() => {
                    navigate("/login");
                }, 1000);
            } else {
                handleError(error?.details?.[0]?.message || message);
            }
        } catch (error) {
            console.error("Verification Error:", error);
            handleError("Invalid code. Please try again.");
        } finally {
            setLoading(false); // Hide loader after completion
        }
    };

    return (
        <div className="conf-page">
            <div className="conf-container">
                <form className="conf-form" onSubmit={handleSubmit}>
                    <h3>Enter Confirmation Code</h3>

                    <p>
                    <span>
                        Enter the 6-digit code we sent to <br />
                        <i>{userEmail}</i>. <b>Request a new one.</b>
                    </span>
                    </p>

                    <input 
                        name="code" 
                        placeholder="Confirmation Code" 
                        value={confCode.code} 
                        onChange={handleChange} 
                        required 
                    />

                    <button type="submit" disabled={loading || !confCode.code.trim()}>
                        {loading ? (
                            <div className="conf-loader">
                                <div></div><div></div><div></div>
                            </div>
                        ) : "Next"}
                    </button>
                    
                    <span>
                        <Link 
                            to="/signup" 
                            className="go-back" 
                            onClick={() => localStorage.removeItem("userEmail")} 
                        >
                            Go back
                        </Link>
                    </span>
                    <span>
                        Have an account? <Link to="/login">Log in</Link>
                    </span>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
};

export default Conf;
