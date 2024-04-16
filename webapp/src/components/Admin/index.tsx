import React from "react";
import CommandList from "../Command/List";
import { Link } from "react-router-dom";


const Admin: React.FC = () => {
    return (
        <div>
            <CommandList admin />
        </div>
    )
}


export default Admin;