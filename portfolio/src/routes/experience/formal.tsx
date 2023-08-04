/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import { Role, SkillGroup, Subrole } from "../../framework/skill_list";

import "./formal.css"

export default function Formal() {
    return (
        <SkillGroup id='formal' title="Formal Work">
            <Role
                name="MaXentric Technologies"
                description="MaXentric is a military/DoD contractor that specializes in SBIRs. Paid and on-site."
                img_src="/img/maxentric.webp"
                href="https://maxentric.com"
            >
                <Subrole
                    name="Software Engineer Intern"
                    duration="2023-present"
                    >
                        Applied DSP to automate calibration of radars.
                        Modified C firmware to allow sd card loading of factors.
                        Developed custom UDP-based data transfer script to track packet loss on a V band network.
                </Subrole>
            </Role>

            <Role
                name="UCSD Spatiotemporal Lab"
                description="UCSD STL is a research group focused on spatiotemporal systems and physics-based deep learning. Unpaid and remote."
                img_src="/img/ucsd-stl.webp"
            >
                <Subrole
                    name="Undergraduate Researcher"
                    duration="2022-Present"
                >
                    Working on a model that uses minimal-cost bipartite matching 
                    to predict the distribution of future states of a chaotic system (e.g. fluid flow). 
                    Expecting to finish sometime this summer.
                </Subrole>

            </Role>

            <Role
                name="Breakout Mentors"
                description="Breakout Mentors is a tutoring company. I work under the USA Computing Olympiad division. Paid and remote."
                img_src="/img/breakoutmentors.webp"
                href="https://breakoutmentors.com"
            >
                <Subrole
                    name="USACO Coach"
                    duration="2022-Present"
                >
                    One-on-one tutoring with high school students. 
                    Teaching relatively advanced data structures and algorithms (students vary from bronze to gold).
                    Majority of problems and content are self-written.
                </Subrole>
            </Role>

            <Role
                name="Neuro Leap"
                description="Neuro Leap is a startup that aims to help diagnose children with special needs. Unpaid and remote."
                img_src="/img/neuroleap.webp"
            >
                <Subrole
                    name="Software Engineer Intern"
                    duration="2022-23"
                >
                Used standard DevOps pipeline (vcs, CICD, etc) to make SwiftUI iOS app targeted towards specialists in remote areas. 
                Coordinated with backend team to design REST API.
                </Subrole>
            </Role>
        </SkillGroup>
    )
}
