/**
 *  COPYRIGHT © 2022 MANU BHAT
 *  
 *  ALL RIGHTS RESERVED
 * 
 */

import { Skill, SkillGroup } from "../framework/skill_list";


// this is depressing 
export default function Honors() {
    return (
         <SkillGroup id='honors' title='Honors'>
            <Skill
                name='USACO Platinum Division'
                desc='Top 5% in the nation'
                href="http://usaco.org/index.php"
                img_src='/img/usaco_plat.webp'
            />

            <Skill
                name='AP Scholar with Distinction '
                desc='Scored 5 on 5 AP tests'
                img_src="/img/ap_scholar.webp"
            />

            <Skill
                name='picoCTF 2023'
                desc='Top 15% globally. Hoping to improve next year!'
                img_src="/img/picoctf.webp"
                href="https://picoctf.org"
            />

        </SkillGroup>
    )
}