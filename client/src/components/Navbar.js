import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import UserContext from "./context/UserContext";
import "../styles/nav.css";

function Navbar() {
    const { user, setUser } = useContext(UserContext);
    let location = useLocation();
    return (
        <div className="main-nav">
            {!user.id ? (
                <Link to="/login">Login</Link>
            ) : (
                <>
                    {location.pathname !== "/dashboard" && (
                        <Link to="/dashboard">Dashboard</Link>
                    )}
                    {location.pathname !== "/editor" && (
                        <Link
                            to={{
                                pathname: "/editor",
                                state: { newDoc: true },
                            }}
                        >
                            Create new doc
                        </Link>
                    )}
                    <Link
                        to="/"
                        onClick={() => {
                            axios
                                .post("/logout")
                                .catch((e) => console.error(e));
                            setUser({
                                id: undefined,
                                email: undefined,
                                token: undefined,
                                isLoading: false,
                            });
                        }}
                    >
                        Logout
                    </Link>
                </>
            )}
        </div>
    );
}

export default Navbar;
