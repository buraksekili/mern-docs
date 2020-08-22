/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useState, useRef } from "react";
import validator from "validator";
import axios from "axios";
import UserContext from "./context/UserContext";
import "../styles/styles.css";
import Loading from "./modal/Loading";

function Signup({ history }) {
    const { user } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const statusRef = useRef();

    function register() {
        const email = document.getElementById("email").value;
        if (!validator.isEmail(email)) {
            setIsLoading(false);
            document.getElementById("signup-a").style.pointerEvents = "auto";
            return alert("Invalid email");
        }

        const password = document.getElementById("password").value;
        if (password.trim().length < 8) {
            setIsLoading(false);
            document.getElementById("signup-a").style.pointerEvents = "auto";
            return alert("Password must be at least 8 characters long.");
        }

        axios
            .post("http://localhost:5000/signup", { email, password })
            .then((res) => {
                if (res.status === 200) {
                    setIsLoading(false);
                    document.getElementById("signup-a").style.pointerEvents =
                        "auto";
                }
                history.push("/login");
            })
            .catch((e) => {
                setIsLoading(false);
                document.getElementById("signup-a").style.pointerEvents =
                    "auto";
                statusRef.current.innerHTML = "User already exists.";
                statusRef.current.style.color = "red";
            });
    }

    return (
        <>
            {user.id ? (
                history.push("/dashboard")
            ) : (
                <>
                    {isLoading && <Loading />}
                    <div className="login-box">
                        <div className="login-box-container">
                            <h2>Signup</h2>
                            <form>
                                <div className="user-box">
                                    <input
                                        type="text"
                                        name=""
                                        id="email"
                                        required
                                    />
                                    <label>Email</label>
                                </div>
                                <div className="user-box">
                                    <input
                                        type="password"
                                        name=""
                                        id="password"
                                        required
                                    />
                                    <label>Password</label>
                                </div>
                                <p className="pw-info">
                                    Password must be at least 8 characters long.
                                </p>

                                <a
                                    onClick={() => {
                                        document.getElementById(
                                            "signup-a"
                                        ).style.pointerEvents = "none";
                                        setIsLoading(true);
                                        register();
                                    }}
                                    className="signup-2"
                                    href="#"
                                    id="signup-a"
                                >
                                    <label>Signup </label>
                                </a>
                                <p ref={statusRef}></p>
                                <a className="gmail" href="#">
                                    <label>Sign in With Google </label>
                                </a>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default Signup;
