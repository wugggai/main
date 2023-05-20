import React, { Fragment } from 'react'
import { AI, ChatHistory, ChatMetadata, Tag } from '../../../Interfaces';
import './ChatView.css'
import SplitView from 'react-split'
import ChatDialogView from './ChatDialog/ChatDialogView';
import { Loading } from '../../../UI Components/Loading';
import axios from 'axios';
import { API_BASE, TEST_USER_ID } from '../../../Constants';

interface ChatViewProps {
    chatMetadata: ChatMetadata
    isNewInteraction: boolean
    onChatInfoUpdated: () => void
    onDeleteInteraction: () => void
    availableTags: Tag[]
}
 
interface ChatViewState {
    editedTitle?: string
    chatHistory?: ChatHistory
    inputValue: string
    isWaitingForResponse: boolean
    addTagButtonPosition?: { x: number, y: number }
}
 
class ChatView extends React.Component<ChatViewProps, ChatViewState> {
    chatSplitSizes = [70, 30]
    isInitialRender = true
    tagMap: Record<string, Tag> = {}

    constructor(props: ChatViewProps) {
        super(props);
        this.state = {
            inputValue: '',
            isWaitingForResponse: false
        };
        this.createInteraction = this.createInteraction.bind(this);
        if (this.props.isNewInteraction) {
            console.log("Starting new interaction")
        } else { 
            console.log(`Resuming existing interaction`, this.props.chatMetadata.interaction)
        }
        props.availableTags.forEach(tag => this.tagMap[tag.id] = tag)
        this.sendMessage = this.sendMessage.bind(this);
        this.addTag = this.addTag.bind(this);
        this.removeTag = this.removeTag.bind(this);
        this.saveMetadata = this.saveMetadata.bind(this);
        this.loadHistory = this.loadHistory.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<ChatViewProps>, prevState: Readonly<ChatViewState>, snapshot?: any): void {
        if (super.componentDidUpdate) super.componentDidUpdate(prevProps, prevState, snapshot)
        this.props.availableTags.forEach(tag => this.tagMap[tag.id] = tag)
        if (this.props.chatMetadata.interaction.id !== prevProps.chatMetadata.interaction.id) {
            this.loadHistory()
        }
    }

    componentDidMount(): void {
        this.loadHistory()
    }

