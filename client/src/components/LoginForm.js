/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useState } from "react";
import validator from "validator";
import { Link } from "react-router-dom";
import Loading from "./modal/Loading";
import UserContext from "./context/UserContext";
import "../styles/styles.css";

const setBlurBackground = (reset) => {
    var elem = document.getElementById("login-box");

    if (reset) {
        elem.style.removeProperty("filter");
        return;
    }
    elem.style.filter = "blur(4px)";
};

const LoginForm = ({ history }) => {
    const { user, setUser } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const [loginInfo, setLoginInfo] = useState(undefined);

    async function loginServer() {
        const email = document.getElementById("email").value;
        if (!validator.isEmail(email)) {
            setIsLoading(false);
            setBlurBackground(true);
            document.getElementById("login-a").style.pointerEvents = "auto";
            setLoginInfo("Unable to login");
            return alert("Invalid email");
        }

        const password = document.getElementById("password").value;
        if (password.trim().length < 8) {
            setIsLoading(false);
            setBlurBackground(true);
            document.getElementById("login-a").style.pointerEvents = "auto";
            setLoginInfo("Unable to login");
            return alert("Password must be at least 8 characters long.");
        }

        try {
            const resp = await fetch("/login", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });
            const response = await resp.json();
            document.getElementById("login-a").style.pointerEvents = "auto";
            setIsLoading(false);
            setBlurBackground(true);
            if (!response.user) throw new Error("Unable to login");
            setUser({
                id: response.user._id,
                token: response.user.token,
                email: response.user.email,
            });

            history.push("/dashboard");
        } catch (error) {
            setIsLoading(false);
            setBlurBackground(true);

            setLoginInfo("Unable to login");
            document.getElementById("login-a").style.pointerEvents = "auto";
        }
    }

    return (
        <>
            {user.id && history.push("/dashboard")}
            {!user.id && (
                <>
                    {isLoading && <Loading />}
                    <div className="login-box" id="login-box">
                        <div className="login-box-container">
                            <h2>Login</h2>
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
                                <p>{loginInfo}</p>
                                <a
                                    onClick={() => {
                                        setIsLoading(true);
                                        setBlurBackground(false);
                                        document.getElementById(
                                            "login-a"
                                        ).style.pointerEvents = "none";
                                        loginServer();
                                    }}
                                    id="login-a"
                                >
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    Login
                                </a>
                                <Link to="/signup">
                                    <div className="signup">
                                        <label>Signup </label>
                                    </div>
                                </Link>

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
};

export default LoginForm;
