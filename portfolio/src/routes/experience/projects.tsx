/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import Section from "../../framework/section"

// size in {small, medium, large}
function Project(props: {year: string, title: string, desc: string, size: string, href?: string, img: string, top: string, left: string}) {
    return (
        <div className={"project project-" + props.size} style= {{
            top: props.top,
            left: props.left,
        }}>
            <a href={props.href} target="_blank" rel="noopener noreferrer">
                <img alt = {props.title} src={props.img}/>
            </a>
            <span>
                <p className="project-title">{props.title}</p>
                <p className="project-year">{props.year}</p>
            </span>
           
        </div>
    )
}

export default function Projects() {
    return (
        <Section id='projects' name='Significant Projects'>
            {/* Idk if there's a way to do this without hard coding... */}
            {/* unit size is set to 0.2 */}
            <div id="projects-graph">

                <Project
                    year='2019'
                    title="hiddenAI"
                    desc=""
                    size="small"
                    href="https://github.com/enigmurl/hiddenAI"
                    img="/img/hiddenai.webp"
                    top="60%"
                    left={`${50 + Math.sqrt(2) * 20}%`}
                />
                <Project
                    year='2019-20'
                    title="Crater Guardians"
                    desc=""
                    size="small"
                    href="https://play.google.com/store/apps/details?id=com.enigmadux.craterguardians&hl=en_US&gl=US"
                    img="/img/craterguardians.webp"
                    top="0%"
                    left="50%"
                />
                <Project
                    year='2020'
                    title='Titan Descent 2'
                    desc=""
                    size="medium"
                    href="https://play.google.com/store/apps/details?id=com.enigmadux.titandescent2&hl=en_US&gl=US"
                    img="/img/titandescent2.webp"
                    top={`${35 - Math.sqrt(2) * 20}%`}
                    left={`${50 - Math.sqrt(2) * 20}%`}
                />
                <Project
                    year='2022'
                    title='APCS Website Admin Tool'
                    desc=""
                    size="medium"
                    href="https://apcs.tinocs.com"
                    img="/img/happysparky.webp"
                    top="60%"
                    left="50%"
                />
                <Project
                    year='2020-ongoing'
                    title='To be published around Q4 2023 😈😈😈😈😈😈😈'
                    desc="You'll see soon 😈😈😈😈😈😈😈"
                    size="large"
                    img="/img/secret.webp"
                    top="20%"
                    left="50%"
                />
                <Project
                    year='2022-ongoing'
                    title='To be published around 2027 😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈'
                    desc="You'll see soon 😈😈😈😈😈😈😈"
                    size="large"
                    img="/img/secret.webp"
                    top="35%"
                    left="10%"
                />
                <Project
                    year='2022'
                    title='DGAN'
                    desc=""
                    size="small"
                    href='https://github.com/enigmurl/dgan'
                    img="/img/hiddenai.webp"
                    top="75%"
                    left="30%"
                />
            </div>
        </Section>
    )
}