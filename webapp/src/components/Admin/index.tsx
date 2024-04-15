import React from "react";
import CommandList from "../Command/List";


const Admin: React.FC = () => {
    React.useEffect(() => {
        console.log("Admin");
    })
    return (
        <div>
            <CommandList admin />
        </div>
    )
}


export default Admin;