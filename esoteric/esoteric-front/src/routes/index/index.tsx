/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { StandardTemplate } from "../../framework/template";

import "./index.css"
import Section from "../../framework/section";

function ActualStatus(props: {path: string}) {
    const [status, setStatus] = useState("ping");
    const [className, setClassName] = useState("index-status-loading")

    useEffect(() => {
        const worker = async () => {
            var result;
            try {
                result = await fetch(props.path);
            } catch (e) {
                setStatus("501 ERR");
                setClassName("index-status-err"); 
                return;
            }

            if (result.ok) {
                setStatus(result.status + " OK");
                setClassName("index-status-ok");
            }
            else {
                setStatus(result.status + " ERR");
                setClassName("index-status-err");
            }
        }

        worker();
    })

    return (
        <strong className={className}>
            {status}
        </strong>
    )    
}

function Status(props: {id?: string, title: string, subtitle?: string, subtitle_path?: string, icon: string, children?: ReactNode}) {
    return (
        <div id={props.id} className="index-status window-background">
            <p className="index-status-title">{props.title}</p>
            {
                props.subtitle &&
                <p className="index-status-subtitle">
                    {props.subtitle}
                    {' '}
                    <ActualStatus path={process.env.REACT_APP_API_URL + props.subtitle_path!} />
                </p>
            }
            
            <div className="index-status-img-holder">
                <img src={props.icon} alt={props.title} />
            </div>

            {props.children}
        </div>
    )
}

export default function Home() {
    return (
        <StandardTemplate active='Home' useStreaks={true}>
            <span id="index-section" className="anchor-translator" />

            <h1>System Health</h1>

            <Section id="status">
                {/* skipper */}
                <span /> 

                <Status
                    id="index-nginx"
                    title="nginx Reverse Proxy"
                    subtitle="system::nginx"
                    subtitle_path="/status"
                    icon="/img/nginx.webp"
                    >
                    {/* connections for a later story... */}
                    {/* <svg width="100%" height={100} style={{left: "-100"}}>
                        <g>
                            <path fill="none" stroke="var(--accent3)" strokeWidth={1} d="M 0,0 L 100,100"/>
                        </g>
                    </svg> */}
                </Status>
                
                {/* skipper */}
                <span />
                
                <Status
                    title="Tutoring API"
                    subtitle="system::enss"
                    subtitle_path="/enss/status"
                    icon="/img/rust.webp"
                    />
                
                <Status
                    title="Text API"
                    subtitle="system::text"
                    subtitle_path="/text/status"
                    icon="/img/rust.webp"
                    />

                <Status
                    title="Authentication API"
                    subtitle="system::auth"
                    subtitle_path="/auth/status"
                    icon="/img/rust.webp"
                    />
                
                <Status
                    title="Synchronizers API"
                    subtitle="system::sync"
                    subtitle_path="/sync/status"
                    icon="/img/rust.webp"
                    />

                <Status
                    title="enss-DB"
                    icon="/img/sqlite.webp"
                    />
                
                <Status
                    title="text-DB"
                    icon="/img/sqlite.webp"
                    />

                <Status
                    title="auth-DB"
                    icon="/img/sqlite.webp"
                    />
                
                <Status
                    title="sync-DB"
                    icon="/img/sqlite.webp"
                    />
            </Section>
        </StandardTemplate>
    );
}