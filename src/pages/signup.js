import React, { useState } from "react";
import "./signup.css"; 
import { Link, useNavigate } from "react-router-dom";
import {ToastContainer} from 'react-toastify'
import "react-toastify/dist/ReactToastify.css"; 
import {handleError,handleSuccess} from "../utils/toast"

const Signup = () => {
    const [signupData, setsignupData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleChange =  (e) => {
       const {name, value}= e.target;
       const copyinfo= {...signupData};
       copyinfo[name]=value;
       setsignupData(copyinfo);
    };

    const navigate= useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("User Data:", signupData);
        const {name, email, password}= signupData;
        if(!name ||!email || !password){
            return handleError('name, email and password required!');
        }
        try {
            const url = "http://localhost:5000/auth/signup";
            const response = await fetch(url,{
                method: "POST",
                headers:{
                    'content-Type': 'application/json'
                },
                body: JSON.stringify(signupData)
            });
            const result = await response.json();
            console.log(result);
            const {success,message,error}=result;
            if(success){
                handleSuccess(message);
                setTimeout(()=>{
                    navigate('/login')
                },1000);
            }else if(error){
                const details= error?.details[0].message;
                handleError(details);
            }else if(!success){
                handleError(message);
            }
        } catch (err) {
            handleError(err);
        }
    };

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2>Sign Up</h2>
                
                <label htmlFor="name">Name:</label>
                <input type="text" name="name" autoFocus placeholder="username" value={signupData.name}  onChange={handleChange} required />

                <label htmlFor="email">Email:</label>
                <input type="email" name="email" placeholder="email"  value={signupData.email} onChange={handleChange} required />

                <label htmlFor="password">Password:</label>
                <input type="password" name="password" placeholder="Password"  value={signupData.password}  onChange={handleChange} required />

                <button type="submit">Sign Up</button>
                <span>Already have an account?
                    <Link to="/login">Login</Link>
                </span>
              
            </form>
            <ToastContainer/>
        </div>
    );
};

export default Signup;
