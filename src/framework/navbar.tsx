/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import React from "react";
import { HashLink } from "react-router-hash-link";

import { Theme } from "./standard_template";

import "../globals.css"
import './navbar.css'

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
    "Experience" : {
        href:"/experience",
        submenu:[
            {
                name:"Formal",
                id:"formal"
            }, 
            {
                name:"Projects",
                id:"projects"
            },
            {
                name:"Organizations",
                id:"organizations"
            },
            {
                name:"Academics",
                id:"academics"
            },
            {
                name:"Skills",
                id: "skills"
            },
            {
                name:"Honors",
                id: "honors"
            }
        ]
    },
    Personal : {
        href: "/personal",
        submenu: [

        ]
    },
    Contact :   {
        href:"/contact",
        submenu:[
        ]
    }
};

function expandNavbar() {
    const navbar = document.getElementById("navbar")!
    if (!navbar.classList.contains("expanded")) {
        navbar.classList.add("expanded");
    } else {
        navbar.classList.remove("expanded");
    }
}

/* NAVIGATION */
function Navbar(props: {active: string, setTheme: (theme: Theme) => void}) {
    return (
        <nav id='navbar'>
            {/* <button id='navbar-theme-button' onClick={() => props.setTheme(Theme.LIGHT)}>
                switch theme
            </button> */}

            <span id='navbar-main'> 
                {/* actual Manu Bhat title */}
                <HashLink to='/#index-section'>Manu Bhat</HashLink>
                {/* separate buttons from title*/}
                <ul id='nav-buttons'>  
                    {/* Listed in right first order */}
                    <Navitem title='Experience' active = {props.active}/>
                    <Navitem title='Personal' active = {props.active}/>
                    <Navitem title='Contact' active = {props.active}/>
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