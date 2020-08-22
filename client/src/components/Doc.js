import React from "react";
import { Link } from "react-router-dom";

function Doc({ id, title }) {
    return (
        <>
            <Link to={{ pathname: "/editor", state: { newDoc: false, id } }}>
                <p className="single-doc">
                    {title && title.length > 0 ? title : "New File"}
                </p>
            </Link>
        </>
    );
}

export default Doc;
