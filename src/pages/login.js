import React, { useState } from "react";
import "./login.css"; 
import { Link, useNavigate } from "react-router-dom";
import {ToastContainer} from 'react-toastify'
import "react-toastify/dist/ReactToastify.css"; 
import {handleError,handleSuccess} from "../utils/toast"

const Login = () => {
    const [loginInfo, setloginInfo] = useState({
        email: "",
        password: ""
    });

    const handleChange =  (e) => {
       const {name, value}= e.target;
       console.log(name, value);
       const copyinfo= {...loginInfo};
       copyinfo[name]=value;
       setloginInfo(copyinfo);
    };
    console.log(loginInfo);
    const navigate= useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("User Data:", loginInfo);
        const {email, password}= loginInfo;
        if(!email || !password){
            return handleError('email and password required!');
        }
        try {
            const url = "http://localhost:5000/auth/login";
            const response = await fetch(url,{
                method: "POST",
                headers:{
                    'content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            console.log(result);
            const {success,message,jwtToken,name,error}=result;
            if(success){
                handleSuccess(message);
                localStorage.setItem('token',jwtToken);
                localStorage.setItem('loggedInUser',name);
                setTimeout(()=>{
                    navigate('/home')
                },1000);
            }else if(error){
                const details= error.details[0].message;
                handleError(details);
            }else if(!success){
                handleError(message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                <label htmlFor="email">Email:</label>
                <input type="email" name="email" placeholder="email"  value={loginInfo.email} onChange={handleChange} required />

                <label htmlFor="password">Password:</label>
                <input type="password" name="password" placeholder="Password"  value={loginInfo.password}  onChange={handleChange} required />

                <button type="submit">Login</button>
                <span>Don't have an account?
                    <Link to="/signup">Sign up</Link>
                </span>
            </form>
            <ToastContainer/>
        </div>
    );
};

export default Login;

