/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

 import React, { PropsWithChildren, ReactElement } from "react";
 import Section from "./section";
 import "./globals.css"
 import "./skill_list.css"
import { Link } from "react-router-dom";

 function SkillGroup(props: React.PropsWithChildren<{id: string, title?: string}>) {
    return (
        <Section id={props.id} name = {props.title}>
            <div className="skill-group">
                {props.children}
            </div>
        </Section>
    )
}

 function Skill(props: React.PropsWithChildren<{name: string, desc?: string, img_src?: string, href?: string, rating?: string}>) {
    // rating and image are optional

    const image = "img_src" in props
        ? <img className="skill-image" src = {props.img_src} alt = {props.name}/>
        : [];

    var rating: ReactElement | null = null;
    if ("rating" in props) {
        const count = parseInt(props.rating!);
        if (count === 0) {
            rating = <p className="skill-rating">&#9734;&#9734;&#9734;</p>;
        } else if (count === 1) {
            rating = <p className="skill-rating">&#9733;&#9734;&#9734;</p>
        } else if (count === 2) {
            rating = <p className="skill-rating">&#9733;&#9733;&#9734;</p>;
        } else {
            rating = <p className="skill-rating">&#9733;&#9733;&#9733;</p>;
        }
    }

    const title_style = props.href ? {} : {}
    return (
        <li className="skill-item">
            <span className="skill-circle"/>
            {/* right  */}
            <span className="skill-rectangle window-background">
                {/* image on left, title up, subheader below it, rating on the right */}
                <span className="skill-text">
                    <a href={props.href} target="_blank" rel="noopener noreferrer">
                        <div className="skill-title">
                            {image}
                            <div className="skill-title-text">
                                <p className="skill-title-main" style={title_style}>
                                    {props.name}
                                </p>
                            </div>
                        </div>
                    </a>

                    <div className="skill-description">
                        {props.children ?? props.desc}
                    </div>
                </span>
                {rating}
            </span>
        </li>
    )
}

export function InlineSkillList(props: PropsWithChildren<{ title: string }>) {
    return (
        <li className="skill-inline window-background">
            <p className="skill-inline-title">
                {props.title}
            </p>
            <div className="skill-inline-list">
                {props.children}
            </div>
        </li>
    )
}

export function InlineSkill(props: { name: string, rating?: string, img_src?: string, href?: string}) {
    // rating and image are optional
    const image = "img_src" in props
        ? <img className="skill-inline-image" src={props.img_src} alt={props.name} />
        : [];

    var rating: ReactElement | null = null;
    if ("rating" in props) {
        const count = parseInt(props.rating!);
        if (count === 0) {
            rating = <p className="skill-inline-rating"></p>;
        } else if (count === 1) {
            rating = <p className="skill-inline-rating">&#9733;</p>
        } else if (count === 2) {
            rating = <p className="skill-inline-rating">&#9733;&#9733;</p>;
        } else {
            rating = <p className="skill-inline-rating">&#9733;&#9733;&#9733;</p>;
        }
    }

    return (
        <span className="skill-inline-item">
            {image}
            {props.href
                ?  <Link className="skill-inline-text" to={props.href}>{props.name}</Link>
                :  <p className="skill-inline-text">{props.name}</p>
            }
            {rating}
        </span>
    )
}

export function Role(props: React.PropsWithChildren<{ name: string, description: string, img_src: string, href?: string }>) {
    return (
        <Skill
            name={props.name}
            img_src={props.img_src}
            href={props.href}
        >
            {props.description}
            <br/>
            {props.children}
        </Skill>
    )
}
export function Subrole(props: React.PropsWithChildren<{ name: string, duration: string }>) {
    return (
        <div>
            <br/>
            <div className="skill-subrole-title">
                <span className="skill-subrole-main">
                    {props.name}
                </span>
                <span className="skill-subrole-time">
                    {props.duration}
                </span>
            </div>

            <p className="skill-subrole-desc">
                {props.children}
            </p>
        </div>
    )
}

export { Skill, SkillGroup };