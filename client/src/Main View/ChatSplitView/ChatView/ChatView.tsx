import React, { Fragment } from 'react'
import { AI, ChatHistory, ChatMetadata, MessageSegment, Tag } from '../../../Interfaces';
import './ChatView.css'
import SplitView from 'react-split'
import ChatDialogView from './ChatDialog/ChatDialogView';
import { Loading } from '../../../UI Components/Loading';
import axios from 'axios';
import { API_BASE, SERVER, getUserId } from '../../../Constants';
import Dropdown from 'rc-dropdown'
import 'rc-dropdown/assets/index.css';
import Cookies from 'react-cookies'
import { TwitterPicker } from 'react-color';

interface ChatViewProps {
    chatMetadata: ChatMetadata
    isNewInteraction: boolean
    onChatInfoUpdated: () => void
    onDeleteInteraction: () => void
    availableTags: Tag[]
    isTrash: boolean
}
 
interface ChatViewState {
    editedTitle?: string
    chatHistory?: ChatHistory
    availableModels?: string[]
    inputValue: string
    isWaitingForResponse: boolean
    addTagButtonPosition?: { x: number, y: number }
    newTagName?: string // Undefined means this menu is not showing
    newTagColor: string
    isAddingTag: boolean
    isUpdatingModel: boolean
}
 
class ChatView extends React.Component<ChatViewProps, ChatViewState> {
    chatSplitSizes = [70, 30]
    isInitialRender = true
    tagMap: Record<string, Tag> = {} // Maps tag ids to Tag objects

