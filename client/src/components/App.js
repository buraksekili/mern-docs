import axios from "axios";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import UserContext from "./context/UserContext";
import DashBoard from "./Dashboard";
import TextEditor from "./Editor";
import HomePage from "./Home";
import LoginForm from "./LoginForm";
import Navbar from "./Navbar";
import Signup from "./Signup";

export default function App() {
  const [user, setUser] = useState({
    id: undefined,
    email: undefined,
    token: undefined,
    isLoading: true,
  });

  function checkAuth() {
    axios
      .get("/checkauth")
      .then((res) => {
        console.log("Authenticated!");

        const token = res.data.token;
        delete res.data.token;

        setUser({
          id: res.data._id,
          email: res.data.email,
          token,
        });
      })
      .catch((e) => console.error(e));
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <BrowserRouter>
        <UserContext.Provider value={{ user, setUser }}>
          <Navbar />
          <Switch>
            <Route path="/" exact component={HomePage} />
            <Route path="/login" exact component={LoginForm} />
            <Route path="/signup" exact component={Signup} />
            <Route path="/dashboard" exact component={DashBoard} />
            <Route path="/editor" exact component={TextEditor} />
            <Route path="/" render={() => <div>404</div>} />
          </Switch>
        </UserContext.Provider>
      </BrowserRouter>
    </>
  );
}
