import React from "react"
import './ChatSuggestions.css'
import { ReactNode } from "react"
import { AI, ModelAndKey } from "../../../../../Interfaces"
import { SERVER } from '../../../../../Constants';

export interface Prompt {
    content: string
}

interface ChatSuggestionsProps {
    availableModels: ModelAndKey[] | undefined
    modelAndKey: ModelAndKey
    onClickPrompt: (prompt: string, modelAndKey: ModelAndKey) => void
}

interface ChatSuggestionsState {
    chatPrompts: Prompt[]
    textToImagePrompts: Prompt[]
}

class ChatSuggestions extends React.Component<ChatSuggestionsProps, ChatSuggestionsState> {

    constructor(props: ChatSuggestionsProps) {
        super(props);
        this.state = { chatPrompts: [], textToImagePrompts: [] };
        this.getPrompts.bind(this)
        this.getChatPrompts.bind(this)
        this.getTextToImagePrompts.bind(this)

        this.getPrompts(this.props.modelAndKey.name)
    }

    componentWillReceiveProps(nextProps: ChatSuggestionsProps) {
        if (nextProps.modelAndKey.name != this.props.modelAndKey.name || (this.props.availableModels === undefined && nextProps.availableModels !== undefined)) {
            this.getPrompts(nextProps.modelAndKey.name)
        }
    }

    isChatModel(modelName: AI | undefined): boolean {
        return modelName !== undefined && ["gpt-3.5-turbo-16k", "gpt-4", "llama"].includes(modelName)
    }

    isImageModel(modelName: AI | undefined): boolean {
        return modelName !== undefined && ["midjourney-v4", "DALL-E2", "stable-diffusion-v3"].includes(modelName)
    }

    // picks the preferred model and key to use from available
    getPreferredModelAndKey(score: (modelAndKey: ModelAndKey) => number): ModelAndKey | undefined {
        if (this.props.availableModels === undefined) return undefined
        let preferredModelAndKey = undefined, max_score = Number.NEGATIVE_INFINITY
        this.props.availableModels.forEach((modelAndKey, _) => {
            let s = score(modelAndKey)
            if (s > max_score) {
                preferredModelAndKey = modelAndKey
                max_score = s
            }
        })
        return preferredModelAndKey
    }

    getPrompts(modelName: AI | undefined) {
        this.setState({ chatPrompts: [], textToImagePrompts: [] })
        if (modelName === undefined) {
            this.getChatPrompts()
            this.getTextToImagePrompts()
        } else {
            if (this.isChatModel(modelName)) {
                this.getChatPrompts()
            }
            else if (this.isImageModel(modelName)) {
                this.getTextToImagePrompts()
            }
        }
    }

    getChatPrompts() {
        SERVER.get(`/example_prompts?type=chat`).then(res => {
            this.setState({chatPrompts: res.data})
        })
    }

    getTextToImagePrompts() {
        SERVER.get(`/example_prompts?type=text_to_image`).then(res => {
            this.setState({textToImagePrompts: res.data})
        })
    }

    render(): ReactNode {
        let promptDisplay: JSX.Element[] = []
        let noModelAvailable: boolean = this.props.availableModels === undefined || this.props.availableModels.length == 0
        if (noModelAvailable) {
            promptDisplay.push(<div className="error-display"> You've reached the trial limit. Please configure API Keys in Settings tab to continue enjoying your conversations. </div>)
        }
        promptDisplay.push(<div className={noModelAvailable ? "grayed-out-text" : ""}>
            <span className={noModelAvailable ? "grayed-out-bold" : "bold"}>Getting stuck?</span>
            Try one of the prompts below:
        </div>)
        if (this.state.chatPrompts.length > 0) {
            // Always prefer trial credit over user API key; prefer GPT4 over GPT3.5
            let preferredChatModel = this.getPreferredModelAndKey((mk) => {
                if (!this.isChatModel(mk.name)) return Number.NEGATIVE_INFINITY
                let s = 0
                if (mk.via_system_key) s += 5
                if (mk.name == "gpt-4") s += 3
                return s
            })
            // If no models are available, disable buttons and gray out the section
            let noChatModelAvailable = !preferredChatModel
            promptDisplay.push(<div className={noChatModelAvailable ? "grayed-out-text" : ""}>
                <span className={noChatModelAvailable ? "grayed-out-bold" : "bold"}>Text prompt</span>
                ({this.props.modelAndKey.name || preferredChatModel?.name || "No API key available for chat models"}):
            </div>)
            this.state.chatPrompts.forEach((prompt, index) => {
                let content = prompt.content
                promptDisplay.push(<button className="suggestion-button" disabled={noChatModelAvailable} onClick={() => {
                    this.props.onClickPrompt(content, this.props.modelAndKey.name ? this.props.modelAndKey! : preferredChatModel!)
                }}> {content} </button>)
            })
        }
        if (this.state.textToImagePrompts.length > 0) {
            // Always prefer trial credit over user API key
            let preferredImageModel = this.getPreferredModelAndKey((mk) => {
                if (!this.isImageModel(mk.name)) return Number.NEGATIVE_INFINITY
                if (mk.via_system_key) return 5
                return 0
            })
            // If no models are available, disable buttons and gray out the section
            let noImageModelAvailable = !preferredImageModel
            promptDisplay.push(<div className={noImageModelAvailable ? "grayed-out-text" : ""}>
                <span className={noImageModelAvailable ? "grayed-out-bold" : "bold"}>Text to Image Prompt</span>
                ({this.props.modelAndKey.name || preferredImageModel?.name || "No API key available for image models"}):
            </div>)
            this.state.textToImagePrompts.forEach((prompt, index) => {
                let content = prompt.content
                promptDisplay.push(<button className="suggestion-button" disabled={noImageModelAvailable} onClick={() => {
                    this.props.onClickPrompt(content, this.props.modelAndKey.name ? this.props.modelAndKey! : preferredImageModel!)
                }}> {content} </button>)
            })
        }
        return <div className="suggestion-container">{promptDisplay}</div>
    }
}
export default ChatSuggestions;