/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import React, { PropsWithChildren } from "react";

import "./globals.css"
import "./sidebar.css"

const padding = 75

function sign(target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    //if it's active set it to center
    //if it's yet to be reached add it to bottom

    if (rect.top + padding > window.innerHeight) {
        return 1;
    } else if (rect.bottom - padding < 0) {
        return -1;
    } else {
        return 0;
    } 
}

/* SIDEBAR */
/* acts like a table of contents */
function retargetScrollHelper(children: HTMLCollection) {
    var counterTop = 0;
    var counterMid = 0;
    var counterBot = 0;

    // two passes
    for (const elem of children) {
        const target = document.getElementById(elem.id.substring(2))!;  
        const s = sign(target);

        if (s === 0) {
            counterMid++;
        } else if (s === 1) {
            counterBot++;
        } 
    }

    const totalMid = counterMid;
    counterMid = 0;

    for (const elem of children) {
        const htmlElem = document.getElementById(elem.id)!;

        const target = document.getElementById(elem.id.substring(2))!;  
        const s = sign(target);
    

        var className;
        var top;
        if (s === 0) {
            className = 'active-section'
            top = `calc(${(counterMid++ - totalMid / 2) * htmlElem.getBoundingClientRect().height}px + 50%)`
        } else if (s === -1) {
            //finished section
            className = 'finished-section'
            top = `${counterTop++ * htmlElem.getBoundingClientRect().height}px`
        } else {
            className = 'upcoming-section'
            top = `calc(100% - ${counterBot-- * htmlElem.getBoundingClientRect().height}px)`
        }

        //safari rendering is wacky 
        if (htmlElem.className !== className) {
            htmlElem.className = className;
        }
        if (htmlElem.style.top !== top) {
            htmlElem.style.top = top;
        }
        htmlElem.style.opacity = "1";
    }
}

function retargetScroll(e: Event) {
    const sidebar = document.getElementById('sidebar')
    if (!sidebar) return;
    if (window.hasOwnProperty("safari") || (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.search("Chrome") === -1)) return; //safari has an unavoidable transition bug

    retargetScrollHelper(sidebar.children);
}

class Sidebar extends React.Component<PropsWithChildren<{}>> {
    render() {
        return (
            <aside id='sidebar'> 
                {this.props.children}
            </aside>
        );
    }

    componentDidMount() {
        // retargetScroll()
    }
}

function SidebarElement(props: {id: string, header: string}) {
    return (
        <a id={`p-${props.id}`} href={'#'+props.id +'-section'}>
            {props.header}
        </a>
    )
}

document.onscroll = retargetScroll;

export {Sidebar, SidebarElement} 
