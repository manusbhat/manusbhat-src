import ReactMarkdown, { Components } from "react-markdown";
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import SyntaxHighlighter from 'react-syntax-highlighter'

import 'katex/dist/katex.min.css'
import { darcula, github, githubGist, xcode } from "react-syntax-highlighter/dist/esm/styles/hljs";

function parse_headers(markdown: string) {
    var lines = markdown.split("\n");
    var content: string = markdown;
    var headers: any = {};

    for (var i = 0; i < lines.length; i++) {
        const line = lines[i];
        var ok = false;
        if (line.startsWith("[") && line.endsWith("]")) {
            const tokens = line.slice(1, -1).split(":", 2).map(x => x.trim());
            if (tokens.length === 2) {
                headers[tokens[0]] = tokens[1];
                ok = true;
            }
        }

        if (!ok) {
            content = lines.slice(i).join("\n");
            break;
        }
    }

    return {content, headers}
}

function Code(props: {children: string[] | string} ) {

    return (
        <SyntaxHighlighter style={githubGist}>
            {props.children}
        </SyntaxHighlighter>
    )
}

export function Markdown(props: { 
    markdown: string, 
    img_base?: string, 
    enableHighlights?: boolean,
    children: (headers: any, mdown: React.ReactNode) => React.ReactNode 
}) {
    var {content, headers} = parse_headers(props.markdown);

    const components: Components  = {
        code: (props: {inline: boolean, children: string | string[]} & any) => {
            if (props.inline) {
                return <code>{props.children}</code>
            }

            return (
                <Code>
                    {props.children}
                </Code>
            );
        },
    };

    const markdown =
        <ReactMarkdown
            remarkPlugins={[remarkMath]} 
            rehypePlugins={[rehypeKatex]}

            components={props.enableHighlights ? components : undefined}

            transformImageUri={(uri) => {
                if (uri.startsWith("http")) {
                    return uri;
                }

                if (props.img_base) {
                    return process.env.REACT_APP_API_URL + props.img_base + uri;
                }

                return uri;
            }}
        >
            {content}
        </ReactMarkdown>;


    return props.children(headers, markdown);
};
