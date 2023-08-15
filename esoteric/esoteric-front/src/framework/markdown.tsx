import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import 'katex/dist/katex.min.css'

export function Markdown(props: { markdown: string, children: (headers: any, mdown: React.ReactNode) => React.ReactNode }) {
    var lines = props.markdown.split("\n");
    var content: string = props.markdown;
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

    const markdown =
        <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
        >
            {content}
        </ReactMarkdown>;


    return props.children(headers, markdown);
};
