import { useState } from "react";
import { StandardTemplate } from "../../framework/template";
import { request, useWorker } from "../../framework/proxy";
import { InlineSkill, InlineSkillList, SkillGroup } from "../../framework/skill_list";

import "./text.css"
import { useParams } from "react-router-dom";
import { Markdown } from "../../framework/markdown";

function strip_md_ext(name: string) {
    return name.replace(/.md$/, "")
}

export function Article() {
    var {tag, article} = useParams<{tag: string, article: string}>();

    const [markdown, setMarkdown] = useState("");

    useWorker(
        async () => {
            try {
                const res = await request("/text/" + tag + "/" + article)
                const json = await res.json();
                setMarkdown(json);
            } catch (err: any) {
                console.log(err)
            }
        }
    )

    return (
        <StandardTemplate active='Text' useStreaks={true}>
            <Markdown markdown={markdown} enableHighlights img_base={"/text/static/" + encodeURIComponent(tag!) + "/"}>
                {(headers, mdown) => 
                    <>
                        <div className="text-md">
                            <h1 className="text-md-title">{strip_md_ext(article!)}</h1>
                            {mdown}
                        </div>
                    </>
                }
            </Markdown>
        </StandardTemplate>
    )
}

export default function Text() {
    const [tags, setTags] = useState<{ [name: string]: string[]}>({});

    useWorker(
        async () => {
            try {
                const res = await request("/text/")
                const json = await res.json();
                setTags(json);
            } catch (err: any) {
                console.log(err)
            }
        }
    )

    return (
        <StandardTemplate active='Text' useStreaks={true}>
            <h1>Text</h1>
            <SkillGroup id="Text">
                {Object.keys(tags).sort((a, b) => -tags[a].length + tags[b].length).map(tag => 
                    <InlineSkillList key={tag} title={tag}>
                        {tags[tag].map(article => 
                            <InlineSkill 
                                name={strip_md_ext(article)}
                                key={article} 
                                href={"/text/" + tag + "/" + article}
                                rating="0" />
                        )}
                    </InlineSkillList>
                )}
            </SkillGroup>
        </StandardTemplate>
    )
}