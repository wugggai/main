import React, { Fragment } from 'react'
import { ChatHistory, ChatMetadata } from '../../../Interfaces';
import './ChatView.css'
import SplitView from 'react-split'
import ChatDialogView from './ChatDialog/ChatDialogView';
import { Loading } from '../../../UI Components/Loading';
import axios from 'axios';
import { API_BASE } from '../../../Constants';

interface ChatViewProps {
    chatMetadata: ChatMetadata
    isNewInteraction: boolean
    onChatInfoUpdated: () => void
    onDeleteInteraction: () => void
}
 
interface ChatViewState {
    editedTitle?: string
    chatHistory?: ChatHistory
    inputValue: string
    isWaitingForResponse: boolean
}
 
class ChatView extends React.Component<ChatViewProps, ChatViewState> {
    chatSplitSizes = [70, 30]

    constructor(props: ChatViewProps) {
        super(props);
        this.state = {
            inputValue: '',
            isWaitingForResponse: false
        };
        this.sendMessage = this.sendMessage.bind(this);
        this.createInteraction = this.createInteraction.bind(this);
        if (this.props.isNewInteraction) {
            console.log("Starting new interaction")
        } else { 
            console.log(`Resuming existing interaction ${this.props.chatMetadata.id}`)
        }
    }

    componentDidMount(): void {
        if (!this.props.isNewInteraction) {
            axios.get(API_BASE + `/interactions/${this.props.chatMetadata.id}/messages/`).then(response => {
                this.setState({ chatHistory: { messages: response.data } })
                console.log(response.data)
                setTimeout(() => {
                    const input = document.querySelector('#chat-input') as HTMLTextAreaElement | undefined
                    input?.focus()
                }, 5);
            })
        } else {
            setTimeout(() => {
                const input = document.querySelector('#chat-input') as HTMLTextAreaElement
                input.focus()
            }, 1);
        }
    }

    sendMessage() {
        if (this.props.isNewInteraction) {
            this.createInteraction()
        } else {
            this.state.chatHistory?.messages.push({
                content: this.state.inputValue,
                role: 'user',
                id: 'tmp',
                timestamp: Date.now()
            })
            this.setState({ isWaitingForResponse: true })
            axios.post(API_BASE + `/interactions/${this.props.chatMetadata.id}/messages/`, {
                content: this.state.inputValue
            }).then(response => {

                this.state.chatHistory?.messages.push({
                    content: response.data.content,
                    role: response.data.role,
                    id: response.data.id,
                    timestamp: Date.now()
                })
                this.setState({
                    inputValue: '',
                    isWaitingForResponse: false
                })
                // TODO: scroll to bottom of chat
            })
        }
    }

    createInteraction() {
        axios.post(API_BASE + "/interactions/", {
            title: this.state.editedTitle || this.props.chatMetadata.title
        }).then(response => {
            console.log(response.data)
            this.props.chatMetadata.id = response.data.id
            this.setState({
                chatHistory: {messages: [{
                    content: this.state.inputValue,
                    role: 'user',
                    timestamp: Date.now(),
                    id: response.data.id
                }]}
            })
            if (this.props.onChatInfoUpdated) this.props.onChatInfoUpdated()
        })
    }

    render() {
        if (!this.props.isNewInteraction && this.state.chatHistory === undefined) {
            return <Loading />
        }
        return <div className='chat-view'>
            <div className='heading'>
                <div className='title'>
                    { this.state.editedTitle ?
                        <input type="text"
                            placeholder="Conversation Name"
                            className='textfield'
                            id="conversation-name"
                            value={this.state.editedTitle}
                            onChange={(e) => this.setState({ editedTitle: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    this.props.chatMetadata.title = this.state.editedTitle!
                                    this.setState({ editedTitle: undefined })
                                    if (!this.props.isNewInteraction) this.props.onChatInfoUpdated()
                                } else if (e.key == "Escape") {
                                    this.setState({ editedTitle: undefined })
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}/>
                        :
                        <span>{this.props.chatMetadata.title}</span>
                    }
                    { this.state.editedTitle ?
                        <Fragment /> :
                        <img src="/assets/edit.png" width={20} style={{marginLeft: '5px'}} onClick={(e) => {
                            e.stopPropagation()
                            this.setState({ editedTitle: this.props.chatMetadata.title })
                            setTimeout(() => {
                                // This code needs to execute after page refresh
                                const tf = document.querySelector('#conversation-name') as HTMLInputElement
                                tf.select()
                            }, 1)
                        }} />
                    }
                </div>
                <div className='subtitle'>Model: {this.props.chatMetadata.ai_type}</div>
                <img src="/assets/trash.png" className='trash-button' width={20} onClick={this.props.onDeleteInteraction}/>
            </div>
            <hr />
            <div className='dialog-split-container'>
                <SplitView
                    className='vertical-split'
                    direction='vertical'
                    sizes={this.chatSplitSizes}
                    onDrag={newSizes => this.chatSplitSizes = newSizes}
                    minSize={[200, 100]}
                    snapOffset={0}
                    expandToMin
                    gutterSize={10}>
                    <ChatDialogView history={this.state.chatHistory || {messages: []}} />
                    <div className='chat-input-container'>
                        <textarea className='text-area' id='chat-input' placeholder='Write something...' value={this.state.inputValue} onChange={(e) => this.setState({ inputValue: e.target.value })} />
                        <button className='generic-button' id="send-message-button" disabled={this.state.isWaitingForResponse} onClick={this.sendMessage}>
                            <img src="/assets/send.svg" />
                        </button>
                    </div>
                </SplitView>
            </div>
        </div>;
    }
}
 
export default ChatView;