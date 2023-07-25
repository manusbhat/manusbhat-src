/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import "../globals.css"
import "./extracurriculars.css"
import { Role, SkillGroup, Subrole } from "../framework/skill_list";

export default function Organizations() {
    return (
        <> 
            <SkillGroup id = 'organizations' title="Organizations">
                {/* TODO */}
                <Role
                    name  = "UCSD ICPC"
                    description="International Collegiate Programming Contest. Our club meets weekly and hosts mock competitions."
                    img_src = "/img/icpc.webp"
                    href="https://icpc.ucsd.edu"
                >
                    <Subrole
                        name = "Club Member"
                        duration = "2023-Present"
                    >
                        Although I joined too late my freshman year to compete, 
                        I am anticipating participating in next year's UCSD roster.
                    </Subrole>
                </Role>

                <Role
                    name  = "Canvas Walk"
                    description="Friend's idea to help museums go digital by using iBeacon proximity devices. I helped him with the technical side of things."
                    img_src = "/img/ibeacon.webp"
                >
                    <Subrole
                        name = "Member"
                        duration = "2022-23"
                        >
                        Designed 3D-printed housing for HM-10 chipset. 
                        Developed iOS prototype app that tracks adjacent iBeacons, allowing user to learn more about nearby artpieces.
                    </Subrole>
                </Role>
                
                <Role
                    name  = "Game Dev Club"
                    description="High school club dedicated to the art of game development. "
                    img_src = "/img/gdc.webp"

                    href  = "https://gamedevclub.tech/"
                >
                    <Subrole
                        name="President"
                        duration="2021-22"
                    >
                        Facilitated officer meetings and increased inclusion of member ideas. 
                        Incorporated concepts like 3D modelling, terrain generation, and pathfinding into curriculum.
                        Over two years, roughly doubled club size.
                        
                    </Subrole>
                    
                    <Subrole
                        name="Secretary"
                        duration="2020-21"
                    >
                        Responsible for animating club promo videos. 
                        Helped organize events (i.e. guest speakers and showcases).
                    </Subrole>
                    
                    <Subrole
                        name="Member"
                        duration="2020"
                    >
                        Participated in club game jams and learned Unity 3D.
                    </Subrole>
                </Role>

                <Role
                    name  = "Melon Jam"
                    description="A game jam hosted by GDC targetted towards novices that averaged ~100 entrants. "
                    img_src = "/img/melonjam.webp"

                    href = "https://gamedevclub.tech/melonjam/"
                >
                    <Subrole
                        name="Judge"
                        duration="2022-Present">
                        Judged submissions for Melon Jam 3, Winter Melon Jam, and Melon Jam 4.
                    </Subrole>

                    <Subrole
                        name="Lead Organizer"
                        duration="2021"
                    >
                        Oversaw team of seven to run international game jam.
                        Directed communications with judges, partners, and participants.
                    </Subrole>

                    <Subrole
                        name="Organizer"
                        duration="2020"
                    >
                        Attained prize sponsors and set up our hosting platforms. 
                        Oversaw operations relating to logistics and promotion. 
                    </Subrole>
                </Role>

                <Role
                    name  = "Tino Comp Programming"
                    description="High school club about programming competitions targeted towards all levels. Probably my favorite club at CHS :)"
                    img_src = "/img/compprog.webp"

                    href  = "https://chscompprog.github.io" 
                >
                    <Subrole
                        name="Advanced Mentor"
                        duration="2021-22"
                    >
                        Taught competition strategy as well relevant algorithms and data structures. 
                        Made it a point to create our own custom problems. 
                        Hosted after-school mini competitions/workshops.
                    </Subrole>

                    <Subrole
                        name="Member"
                        duration="2020-21"
                    >
                        Learned the USACO Gold curriculum (e.g. dp, union find, LCA, fenwick trees, etc).
                    </Subrole>
                </Role>

                <Role
                    name  = "Tinovation"
                    description="High school club that mimics startup environment through a semester-long project with various subteams."
                    img_src = "/img/tinovation.webp"

                    href = "https://tinovationchs.github.io/"
                >

                    <Subrole
                        name="PR & Android Mentor"
                        duration="2021-22"
                    >
                        Taught Android development. 
                        Managed promo material and photographed meetings.
                    </Subrole>

                    <Subrole
                        name="Member"
                        duration="2020-21"
                    >
                        Worked on iOS subdivision for Portable Fridge, a recipe sharing app.
                    </Subrole>
                </Role>

                <Role
                    name  = "Atlas Hacks II"
                    description="An international hackathon with 300+ entrants."
                    img_src = "/img/atlashacks.webp"
                    href="https://nishant-ray.github.io/atlashacks.github.io/"
                >
                    <Subrole
                        name="Logistics Officer"
                        duration="2021"
                        >
                        Responsible for our special events (e.g. guest speaker talks, V.R. workshops, game tournaments, etc).
                        Coordinated judging process and synthesized results to select winners. 
                    </Subrole>
                </Role>

                <Role
                    name  = "FTC Robotics (#11466)"
                    description="High school lower division robotics team. We were all new to robotics, which made for an interesting experience."
                    img_src = "/img/ftc.webp"
                >
                    <Subrole
                        name="Software Lead"
                        duration="2019-20"
                    >
                        Developing algorithms that ran autonomously and responded to driver input. 
                        Collaborated with members to handle non-ideal scenarios and practical environments. 
                    </Subrole>
                </Role>

                <Role
                    name  = "Tino Aviation and Rocketry"
                    description="A high school club that focuses on model rockets, airplanes, drones, and weather balloons"
                    img_src = "/img/tinoarc.webp"
                >
                    <Subrole
                        name="Member"
                        duration="2018-22"
                    >
                        Engineered recovery system of a model rocket that would eventually take flight.
                        Designed and simulated mock trajectories using openRocket CAD.
                    </Subrole>
                </Role>
                <Role
                    name  = "Tech Challenge"
                    description="A competition where teams of six build a device to solve a problem statement."
                    img_src = "/img/techchallenge.webp"
                    href="https://www.thetech.org/core-programs/the-tech-challenge/"
                >
                    <Subrole
                        name="Member"
                        duration="2018-20"
                        >
                        Combined engineering principles, existing industry solutions, and our own ideas to design prototypes.
                        One year we built a hovercraft, the other a catapult and set of expansion devices.
                        Logged schematics to our engineering journal. 
                    </Subrole>
                </Role>
            </SkillGroup>

        </>
    );
}
