import { ReactNode, useEffect } from "react"

import "./auth.css"
import "../../framework/globals.css"
import { Link } from "react-router-dom"

function EsotericLogo() {
    return (    
        <span id="auth-esoteric-logo">
            {/* force a page reload in case the user newly signs in */}
            <Link to="/">Esoteric</Link>
            <img alt="Esoteric Logo" src="/svg/esoteric-flower.svg"/>
        </span>
    )
}

export function AuthPage(props: React.PropsWithChildren<{terms?: ReactNode}>) {

    useEffect(() => {
        document.title = "Esoteric | Authentication"
    })

    return (
        <div id="auth">
            <EsotericLogo/>

            {/* The actual content */}
            <AuthBackground>
                {props.children}
            </AuthBackground>

            {props.terms}
        </div>
    )
}

function AuthBackground(props: React.PropsWithChildren<{}>) {
    return (
        <div id="auth-aligner">
            <div id="auth-background" className="window-background">
                {props.children}
            </div>
        </div>
    )
}