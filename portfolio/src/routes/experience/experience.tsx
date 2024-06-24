/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import {StandardTemplate} from "../../framework/template";

import Honors from "./honors";
import Projects from "./projects";
import Formal from "./formal";

import "../../framework/globals.css"

/* WORK | SIGNIFICANT PROJECTS
 - work empty for now ig, add large projects here
 - TODO: i want to make the work a timeline tree at some point..
 - 
*/
function Experience() {
    return (
        <StandardTemplate active = 'Experience' useStreaks={true}> 
            <Formal/> 
            <Projects/>
            {/* <Organizations/> */}
            {/* <Academics/> */}
            {/* <Skills/> */}
            <Honors/>
        </StandardTemplate>
    );
}

export default Experience;