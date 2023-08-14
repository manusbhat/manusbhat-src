/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import { PropsWithChildren } from "react";
import "./globals.css"
import "./footer.css"
import { PlainSeparator } from "./separator";

/* FOOTER */

function Footer() {
    return (
        <footer>
            <PlainSeparator/>

            <p>
                Last updated <span id="git-last-commit-date">August 05, 2023</span>. Copyright © Manu Bhat 2022-{new Date().getFullYear()}. All rights reserved.
                <br/>
                Not rated for mobile.
            </p>

        </footer>
    );
}

export default Footer;
