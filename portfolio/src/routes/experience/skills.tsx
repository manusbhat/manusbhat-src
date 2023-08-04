/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import { InlineSkill, InlineSkillList, SkillGroup } from "../../framework/skill_list";

/* SKILLS
 - basic skills I have and what I know
*/

function Skills() {
    return (
        <>
            <SkillGroup id='skills' title="Skills">
                <InlineSkillList title="General CS">
                    <InlineSkill
                        name="Algorithms"
                        img_src="/img/algorithms.webp"
                        rating="3" />

                    <InlineSkill
                        name="Data Structures"
                        img_src="/img/datastructures.webp"
                        rating="3"
                    />
                   
                    <InlineSkill
                        name="Machine Learning"
                        img_src="/img/aiml.webp"
                        rating="3"
                    />

                    <InlineSkill
                        name="Web Development"
                        img_src="/img/webdev.webp"
                        rating="1"
                    />

                    <InlineSkill
                        name="App Development"
                        img_src="/img/appdev.webp"
                        rating="2"
                    />

                    <InlineSkill
                        name="Game Development"
                        img_src="/img/gamedev.webp"
                        rating="2"
                    />

                    <InlineSkill
                        name="Terminal/Zsh/Vim"
                        img_src="/img/terminal.webp"
                        rating="2"
                    />

                    <InlineSkill
                        name="Multi Threading"
                        img_src="/img/multithreading.webp"
                        rating="3"
                    />

                    <InlineSkill
                        name="Memory Management"
                        img_src="/img/memorymanagement.webp"
                        rating="3"
                    />
                    <InlineSkill
                        name="Version Control System"
                        img_src="/img/vcs.webp"
                        rating="3"
                    /> 
                    <InlineSkill
                        name="Server Design"
                        img_src="/img/serverdesign.webp"
                        rating="1"
                    />
                    <InlineSkill
                        name="Cloud Computing"
                        img_src="/img/cloudcomputing.webp"
                        rating="1"
                    />

                </InlineSkillList>

                <InlineSkillList title="Specialized CS">

                    <InlineSkill
                        name="Operating Systems"
                        img_src="/img/os.webp"
                        rating="1"
                    />
                    <InlineSkill
                        name="Compilers"
                        img_src="/img/compilers.webp"
                        rating="1"
                    />                    
                    <InlineSkill
                        name="Networking"
                        img_src="/img/networking.webp"
                        rating="1"
                    />
                    <InlineSkill
                        name="Cryptography"
                        img_src="/img/crypto.webp"
                        rating="1"
                    />
                    <InlineSkill
                        name="Digital Signal Processing"
                        img_src="/img/dsp.webp"
                        rating="1"
                    />
                    <InlineSkill
                        name="Distributed Systems"
                        img_src="/img/distributedsystems.webp"
                        rating="1"
                    />
                    <InlineSkill
                        name="Computer Vision"
                        img_src="/img/computervision.webp"
                        rating="1"
                    />
                    <InlineSkill
                        name="Regular Expressions"
                        img_src="/img/regex.webp"
                        rating="0"
                    />
                    <InlineSkill
                        name="Quantum Computing"
                        img_src="/img/quantum.webp"
                        rating="0"
                    />
                    <InlineSkill
                        name="Virtual/Augmented Reality"
                        img_src="/img/virtualreality.webp"
                        rating="0"
                    />
   
                    <InlineSkill
                        name="Bioinformatics"
                        img_src="/img/bioinformatics.webp"
                        rating="0"
                    />
                
                </InlineSkillList>

                <InlineSkillList title="Coding Languages">
                    <InlineSkill
                        name="C 99"
                        img_src="img/c99.webp"
                        rating="3"
                    />
                    <InlineSkill
                        name="C++ 14"
                        img_src="/img/c++11.webp"
                        rating="3"
                    />
                    <InlineSkill
                        name="Rust 2021"
                        img_src="/img/rust2021.webp"
                        rating="2"
                    />
                    <InlineSkill
                        name="Java 1.8"
                        img_src="/img/java1.8.webp"
                        rating="3"
                    />
                    <InlineSkill
                        name="Swift 5"
                        img_src="/img/swift5.webp"
                        rating="3"
                    />
                    <InlineSkill
                        name="Python 3"
                        img_src="/img/python3.webp"
                        rating="2"
                    />
                    <InlineSkill
                        name="C# 10"
                        img_src="/img/csharp10.webp"
                        rating="1"
                    />
                    <InlineSkill
                        name="Typescript/Javascript ES6"
                        img_src="/img/javascriptes6.webp"
                        rating="1"
                    />
                    {/* <InlineSkill
                        name="Object-oriented Programming"
                        img_src="/img/oop.webp"
                        rating="3"
                    />
                    <InlineSkill
                        name="Procedural Programming"
                        img_src="/img/procedural.webp"
                        rating="3"
                    /> */}
                </InlineSkillList>

                <InlineSkillList title="Digital Art">
                    <InlineSkill
                        name="Mathematical Animation"
                        img_src="/img/manim.webp"
                        rating="3"
                    />
                    {/* <Skill
                        name="Graphic Design"
                        img_src="/img/gimp.webp"
                        rating="1"
                        desc="GIMP (Bitmap)"
                    /> */}
                    <InlineSkill
                        name="Video Editing"
                        img_src="/img/videoediting.webp"
                        rating="2"
                    />
                    <InlineSkill
                        name="3D Modelling / Animation"
                        img_src="/img/blender.webp"
                        rating="1"
                    />
                </InlineSkillList>

                <InlineSkillList title="Other Skills">
                    <InlineSkill
                        name="LaTeX"
                        img_src="/img/latex.webp"
                        rating="2"
                    />
                    <InlineSkill
                        name="Robotics"
                        img_src="/img/robotics.webp"
                        rating="1"
                    />
                    <InlineSkill
                        name="Excel/Spreadsheets"
                        img_src="/img/excel.webp"
                        rating="2"
                    />
                    <InlineSkill
                        name="Computer-Aided Design"
                        img_src="/img/cad.webp"
                        rating="1"
                    />
                    <InlineSkill
                        name="Public Relations"
                        img_src="/img/instagram.webp"
                        rating="1"
                    />
                    <InlineSkill
                        name="Research/Academia"
                        img_src="/img/research.webp"
                        rating="1"
                        />
                </InlineSkillList>

                <InlineSkillList title="Qualities">
                    <InlineSkill
                        name="Fast Learner"
                        img_src="/img/fastlearner.webp"
                        rating="3"
                    />
                    <InlineSkill
                        name="Timely"
                        img_src="/img/timely.webp"
                        rating="3"
                    />
                    <InlineSkill
                        name="Persistent"
                        img_src="/img/persistent.webp"
                        rating="3"
                    />
                    <InlineSkill
                        name="Adaptable"
                        img_src="/img/adaptable.webp"
                        rating="3"
                    />
                    <InlineSkill
                        name="Collaborative"
                        img_src="/img/collaborative.webp"
                        rating="3"
                    />
                </InlineSkillList>

                <InlineSkillList title="Spoken Languages">
                    <InlineSkill
                        name="English"
                        img_src="/img/english.webp"
                        rating="3"
                    />
                    <InlineSkill
                        name="Spanish"
                        img_src="/img/spanish.webp"
                        rating="1"
                    />
                </InlineSkillList>
            </SkillGroup>
        </>
    );
}

export default Skills