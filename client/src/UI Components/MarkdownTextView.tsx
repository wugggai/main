import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import 'katex/dist/katex.min.css'
import { SYNTAX_THEME } from '../Constants';
import './MarkdownTextView.css'

function MarkdownTextView(props: { rawText?: string, disableCodeHighlighter?: boolean, disableCopy?: boolean }) {
    let overrideAction = (ev: ClipboardEvent) => {
        ev.preventDefault()
    }
    
    useEffect(() => {
        if (props.disableCopy) {
            const markdownViews = document.getElementsByClassName("markdown-view")
            for (let i = 0; i < markdownViews.length; i++) {
                let view = markdownViews.item(i) as HTMLDivElement
                view.removeEventListener('copy', overrideAction)
                view.addEventListener('copy', overrideAction)
            }
        }
    })
    
    return <ReactMarkdown children={props.rawText || 'No text to show.'} className="markdown-view" remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} 
    components={props.disableCodeHighlighter ? {} : {
        code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '') || ['language-swift', 'swift']
            return !inline && match ? (
                <SyntaxHighlighter
                    children={String(children).replace(/\n$/, '')}
                    // @ts-ignore
                    style={SYNTAX_THEME}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                />
            ) : (
                <span className='inline-code'>
                    <code className={className} {...props}>
                    {children}
                    </code>
                </span>
            )
        }
    }}
    />;
}
 
export default MarkdownTextView;