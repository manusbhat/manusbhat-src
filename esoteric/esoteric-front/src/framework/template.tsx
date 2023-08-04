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

const separation = 24;
const maxVariation = 1;
const dropoff = 20;

const scale = 40 * (Math.random() - 0.5);
const a = Math.random();
const b = Math.random();
const c = Math.random();
const d = 0.4 * Math.random();

const scale2 = 10 * (Math.random() - 0.5);
const a2 = Math.random() * Math.random(); //biased left
const b2 = Math.random();
const c2 = Math.sqrt(Math.random());//biased right
const d2 = 0.6 * Math.random();

function Background(props: {useStreaks: boolean}) {
    const [size, setSize] = useState({width: 0, height: 0});
    
    const dots : ReactNode[] = [];
    // const noise2d = makeNoise2D
    for (var j = 0; j < size.height / separation; j++) {
        const subset = [];
        for (var i = 0; i < size.width / separation; i++) {
            const x = i / (size.width / separation);
            const y = j / (size.width / separation);

            const f = (x:number) => -scale * (x - a) * (x - b) * (x - c) + d;
            const g = (x:number) => -scale2 * (x - a2) * (x - b2) * (x - c2) + d2;
            const t = Math.pow(Math.E, -dropoff * (Math.abs(f(x) - y))) + Math.pow(Math.E, -dropoff * (Math.abs(g(x) - y)));
            // const t = (Math.sin(i / circleScaleX - Math.cos(j - i) /circleScaleY  + 0.2 * Math.random()) / 2 + 0.5) + Math.log(Math.cos(j) + 3) / Math.log(size.height / separation);
            let s = Math.max(Math.min(1, t), 0);
            if (!props.useStreaks) s = 0;
            
            subset.push(<circle fill="var(--accent3)" cx={separation * (i + 0.5) + "px"} cy={separation * (j + 0.5) + "px"} r={0.55 + s * maxVariation} key={i + 100 * j}></circle>)
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
