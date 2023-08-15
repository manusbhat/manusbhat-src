/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import React from "react";
import { HashLink } from "react-router-hash-link";

import { Theme } from "./template";

import "./globals.css"
import './navbar.css'
import { useUser } from "./proxy";
import { Link } from "react-router-dom";

type RoutingDictionary = {
    [route: string]: {
        href: string,

        submenu: {
            name: string,
            id: string
        }[]
    }
}

const routing_dicitionary: RoutingDictionary = {
    Home : {
        href:"/",
        submenu:[
        ]
    }, 
    "Text" : {
        href:"/text",
        submenu:[
        ]
    },
    "Tutoring" : {
        href: "/tutoring/problem_set/Main%20Problem%20Set",
        submenu: [
        ]
    },
    "Synchronizers" : {
        href: "/sync",
        submenu: [
        ]
    },
};

function expandNavbar() {
    const navbar = document.getElementById("navbar")!
    if (!navbar.classList.contains("navbar-expanded")) {
        navbar.classList.add("navbar-expanded");
    } else {
        navbar.classList.remove("navbar-expanded");
    }
}

/* NAVIGATION */
function Navbar(props: {active: string, setTheme: (theme: Theme) => void}) {
    const user = useUser();

    return (
        <nav id='navbar'>
            {/* <button id='navbar-theme-button' onClick={() => props.setTheme(Theme.LIGHT)}>
                switch theme
            </button> */}

            <span id='navbar-main'> 
                <span id="navbar-title">
                    <HashLink to='/#index-section'>Esoteric</HashLink>
                    <img id="navbar-logo" alt="Esoteric Logo" src="/svg/esoteric-flower.svg"/>
                </span>

                {/* separate buttons from title*/}
                <ul id='nav-buttons'>  
                    {/* Listed in right first order */}
                    <Navitem title='Text' active = {props.active}/>
                    <Navitem title='Tutoring' active = {props.active}/>
                    <Navitem title='Synchronizers' active = {props.active}/>
                   
                    <span id="navbar-login">
                        {user[0] == null 
                            ? 
                            <Link className="ui-capsule ui-button-primary" to="/auth">
                                Log In
                            </Link>
                            : 
                            <span className="ui-capsule ui-button-secondary" onClick={() => user[1](null)}>
                                Log Out
                            </span>
                        }
                    </span>
                </ul>

            </span>
           
            <button id='navbar-expand-button' onClick={expandNavbar}>
                {/* Belive this is from bootstrap, but not sure */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><path stroke="rgba(33,33,33,0.5)" strokeWidth="2" strokeLinecap="round" strokeMiterlimit="10" d="M4 8h24M4 16h24M4 24h24"/></svg>
            </button>
        </nav>
    );
}

function Navitem(props: {title: string, active?: string, href?: string}) {
    const title = props.title;

    let buttonClass = 'nav-button-link'
    if (title === props.active) {
        buttonClass += ' active-link'
    }

    const subList = routing_dicitionary[title] ?? {submenu:[]};
    const genList = [];

    const href = props.href || subList.href

    for (const elemName of subList.submenu) {
        // the '-section' gets the anchor translator
        genList.push(<Navitem title = {elemName.name} key = {elemName.id} href = {href + '#' + elemName.id + '-section'} />)
    }

    /* see if it's a submenu */
    if (genList.length === 0) {
        return (
            <li className='nav-button-span'>
                <HashLink to={href} className={buttonClass}>{props.title}</HashLink>
            </li>
        );
    }

    return (
        <li className='nav-button-span'>
            <HashLink to={href + '#' + subList.submenu[0].id + '-section'} className={buttonClass}>{props.title}</HashLink>

            <Navdropdown>
                {genList}
            </Navdropdown>
        </li>
    );
}

function Navdropdown(props: React.PropsWithChildren<{}>) {
    return (
        <ul className='nav-dropdown'>
            {props.children}
        </ul>
    );
}

export {routing_dicitionary, Navbar};