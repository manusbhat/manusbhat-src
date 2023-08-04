/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */
import { PropsWithChildren } from "react";


function Section(props: PropsWithChildren<{id: string, name?: string}>) {
    if ("name" in props) {
        return (
            <section id = {props.id}>
                <span className="anchor-translator" id = {props.id +'-section'}/>
                <h1>{props.name}</h1>
                {props.children}
            </section>
        )
    }

    return (
        <section id = {props.id}>
            <span className="anchor-translator" id ={props.id +'-section'}/>
            {props.children}
        </section>
    )
}


export default Section;