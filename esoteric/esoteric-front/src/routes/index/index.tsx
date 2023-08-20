/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import React, { useState } from "react";
import { StandardTemplate } from "../../framework/template";

import "./index.css"
import Section from "../../framework/section";
import { useWorker } from "../../framework/proxy";

function ActualStatus(props: {path: string, name: string}) {
    const [status, setStatus] = useState("ping");
    const [className, setClassName] = useState("index-status-loading")

    useWorker(
        async () => {
            try {
                const result = await fetch(process.env.REACT_APP_API_URL + props.path);
                setStatus(result.status + " OK");
                setClassName("index-status-ok");
            } catch (e) {
                setStatus("501 ERR");
                setClassName("index-status-err"); 
                return;
            }

        }
    )

    return (
        <p className="index-status-subtitle">
            {"system::" + props.name}
            {' '}
            <strong className={className}>
                {status}
            </strong>
        </p>
    )    
}

function Stats(props: {path: string, name: string}) {
    const [stats, setStats] = useState({"db_bytes": 0, "log_bytes": 0});

    useWorker(
        async () => {
            try {
                const result = await fetch(process.env.REACT_APP_API_URL + props.path);
                const json = await result.json();
                setStats(json);
            } catch (e) {
                return;
            }
        }
    )

    return (
        <p className="index-status-subtitle">
            {"db: "}
            <strong className="index-status-">
                {Math.floor(stats.db_bytes / 1000) + " kB"}
            </strong>
            {" log: "}
            <strong className="index-status-">
                {Math.floor(stats.log_bytes / 1000) + " kB"}
            </strong>
        </p>
    )
}

function Status(props: React.PropsWithChildren<{
    id?: string, 
    title: string,
    name?: string, 
    status?: string,
    stats?: string
    icon: string, 
}>) {

    return (
        <div id={props.id} className="index-status window-background">
            <p className="index-status-title">{props.title}</p>
            
            {
                props.status &&
                <ActualStatus name={props.name!} path={props.status} />
            }

            {
                props.stats &&
                <Stats name={props.name!} path={props.stats} />
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
                    name="nginx"
                    status="/status"
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
                    name="enss"
                    status="/enss/status"
                    icon="/img/rust.webp"
                    />
                
                <Status
                    title="Text API"
                    name="text"
                    status="/text/status"
                    icon="/img/rust.webp"
                    />

                <Status
                    title="Authentication API"
                    name="auth"
                    status="/auth/status"
                    icon="/img/rust.webp"
                    />
                
                <Status
                    title="Synchronizers API"
                    name="sync"
                    status="/sync/status"
                    icon="/img/rust.webp"
                    />

                <Status
                    title="enss.db"
                    icon="/img/sqlite.webp"
                    name="enss"
                    stats="/enss/stats"
                    />
                
                <Status
                    title="text.db"
                    icon="/img/sqlite.webp"
                    name="text"
                    stats="/text/stats"
                    />

                <Status
                    title="auth.db"
                    icon="/img/sqlite.webp"
                    name="auth"
                    stats="/auth/stats"
                    />
                
                <Status
                    title="sync.db"
                    icon="/img/sqlite.webp"
                    name="sync"
                    stats="/sync/stats"
                    />
            </Section>
        </StandardTemplate>
    );
}