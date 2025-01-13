import React from "react";
import styles from "./header.module.css";
import { BsPersonCircle } from "react-icons/bs";

const Header = () => {
    return (
        <div className={styles.headerContainer}>
            <div className={styles.logoText}>JumboJetCRM</div>
            <div>
                <button className={styles.profileCircle}>
                    <BsPersonCircle />
                </button>
            </div>
        </div>
    );
};

export default Header;
