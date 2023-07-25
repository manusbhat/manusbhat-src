/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import { PropsWithChildren } from "react";
import Section from "../framework/section";

import "../globals.css"
import "./academics.css"


function Academics() {
    return (
        <div id="academics">
            <span className="anchor-translator" id="academics-section"/>

            <Section id='ucsd' name='Transcript [UCSD]'>
                <AcademicSchedule summary="UC San Diego 2022 - 2023">
                    <Term title="'23 Fall">
                        <Course courseName='*courses to be finalized*' grade='?' />
                        <Course courseName='*courses to be finalized*' grade='?' />
                        <Course courseName='*courses to be finalized*' grade='?' />
                        <Course courseName='*courses to be finalized*' grade='?' />
                    </Term>

                    <Term title="'23 Spring">
                        <Course courseName='Computer Organization' courseNum="CSE-30" grade='A+' />
                        <Course courseName='Circuits and Systems' courseNum="ECE-45" grade='A+' />
                        <Course courseName='Rome and Christianity' courseNum="HUM-2" grade='A-' />
                        <Course courseName='Mathematical Reasoning' courseNum="MATH-109" grade='A+' />
                        <Course courseName='Multivariable Calculus'courseNum="MATH-20C" grade='A+' />
                        <Course courseName='Math and Algorithms' courseNum="CSE-21" grade='A+' />
                    </Term>

                    <Term title="'23 Winter">
                        <Course courseName='Data Structures & Algorithms' courseNum="CSE-12" grade='A+' />
                        <Course courseName='Software Tools & Techniques' courseNum="CSE-15L" grade='A+' />
                        <Course courseName='Independent Study (Research)' courseNum="CSE-99" grade='CR' />
                        <Course courseName='Discrete Mathematics' courseNum="CSE-20" grade='A' />
                        <Course courseName='Intro to Analog Design' courseNum="ECE-35" grade='A+' />
                        <Course courseName='Civilizations (Israel/Greece)' courseNum="HUM-1" grade='A' />
                    </Term>

                    <Term title="'22 Fall">
                        <Course courseName='Honors Linear Algebra' courseNum="MATH-31AH" grade='A' />
                        <Course courseName='Accel. Intro to Programming' courseNum="CSE-11" grade='A+' />
                        <Course courseName='Chemical Thinking' courseNum="CHEM-4" grade='A' />
                        <Course courseName='Blacktronica: Afrofuturism' courseNum="MUS-19R" grade='A+' />
                    </Term>
                </AcademicSchedule>
            </Section>

            <Section id='chs' name='Transcript [CHS]'>
                <AcademicSchedule summary="Cupertino High School 2018 - 2022" legend="key: course name | AP score (if applicable) | grade" >
                    <Term title="12th Sem 2">
                        <Course courseName='AP Biology' grade='A' ap='5' />
                        <Course courseName='AP Spanish Language' grade='A+' ap='4' />
                        <Course courseName='AP Statistics' grade='A+' ap='5' />
                        <Course courseName='AP Microeconomics' grade='A+' ap='5' />
                        <Course courseName='Voices of Modern Culture' grade='A-' />
                        <Course courseName='PE Weight Training' grade='A-' />
                        <Course courseName='APCS-A Teacher Assistant' grade='A+' />
                    </Term>

                    <Term title="12th Sem 1">
                        <Course courseName='AP Biology' grade='A+' />
                        <Course courseName='AP Spanish Language' grade='A+' />
                        <Course courseName='AP Statistics' grade='A+' />
                        <Course courseName='AP US Government/Pol ' grade='A' ap='5' />
                        <Course courseName='Voices of Modern Culture' grade='A' />
                        <Course courseName='PE Weight Training' grade='A' />
                        <Course courseName='APCS-A Teacher Assistant' grade='A+' />
                    </Term>

                    <Term title="11th Sem 2">
                        <Course courseName='American Literature/Writing' grade='A-' />
                        <Course courseName='AP Calculus BC' grade='A+' ap='5' />
                        <Course courseName='AP Physics C (E/M)' grade='A+' ap='5' />
                        <Course courseName='AP US History' grade='A+' ap='5' />
                        <Course courseName='Spanish 4 Honors' grade='A' />
                        <Course courseName='APCS-A Teacher Assistant' grade='A+' />
                    </Term>

                    <Term title="11th Sem 1">
                        <Course courseName='American Literature/Writing' grade='A' />
                        <Course courseName='AP Calculus BC' grade='A' />
                        <Course courseName='AP Physics C (Mechanics)' grade='A+' ap='5' />
                        <Course courseName='AP US History' grade='A' />
                        <Course courseName='Spanish 4 Honors' grade='A' />
                        <Course courseName='APCS-A Teacher Assistant' grade='A+' />
                    </Term>

                    <Term title="10th Sem 2">
                        <Course courseName='AP Computer Science A' grade='CR' ap='5' />
                        <Course courseName='Chemistry Honors' grade='CR' />
                        <Course courseName='Pre-Calculus Honors' grade='CR' />
                        <Course courseName='Spanish 3' grade='CR' />
                        <Course courseName='World Studies' grade='CR' />
                        <Course courseName='World Studies (History)' grade='CR' />
                    </Term>

                    <Term title="10th Sem 1">
                        <Course courseName='AP Computer Science A' grade='A+' />
                        <Course courseName='Chemistry Honors' grade='A+' />
                        <Course courseName='Pre-Calculus Honors' grade='A' />
                        <Course courseName='Spanish 3' grade='A' />
                        <Course courseName='World Studies' grade='A+' />
                        <Course courseName='World Studies (History)' grade='A' />
                    </Term>

                    <Term title="9th Sem 2">
                        <Course courseName='Algebra 2/Trigonometry' grade='A' />
                        <Course courseName='Intro to Biology' grade='A+' />
                        <Course courseName='Beginning Drama' grade='A' />
                        <Course courseName='Literature/Writing' grade='A' />
                        <Course courseName='PE 9' grade='A' />
                        <Course courseName='Spanish 2' grade='A' />
                    </Term>

                    <Term title="9th Sem 1">
                        <Course courseName='Algebra 2/Trigonometry' grade='A' />
                        <Course courseName='Intro to Biology' grade='A+' />
                        <Course courseName='Beginning Drama' grade='A-' />
                        <Course courseName='Literature/Writing' grade='A-' />
                        <Course courseName='PE 9' grade='A' />
                        <Course courseName='Spanish 2' grade='A' />
                    </Term>
                </AcademicSchedule>
            </Section>
        </div>
    );
}

