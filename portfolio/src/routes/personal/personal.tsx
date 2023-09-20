/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import React from "react";
import {StandardTemplate} from "../../framework/template";

import "./personal.css"
import Section from "../../framework/section";
import { InlineSkillList, SkillGroup } from "../../framework/skill_list";


function Raindrop(props: {desc?: string, img: string}) {
    const width = Math.random() * 100 + 50
    const duration = Math.random() * 20 + 35 
    return (
        <img 
            style={{
                bottom: `${100 + 100 * Math.random()}%`,
                left: `calc(${Math.random()} * (100% - ${width}px - 8px) + 4px)`,
                width: `${width}px`,
                animationDuration: `${duration}s`,
                animationDelay: `${-Math.random() * duration}s`,
            }}
            alt={props.img}
            className="raindrop" 
            src={"/waterfall/" + props.img}/>
    )
}

function Rainfall() {

    var items: React.ReactNode[] = [
        <Raindrop img="basel_problem.webp" />,
        <Raindrop img="plant.webp" />,
        <Raindrop img="soldering.webp" />,
        <Raindrop img="stuart.webp" />,
        <Raindrop img="rocket.webp" />,
        <Raindrop img="joshua_tree.webp" />,
        <Raindrop img="niagara.webp" />,
        <Raindrop img="flower.webp" />,
        <Raindrop img="apcs_website.webp" />,
        <Raindrop img="cranes.webp" />,
        <Raindrop img="south_fortuna.webp" />
    ]

    return (
        <Section id="rainfall" name="Rainfall [WIP]">
            <div id="rainfall-list">
                {
                    /* shuffle */
                    items
                        .map(item => ({ item: item, sort: Math.random() }))
                        .sort((a, b) => a.sort - b.sort)
                        .map(item => item.item)
                }
            </div>
        </Section>
    )
}

function Stars() {
    return (
        <SkillGroup id="stars" title="Stars">
            <InlineSkillList title="Ideas">
            </InlineSkillList>
        </SkillGroup>
    )
}

export default function Personal() {
    return (
        <StandardTemplate active = 'Personal' useStreaks={true}> 
           <Rainfall/>
           <Stars/>
        </StandardTemplate>
    )
}