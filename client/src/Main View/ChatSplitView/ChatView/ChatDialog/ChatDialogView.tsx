import React, { useState } from 'react'
import './ChatDialogView.css'
import { AI, ChatHistory, ChatHistoryItem, ModelAndKey, formatDate, getCurrentDateString } from '../../../../Interfaces';
import MarkdownTextView from '../../../../UI Components/MarkdownTextView';
import { Loading } from '../../../../UI Components/Loading';
import ChatSuggestions from './ChatSuggestions/ChatSuggestions';

interface ChatDialogProps {
    availableModels: ModelAndKey[] | undefined
    history: ChatHistory
    waitingForResponse: boolean
    isNewInteraction: boolean
    isTrash: boolean
    modelAndKey: ModelAndKey
    onClickPrompt: (prompt: string, modelAndKey: ModelAndKey) => void
}
 
interface ChatDialogState {
}

interface AIImageComponentState {
    src: string
}

interface AIImageComponentProps {
    src: string,
    index: number,
}

class AIImageComponent extends React.Component<AIImageComponentProps, AIImageComponentState> {
    constructor(props: AIImageComponentProps) {
        super(props);
        this.state = { src: props.src };
        this.handleError = this.handleError.bind(this);
    }

    handleError() {
        console.log("handling error")
        this.setState({ src: "/assets/expired.png" })
        console.log(this.state)
    }

    render() {
        return <img className='ai-image' key={this.props.index} src={this.state.src} onError={this.handleError} />;
    }
}

class ChatDialogView extends React.Component<ChatDialogProps, ChatDialogState> {
    constructor(props: ChatDialogProps) {
        super(props);
        this.state = { chatPrompts: [], textToImagePrompts: [] };
        this.shouldDisplayExamplePrompts.bind(this)
    }

    shouldDisplayExamplePrompts(): Boolean {
        return this.props.history.messages.length == 0 && !this.props.isTrash
    }

    renderFromHistoryItem(item : ChatHistoryItem, i: number): JSX.Element {
        var iconAssetName = item.source
        // TODO: get the image with an API call once backend store's the user's profile pic
        if (iconAssetName.startsWith("user")) {
            iconAssetName = "user"
        }

        const messageSegments = item.message.map((segment, index) => {
            if (segment.type === "text") {
                return <MarkdownTextView key={index} rawText={segment.content} />;
            } else if (segment.type === "image_url") {
                return <AIImageComponent index={index} src={segment.content}/>
            } else {
                return null;
            }
        });

        return <div className='history-item' style={{ display: 'flex' }} key={i}>
            <img src={`/assets/${iconAssetName}.png`} width={40} className='avatar' />
            <div className='messageContainer'>{messageSegments}</div>
        </div>
    }

    render() {
        let dialogCells: JSX.Element[] = []
        this.props.history.messages.forEach((msg, i) => {
            if (i === 0 || new Date(msg.timestamp).getTime() - new Date(this.props.history.messages[i - 1].timestamp).getTime() >= 600000) {
                dialogCells.push(<div className='history-item' key={`${i} time`}>
                    <div className='date-label'>
                        {formatDate(msg.timestamp)}
                    </div>
                </div>)
            }
            dialogCells.push(this.renderFromHistoryItem(msg, i))
        })

        return <div className='dialog-container'>
            <div id='chat-dialog'>
                {this.props.waitingForResponse && <div className='history-item' style={{ display: 'flex', minHeight: '55px' }} key={-1}>
                    <img src={`/assets/${this.props.modelAndKey.name}.png`} width={40} className='avatar' />
                    <div className='message' style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 20, height: '40px', margin: '0 auto' }}>
                            <Loading size={20} />
                        </div>
                    </div>
                </div>}
                {(!this.shouldDisplayExamplePrompts() || this.props.waitingForResponse)
                    ? dialogCells.reverse()
                    : <ChatSuggestions
                        onClickPrompt={this.props.onClickPrompt}
                        modelAndKey={this.props.modelAndKey}
                        availableModels={this.props.availableModels}
                    />}
            </div>
        </div>;
    }
}
 
export default ChatDialogView;