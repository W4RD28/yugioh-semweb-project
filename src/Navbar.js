import React from 'react';
import {  Link } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Paper } from '@material-ui/core';

const styles = {
    appInnerContainer: {
        width: "90%",
        margin: "20px auto 0"
    },
    paper: {
        overflowX: "auto"
    },
    horizontal: {
        display: "inline"
    },

}


const Navbar = () => {

    return(
        <nav style={styles.appInnerContainer}>
            <Paper style={styles.paper}>
                <ul style={styles.horizontal}>
                    <li style={styles.horizontal_li}>
                    <Link to="/">All Cards</Link>
                    </li>
                    <li style={styles.horizontal_li}>
                    <Link to="/monsters">Monsters</Link>
                    </li>
                </ul>
            </Paper>
        </nav>
    );
}

export default Navbar;