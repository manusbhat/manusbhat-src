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
import { InlineSkill, InlineSkillList, SkillGroup } from "../../framework/skill_list";


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
                <InlineSkill
                    name="Homomorphic Encryption"
                    rating="3"
                    href="https://en.wikipedia.org/wiki/Homomorphic_encryption"
                />

                <InlineSkill
                    name="Duff's Device"
                    rating="3"
                    href="https://en.wikipedia.org/wiki/Duff%27s_device"
                    />

                <InlineSkill
                    name="Cold Boot Attack" 
                    rating="3"
                    href="https://en.wikipedia.org/wiki/Cold_boot_attack" 
                    />

                <InlineSkill
                    name="Linear Sum Assignment"
                    rating="3"
                    href="http://www.assignmentproblems.com/doc/LSAPIntroduction.pdf" 
                    /> 

                <InlineSkill
                    name="Score Matching"
                    rating="3"
                    href="https://yang-song.net/blog/2021/score/" 
                    /> 
            </InlineSkillList>

            <InlineSkillList title="YouTubers">
                <InlineSkill
                    name="3Blue1Brown"
                    rating="3"
                    href="https://www.youtube.com/@3blue1brown"
                />

                <InlineSkill
                    name="Mugi the Bunny"
                    rating="3"
                    href="https://www.youtube.com/@bunny_mugi_channel"
                />

                <InlineSkill
                    name="Scott Manley"
                    rating="3"
                    href="https://www.youtube.com/@scottmanley"
                />

                <InlineSkill
                    name="Sebastian Lague"
                    rating="3"
                    href="https://www.youtube.com/@SebastianLague"
                />
                
                <InlineSkill
                    name="Asianometry"
                    rating="3"
                    href="https://www.youtube.com/@Asianometry"
                />
                
                <InlineSkill
                    name="neo"
                    rating="3"
                    href="https://www.youtube.com/@neoexplains"
                />

                <InlineSkill
                    name="Stuff Made Here"
                    rating="3"
                    href="https://www.youtube.com/@StuffMadeHere"
                />
            </InlineSkillList>

            <InlineSkillList title="Websites">
                <InlineSkill
                    name="Quanta Magazine"
                    rating="3"
                    href="https://www.quantamagazine.org"
                />
                <InlineSkill
                    name="Hacker News"
                    rating="3"
                    href="https://news.ycombinator.com/news"
                />

                <InlineSkill
                    name="Eliptic Curves"
                    rating="3"
                    href="https://curves.xargs.org"
                    />
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