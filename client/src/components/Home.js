import React, { useContext } from "react";
import UserContext from "./context/UserContext";

function HomePage({ history }) {
    const { user } = useContext(UserContext);
    return (
        <div>
            {user.id ? history.push("/dashboard") : history.push("/login")}
        </div>
    );
}

export default HomePage;
