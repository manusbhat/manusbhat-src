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

enum Theme {
    LIGHT, DARK
}

const minWidth = 600;

const separation = 22;
const maxVariation = 0.8;
const dropoff = 17;

const scale = 15 * (Math.random() * Math.random() - 0.5);
const a = Math.random() ** Math.random();
const b = Math.random();
const c = Math.random() ** 2;
const d = (Math.random() * 0.95) * 0.6 + 0.2;

const scale2 = 25 * (Math.random() * Math.random() - 0.5);
const a2 = Math.random() * Math.random(); //biased left
const b2 = Math.random();
const c2 = Math.sqrt(Math.random());//biased right
const d2 = (1 -  Math.random() * 0.95) * 0.6 + 0.2;

function Background(props: {useStreaks: boolean}) {
    const [size, setSize] = useState({width: 0, height: 0});

    const f = (x: number) => -scale * (x - a) * (x - b) * (x - c) + d;
    const g = (x: number) => -scale2 * (x - a2) * (x - b2) * (x - c2) + d2; 
    
    const dots : ReactNode[] = [];
    // const noise2d = makeNoise2D
    for (var j = 0; j < size.height / separation; j++) {
        const subset = [];
        for (var i = 0; i < size.width / separation; i++) {
            const x = i / (size.width / separation);
            const y = j / (size.width / separation);
           
            const t1 =  Math.pow(Math.E, -dropoff * (Math.abs(f(y) - x)))
            const t2 = Math.pow(Math.E, -dropoff * (Math.abs(g(y) - x)));
            const t = t1 + t2;
            // const t = (Math.sin(i / circleScaleX - Math.cos(j - i) /circleScaleY  + 0.2 * Math.random()) / 2 + 0.5) + Math.log(Math.cos(j) + 3) / Math.log(size.height / separation);
            let s1 = Math.max(Math.min(1, t1), 0);
            let s2 = Math.max(Math.min(1, t2), 0);
            let s = Math.max(Math.min(1, t), 0);

            if (!props.useStreaks) s = 0;
            
            const base = Math.max(Math.min(1, 0.7 - s), 0);
            const streak1 = Math.max(Math.min(1, s1 - 0.1), 0);
            const streak2 = Math.max(Math.min(1, s2 - 0.2), 0);
            
            var fill = `rgb(calc(${base} * var(--dots-r) + ${streak1} * var(--streak1-r) + ${streak2} * var(--streak2-r)),
                         calc(${base} * var(--dots-g) + ${streak1} * var(--streak1-g) + ${streak2} * var(--streak2-g)),
                         calc(${base} * var(--dots-b) + ${streak1} * var(--streak1-b) + ${streak2} * var(--streak2-b)))`
            if (!props.useStreaks) {
                fill = `rgb(calc(${base} * var(--dots-r)), calc(${base} * var(--dots-g)), calc(${base} * var(--dots-b)))`
            }
            subset.push(
                <circle fill={fill}  
                    cx={separation * (i + 0.5) + "px"} 
                    cy={separation * (j + 0.5) + "px"} 
                    r={0.95 + s * maxVariation} key={i + size.width / separation * j}/>
            )
        }
        dots.push(<g key={j}>{subset}</g>)
    }    
    
    const wrapper = createRef<HTMLDivElement>();
    useEffect(() => {
        if ((wrapper.current?.clientWidth !== size.width || wrapper.current.clientHeight !== size.height) 
            && (wrapper.current?.clientWidth ?? 0) > minWidth) {
            setSize({width: wrapper.current?.clientWidth ?? 0, height: wrapper.current?.clientHeight ?? 0})
        }
    }, [wrapper, size.width, size.height]) 


    return (
        <div id="template-background" ref={wrapper}>
            <svg version="1.1" viewBox={"0.0 0.0 " + size.width + " " + size.height} fill="none" stroke="none" strokeLinecap="square" strokeMiterlimit="10" xmlnsXlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">
                {dots}
            </svg>
        </div>
    )
}


function StandardTemplate(props: React.PropsWithChildren<{active: string, useStreaks: boolean}>) {
    const sidebarElements = routing_dicitionary[props.active].submenu.map (
        (elem) => 
            <SidebarElement key={elem.id} id={elem.id} header={elem.name.toUpperCase()} />
    )

    const [theme, setTheme] = useState(Theme.DARK);

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

                <Footer/>

                <Background useStreaks={props.useStreaks}/>

            </main>

           
        </>
    );
}


export { StandardTemplate, Theme };
