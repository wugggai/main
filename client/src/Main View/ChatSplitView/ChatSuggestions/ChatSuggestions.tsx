import React from "react"
import './ChatSuggestions.css'
import { ReactNode } from "react"
import { AI } from "../../../Interfaces"

export interface Prompt {
    content: string
}
 
interface ChatSuggestionsProps {
    chatPrompts: Prompt[]
    textToImagePrompts: Prompt[]
    onClickPrompt: (prompt: string, ai_type: AI | undefined) => void
    model: AI | undefined
}

interface ChatSuggestionsState {}

class ChatSuggestions extends React.Component<ChatSuggestionsProps, ChatSuggestionsState> {
    render(): ReactNode {
        let promptDisplay: JSX.Element[] = []
        promptDisplay.push(<div> <span className="bold">Getting stuck?</span> Try one of the prompts below: </div>)
        if (this.props.chatPrompts.length > 0) {
            promptDisplay.push(<div><span className="bold">Text prompt</span> (for GPT 3.5):</div>)
            this.props.chatPrompts.forEach((prompt, index) => {
                let content = prompt.content
                promptDisplay.push(<button className="suggestion-button" onClick={() => {
                    this.props.onClickPrompt(content, this.props.model || "gpt-3.5-turbo-16k")
                }}> {content} </button>)
            })
        }
        if (this.props.textToImagePrompts.length > 0) {
            promptDisplay.push(<div><span className="bold">Text to Image Prompt</span> (for DALL-E2): </div>)
            this.props.textToImagePrompts.forEach((prompt, index) => {
                let content = prompt.content
                promptDisplay.push(<button className="suggestion-button" onClick={() => {
                    this.props.onClickPrompt(content, this.props.model || "DALL-E2")
                }}> {content} </button>)
            })
        
        return <div className="suggestion-container">{promptDisplay}</div>
        }
    }
}
export default ChatSuggestions;