    constructor(props: ChatViewProps) {
        super(props);
        this.state = {
            inputValue: '',
            isWaitingForResponse: false,
            isUpdatingModel: false,
            isAddingTag: false,
            newTagColor: '#ffffff'
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
        this.recalculateInputHeight = this.recalculateInputHeight.bind(this);
        this.addNewTag = this.addNewTag.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<ChatViewProps>, prevState: Readonly<ChatViewState>, snapshot?: any): void {
        if (super.componentDidUpdate) super.componentDidUpdate(prevProps, prevState, snapshot)
        this.props.availableTags.forEach(tag => this.tagMap[tag.id] = tag)
        if (this.props.chatMetadata.interaction.id !== prevProps.chatMetadata.interaction.id) {
            this.loadHistory()
            this.setState({ inputValue: '' })
            if (!this.props.isTrash) {
                const chatInput = document.querySelector("#chat-input") as HTMLDivElement
                if (chatInput) {
                    chatInput.style.height = "50px"
                }
                const dialogView = document.querySelector("#chat-dialog") as HTMLDivElement
                if (dialogView) {
                    dialogView.style.paddingBottom = "85px"
                }
            }
        }
    }

    componentDidMount(): void {
        this.loadHistory()

        const userId = Cookies.load('user_id')
        SERVER.get(`/users/${userId}/models/list`).then(response => {
            this.setState({ availableModels: response.data.model_names })
        })
    }

    loadHistory() {
        if (!this.props.isNewInteraction) {
            SERVER.get(`/interactions/${this.props.chatMetadata.interaction.id}/messages?limit=1000&from_latest=false`).then(response => {
                this.setState({ chatHistory: { messages: response.data } })
                setTimeout(() => {
                    const input = document.querySelector('#chat-input') as HTMLTextAreaElement | undefined
                    input?.focus()
                }, 5);
            })
        } else {
            this.setState({ chatHistory: { messages: []} })
            setTimeout(() => {
                const input = document.querySelector('#chat-input') as HTMLTextAreaElement
                input.focus()
            }, 1);
        }
    }

    sendMessage() {
        if (this.props.isNewInteraction) {
            this.createInteraction(true)
        } else if (this.state.inputValue) {
            const messageSegment: MessageSegment = {
                type: "text",
                content: this.state.inputValue,
            }
            if (this.state.chatHistory) {
                this.state.chatHistory.messages.push({
                    message: [messageSegment],
                    source: 'user',
                    id: 'tmp',
                    timestamp: new Date().toISOString(),
                    offset: this.state.chatHistory.messages.length
                })
            } else {
                this.setState({
                    chatHistory: {
                        messages: [{
                            message: [messageSegment],
                            source: 'user',
                            id: 'tmp',
                            timestamp: new Date().toISOString(),
                            offset: 0
                        }]
                    }
                })
            }
            const userInput = this.state.inputValue
            this.setState({ inputValue: '', isWaitingForResponse: true })
            const requestMessageSegment: MessageSegment = {
                type: "text",
                content: this.state.inputValue,
            }
            SERVER.post(`/interactions/${this.props.chatMetadata.interaction.id}/messages`, {
                message: [requestMessageSegment],
                model: this.props.chatMetadata.interaction.ai_type,
                model_config: {}
            },
            { headers: { "Authorization": `Bearer ${Cookies.load('access_token')}` } }
            ).then(response => {
                console.log('received message response', response.data)
                this.state.chatHistory?.messages.push(response.data)
                this.setState({
                    isWaitingForResponse: false
                }, () => {
                    const chatDialog = document.querySelector("#chat-dialog") as HTMLDivElement
                    chatDialog.scrollTop = chatDialog.scrollHeight
                })
                this.props.chatMetadata.last_message = response.data
                this.props.onChatInfoUpdated()
            })
        }
    }

    createInteraction(withMessage: boolean) {
        const userId = getUserId()
        if (userId === undefined) {
            alert("Not logged in")
            return
        }
        const messageSegment: MessageSegment = {
            type: "text",
            content: this.state.inputValue,
        }
        SERVER.post(`/users/${userId}/interactions`, {
            title: this.state.editedTitle || this.props.chatMetadata.interaction.title,
            initial_message: withMessage ? {
                message: [messageSegment],
                model_config: {},
                model: this.props.chatMetadata.interaction.ai_type
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
                const messageSegment: MessageSegment = {
                    type: "text",
                    content: this.state.inputValue,
                }
                this.setState({
                    chatHistory: {messages: [
                        {
                            message: [messageSegment],
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
            if (this.state.editedTitle) {
                this.props.chatMetadata.interaction.title = this.state.editedTitle
                this.props.chatMetadata.last_message = metadata.last_message
            }
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
            SERVER.put(`/interactions/${this.props.chatMetadata.interaction.id}`, {
                title: this.props.chatMetadata.interaction.title,
                tag_ids: this.props.chatMetadata.interaction.tag_ids
            }).then(response => {
                console.log("save response", response.data)
            })
        } else {
            this.createInteraction(false)
        }
    }

    setModel(name: string) {
        this.props.chatMetadata.interaction.ai_type = name as AI
        if (!this.props.isNewInteraction) {
            this.setState({ isUpdatingModel: true })
            setTimeout(() => this.setState({ isUpdatingModel: false }), 1000)
        }
    }

    recalculateInputHeight() {
        let box = document.querySelector("#chat-input") as HTMLTextAreaElement
        box.style.height = '1px'
        const newHeight = Math.max(this.props.isTrash ? 0 : 50, box.scrollHeight)
        box.style.height = Math.min(500, newHeight) + "px"
        box.style.overflow = newHeight < 500 ? 'hidden' : 'scroll'
        const dialogView = document.querySelector("#chat-dialog") as HTMLDivElement
        dialogView.style.paddingBottom = Math.min(500, newHeight) + 35 + "px"
    }

    addNewTag() {
        if (this.props.availableTags.findIndex(v => v.name === this.state.newTagName) !== -1) {
            alert(`Tag with name ${this.state.newTagName} is already defined.`)
            return
        }

        this.setState({ isAddingTag: true })
        const userId = getUserId()
        SERVER.post(`/users/${userId}/tags`, {
            name: this.state.newTagName,
            color: this.state.newTagColor!
        }).then(response => {
            let newTag = response.data as Tag
            this.tagMap[newTag.id] = newTag
            this.props.availableTags.push(newTag)
            this.addTag(newTag)
            this.setState({
                newTagName: undefined,
                newTagColor: '#ffffff',
                addTagButtonPosition: undefined
            })
        })
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
            const rect = button.getBoundingClientRect()
            this.setState({
                addTagButtonPosition: rect
            })
        }}>
            <img src='/assets/label.png' width={20} className='center-content'/>
            <img src='/assets/plus.png' width={10} className='center-content' />
        </div>

        const usedTagList: JSX.Element[] = (this.props.chatMetadata.interaction.tag_ids || []).map((tagId, i) => {
            if (this.tagMap[tagId] === undefined) {
                console.log("WARNING:", tagId)
            }
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
            {
            this.state.newTagName === undefined ? 
                [this.props.availableTags.map((value, i) => {
                    return this.props.chatMetadata.interaction.tag_ids.indexOf(value.id) === -1 ? <div key={i} onClick={() => this.addTag(value)} className='tag-item'>
                        {value.name}
                    </div> : <Fragment />
                }),
                <div key={-1} className='tag-item' onClick={(e) => {
                    this.setState({ newTagName: '' })
                    e.stopPropagation()
            }}>Add New Tag...</div>]
            :
            <div className='add-new-tag' onClick={e => e.stopPropagation()}>
                <input type="text" placeholder='New Tag Name' className='textfield new-tag-textfield' value={this.state.newTagName} onChange={(e) => this.setState({ newTagName: e.target.value })} />
                <TwitterPicker triangle='hide' className='tag-color-picker' color={this.state.newTagColor || 'fff'} onChange={(c) => this.setState({ newTagColor: c.hex })} styles={{default: {
                    body: {
                        padding: '8px',
                        paddingLeft: '12px'
                    },
                }}}/>
                <button className='generic-button' disabled={!this.state.newTagName || this.state.isAddingTag} onClick={this.addNewTag}>{this.state.isAddingTag ? "Adding Tag..." : "Add Tag"}</button>
            </div>
            }
        </div>

        const chooseModelMenu = <div className='dropdown-models'>
            {(this.state.availableModels ?? []).map( (modelName) => {
                return <div key={modelName}>
                    {modelName}
                </div>
            })}
        </div>

        return <div className='chat-view' onClick={() => this.setState({ addTagButtonPosition: undefined, newTagName: undefined })}>
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
                {<div className='subtitle'>
                    <span>Model:</span>
                    <Dropdown trigger={['click']} overlay={chooseModelMenu} animation="slide-up" onOverlayClick={(e) => this.setModel((e.target as HTMLDivElement).innerText)} >
                        <button className='select-model-button'>
                            {this.props.chatMetadata.interaction.ai_type || this.props.chatMetadata.last_message?.source || "Choose Model"}
                            <img src="/assets/down.svg" width="12" style={{marginLeft: '5px'}}/>
                        </button>
                    </Dropdown>
                    {this.state.isUpdatingModel && <div style={{width: 28, height: 15, display: 'inline-block', verticalAlign: 'middle', position: 'relative'}}>
                        <Loading size={15} />
                    </div>}
                </div>}
                <img src="/assets/trash.png" className='trash-button' width={20} onClick={this.props.onDeleteInteraction}/>
            </div>
            <hr />
            <ChatDialogView history={this.state.chatHistory || {messages: []}} waitingForResponse={this.state.isWaitingForResponse} isTrash={this.props.isTrash} />
            {!this.props.isTrash && <div className='chat-input-container'>
                <textarea className='text-area' id='chat-input' placeholder='Write something...' value={this.state.inputValue} onChange={(e) => this.setState({ inputValue: e.target.value })} 
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        this.sendMessage()
                    }
                }}
                onKeyUp={this.recalculateInputHeight} />
                <button className='generic-button' id="send-message-button" disabled={this.state.isWaitingForResponse} onClick={this.sendMessage}>
                    <img src="/assets/send.svg" width={20} className='center-content' />
                </button>
                <div className='input-prompt'>Press Shift + Enter to start new line.</div>
            </div>}
        </div>;
    }
}
 
export default ChatView;