    loadHistory() {
        if (!this.props.isNewInteraction) {
            axios.get(API_BASE + `/interactions/${this.props.chatMetadata.interaction.id}/messages?from_latest=false`).then(response => {
                this.setState({ chatHistory: { messages: response.data } })
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
            this.createInteraction(true)
        } else {
            this.state.chatHistory?.messages.push({
                message: this.state.inputValue,
                source: 'user',
                id: 'tmp',
                timestamp: new Date().toISOString(),
                offset: this.state.chatHistory.messages.length
            })
            this.setState({ isWaitingForResponse: true })
            axios.post(API_BASE + `/interactions/${this.props.chatMetadata.interaction.id}/messages/`, {
                message: this.state.inputValue,
                model: 'echo',
                model_config: {}
            }).then(response => {
                console.log('received message response', response.data)
                this.state.chatHistory?.messages.push(response.data)
                this.setState({
                    inputValue: '',
                    isWaitingForResponse: false
                })
                this.props.chatMetadata.last_message = response.data
                this.props.onChatInfoUpdated()
                // TODO: scroll to bottom of chat
            })
        }
    }

    createInteraction(withMessage: boolean) {
        axios.post(API_BASE + `/users/${TEST_USER_ID}/interactions/`, {
            title: this.state.editedTitle || this.props.chatMetadata.interaction.title,
            initialMessage: withMessage ? {
                message: this.state.inputValue,
                model_config: {},
                model: 'echo' // TODO: adapt to actual LLM
            } : undefined
        }).then(response => {
            const metadata = response.data as ChatMetadata
            this.props.chatMetadata.interaction.id = metadata.interaction.id
            this.props.chatMetadata.interaction.title = metadata.interaction.title
            let systemResponse = []
            console.log("response from create interaction:", metadata)
            if (metadata.last_message) {
                systemResponse.push({
                    message: metadata.last_message.message,
                    id: metadata.last_message.id,
                    timestamp: metadata.last_message.timestamp,
                    offset: metadata.last_message.offset,
                    source: metadata.last_message.source as ("echo" | AI)
                })
            }
            if (withMessage) {
                this.setState({
                    chatHistory: {messages: [
                        {
                            message: this.state.inputValue,
                            source: 'user',
                            timestamp: new Date().toISOString(),
                            id: response.data.id,
                            interaction_id: this.props.chatMetadata.interaction.id,
                            offset: 0 
                        },
                        ...systemResponse
                    ]},
                    inputValue: ''
                })
            } else if (this.state.chatHistory === undefined) {
                this.setState({ chatHistory: {messages: []} })
            }
            if (this.state.editedTitle)
                this.props.chatMetadata.interaction.title = this.state.editedTitle
            this.props.onChatInfoUpdated()
        })
    }

    addTag(tag: Tag) {
        this.props.chatMetadata.interaction.tag_ids.push(tag.id)
        this.saveMetadata()
    }

    removeTag(index: number) {
        this.props.chatMetadata.interaction.tag_ids.splice(index, 1)
    }

    saveMetadata() {
        if (this.props.chatMetadata.interaction.id) {
            axios.put(API_BASE + `/interactions/${this.props.chatMetadata.interaction.id}`, {
                title: this.props.chatMetadata.interaction.title,
                tag_ids: this.props.chatMetadata.interaction.tag_ids
            }).then(response => {
                console.log("save response", response.data)
            })
        } else {
            this.createInteraction(false)
        }
    }

    render() {
        if (!this.props.isNewInteraction && this.state.chatHistory === undefined) {
            return <Loading />
        }

        const addTagButton: JSX.Element = <div id='add-tag-button' onClick={(e) => {
            e.stopPropagation()
            if (this.state.addTagButtonPosition != undefined) {
                this.setState({ addTagButtonPosition: undefined })
                return
            }
            const button = document.querySelector(".chat-view #add-tag-button") as HTMLDivElement
            console.log(button)
            const rect = button.getBoundingClientRect()
            this.setState({
                addTagButtonPosition: rect
            })
        }}>
            <img src='/assets/label.png' width={20} className='center-content'/>
            <img src='/assets/plus.png' width={10} className='center-content' />
        </div>

        const usedTagList: JSX.Element[] = (this.props.chatMetadata.interaction.tag_ids || []).map((tagId, i) => {
            return <div className='inline-tag-item' key={i}>
                {this.tagMap[tagId].name}
                <img src='/assets/cross.svg' width={8} onClick={() => this.removeTag(i)} />
            </div>
        })

        const dropdownTags: JSX.Element = <div className='dropdown-tags' style={{
            display: this.state.addTagButtonPosition === undefined ? 'none' : 'block',
            left: this.state.addTagButtonPosition?.x,
            top: (this.state.addTagButtonPosition?.y ?? 0) + 28
        }}>
            {this.props.availableTags.map((value, i) => <div key={i} onClick={() => this.addTag(value)}>
                {value.name}
            </div>)}
        </div>

        return <div className='chat-view' onClick={() => this.setState({ addTagButtonPosition: undefined })}>
            <div className='heading'>
                <div className='title'>
                    { this.state.editedTitle !== undefined ?
                        <input type="text"
                            placeholder="Conversation Name"
                            className='textfield'
                            id="conversation-name"
                            value={this.state.editedTitle}
                            onChange={(e) => this.setState({ editedTitle: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    this.props.chatMetadata.interaction.title = this.state.editedTitle!
                                    this.setState({ editedTitle: undefined })
                                    this.saveMetadata()
                                    this.props.onChatInfoUpdated()
                                } else if (e.key == "Escape") {
                                    this.setState({ editedTitle: undefined })
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onBlur={(e) => {
                                this.props.chatMetadata.interaction.title = this.state.editedTitle!
                                this.setState({ editedTitle: undefined })
                                this.saveMetadata()
                                this.props.onChatInfoUpdated()
                            }}/>
                        :
                        <span>{this.props.chatMetadata.interaction.title}</span>
                    }
                    { this.state.editedTitle === undefined ?
                        <img src="/assets/edit.png" width={20} style={{margin: '0 5px'}} onClick={(e) => {
                            e.stopPropagation()
                            this.setState({ editedTitle: this.props.chatMetadata.interaction.title })
                            setTimeout(() => {
                                // This code needs to execute after page refresh
                                const tf = document.querySelector('#conversation-name') as HTMLInputElement
                                tf.select()
                            }, 1)
                        }} /> : undefined
                    }
                    {usedTagList}
                    {addTagButton}
                    {dropdownTags}
                </div>
                <div className='subtitle'>Model: {this.props.chatMetadata.interaction.ai_type}</div>
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