function AcademicSchedule(props: PropsWithChildren<{ summary?: string, legend?: string }>) {
    return (
        <div className="academics-content">
            {/* Summary */}
            <p className="academic-summary">{props.summary}</p>
            <p className="academic-summary">{props.legend}</p>
            <div className="academic-schedule">
                {props.children}
            </div>
        </div>
    );
}

//represents one academic sitting
function Term(props: PropsWithChildren<{ title: string }>) {
    return (
        <div className="academic-term">
            <p className="term-header">{props.title}</p>
            <CourseList>
                {props.children}
            </CourseList>
        </div>
    )
}

function CourseList(props: PropsWithChildren) {
    return (
        <span className="academic-course-list window-background">
            {props.children}
        </span>
    )
}

function Course(props: { ap?: string, courseName: string, courseNum?: string, grade: string, summary?: string }) {
    if (props.ap) {
        return (
            <div className="academic-course">
                <p>{props.courseName}</p>
                <span className="academic-course-grade">
                    <p className="academic-ap">{props.ap}</p>
                    <p className='academic-grade-only'>{props.grade}</p>
                </span>
            </div>
        )
    }

    return (
        <div className="academic-course">
            <p>{props.courseName}</p>
            <span className="academic-course-grade">
                <p className='academic-grade-only'>{props.grade}</p>
            </span>
        </div>
    )

}


export default Academics;