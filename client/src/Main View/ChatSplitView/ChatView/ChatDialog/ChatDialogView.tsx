import React from 'react'
import './ChatDialogView.css'
import { ChatHistory, formatDate } from '../../../../Interfaces';
import MarkdownTextView from '../../../../UI Components/MarkdownTextView';
import { Loading } from '../../../../UI Components/Loading';
import { SERVER } from '../../../../Constants';

interface ChatDialogProps {
    history: ChatHistory
    waitingForResponse: boolean
    isTrash: boolean
    model: string | undefined
    onClickPrompt: (prompt: string) => void
}
 
interface ChatDialogState {
    chatPrompts: Prompt[]
    textToImagePrompts: Prompt[]
}

interface Prompt {
    prompt: string
}
 
class ChatDialogView extends React.Component<ChatDialogProps, ChatDialogState> {
    constructor(props: ChatDialogProps) {
        super(props);
        this.state = { chatPrompts: [], textToImagePrompts: [] };
        this.getChatPrompts.bind(this)
        this.getTextToImagePrompts.bind(this)

        if (this.props.history.messages.length == 0) {
            if (this.props.model === undefined) {
                // TODO: add assistence text between prompts
                this.getChatPrompts()
                this.getTextToImagePrompts()
            } else {
                // TODO: handle text/image difference gracefully
                if (["midjourney-v4", "DALL-E2", "trial_DALL-E2", "stable-diffusion-v3"].includes(this.props.model)) {
                    this.getTextToImagePrompts()
                } else {
                    this.getChatPrompts()
                }
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

    render() {
        let dialogCells: JSX.Element[] = [] // Dummy item needed for content to align to bottom
        // <div key={-1} />
        let promptDisplay: JSX.Element[] = []
        if (this.props.history.messages.length == 0) {
            promptDisplay.push(<div> Getting stuck? Try one of the prompts below: </div>)
            if (this.state.chatPrompts) {
                promptDisplay.push(<div> Chat Prompt for GPT-3.5: </div>)
                this.state.chatPrompts.forEach((prompt, index) => {
                    let content = prompt.prompt
                    promptDisplay.push(<button onClick={() => this.props.onClickPrompt(content)}> {content} </button>)
                })
            }
            if (this.state.textToImagePrompts) {
                promptDisplay.push(<div> Text to Image Prompt for Midjourney-v4: </div>)
                this.state.textToImagePrompts.forEach((prompt, index) => {
                    let content = prompt.prompt
                    promptDisplay.push(<button onClick={() => this.props.onClickPrompt(content)}> {content} </button>)
                })
            }
        } else {
            this.props.history.messages.forEach((msg, i) => {
                if (i === 0 || new Date(msg.timestamp).getTime() - new Date(this.props.history.messages[i - 1].timestamp).getTime() >= 600000) {
                    dialogCells.push(<div className='history-item' key={`${i} time`}>
                        <div className='date-label'>
                            {formatDate(msg.timestamp)}
                        </div>
                    </div>)
                }
                // TODO: get the image with an API call once backend store's the user's profile pic
                var iconAssetName = msg.source
                if (iconAssetName.startsWith("user")) {
                    iconAssetName = "user"
                }

                const messageSegments = msg.message.map((segment, index) => {
                    if (segment.type === "text") {
                        return <MarkdownTextView key={index} rawText={segment.content} />;
                    } else if (segment.type === "image_url") {
                        return <img className='ai-image' key={index} src={segment.content}/>;
                    } else {
                        return null;
                    }
                });

                dialogCells.push(<div className='history-item' style={{ display: 'flex' }} key={i}>
                    <img src={`/assets/${iconAssetName}.png`} width={40} className='avatar' />
                    <div className='messageContainer'>{messageSegments}</div>
                </div>)
            })
        }

        return <div className='dialog-container'>
            <div id='chat-dialog'>
                {this.props.waitingForResponse && <div className='history-item' style={{ display: 'flex', minHeight: '70px' }} key={-1}>
                    <img src={`/assets/gpt-3.5-turbo.png`} width={40} className='avatar' />
                    <div className='message'>
                        <div style={{width: 20, height: '40px', position: 'relative'}}><Loading size={20}/></div>
                    </div>
                </div>}
                {this.props.history.messages ? dialogCells.reverse() : promptDisplay}
            </div>
        </div>;
    }
}
 
export default ChatDialogView;