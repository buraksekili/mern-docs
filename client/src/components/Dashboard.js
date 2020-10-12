import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import "../styles/dashboard.css";
import "../styles/docs.css";
import UserContext from "./context/UserContext";
import Doc from "./Doc";
import Loading from "./modal/Loading";

function DashBoard({ history }) {
  const { user } = useContext(UserContext);
  const [userDocs, setUserDocs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrDocs = () => {
    axios
      .get("/getdocs")
      .then((res) => {
        setIsLoading(false);
        setUserDocs(res.data);
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    getCurrDocs();
  }, []);

  const deletePost = (docId) => {
    axios
      .get("/deletetask", { params: { id: docId } })
      .then((res) => setUserDocs(res.data))
      .catch((e) => console.log(e));
  };

  return (
    <>
      {user.id ? (
        <div className="dashboard-div">
          {isLoading && <Loading />}
          <h1>
            DashBoard - <label className="user-email">{user.email}</label>{" "}
          </h1>
          <div className="docs">
            {userDocs &&
              userDocs.map((doc) => {
                return (
                  <div key={doc._id} className="doc">
                    <Doc key={doc._id} id={doc._id} title={doc.title} />
                    <button
                      className="delete-button"
                      onClick={() => deletePost(doc._id)}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        history.push("/login")
      )}
    </>
  );
}

export default DashBoard;
