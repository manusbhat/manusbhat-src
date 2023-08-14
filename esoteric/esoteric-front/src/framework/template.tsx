/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import React, { ReactNode, createRef, useEffect, useState } from "react";

import './globals.css'
import './template.css'

import { Navbar, routing_dicitionary } from "./navbar";
import Footer from "./footer";
import { Sidebar, SidebarElement } from "./sidebar";
import { AppStateContext, EsotericState, UserHandle } from "./proxy";

enum Theme {
    LIGHT, DARK
}

function StandardTemplate(props: React.PropsWithChildren<{active: string, useStreaks: boolean, disableDots?: boolean}>) {
    const sidebarElements = routing_dicitionary[props.active]?.submenu.map (
        (elem) => 
            <SidebarElement key={elem.id} id={elem.id} header={elem.name.toUpperCase()} />
    )

    const [theme, setTheme] = useState(Theme.LIGHT);


    useEffect(() => {
        switch (theme) {
            case Theme.LIGHT:
                document.body.className = "body-theme-light"
                break
            case Theme.DARK:
                document.body.className = "body-theme-dark"
                break
        }
    }, [theme]);

    return (
        <>
            <header>
                <Navbar active={props.active} setTheme={setTheme}/>
            </header>

            <main>
                {props.children}

                <Sidebar>
                    {sidebarElements}
                </Sidebar>
            </main>

            <Footer/>
        </>
    );
}


export { StandardTemplate, Theme };
