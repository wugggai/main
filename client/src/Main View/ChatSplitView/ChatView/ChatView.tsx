import React, { Fragment } from 'react'
import { AI, ChatHistory, ChatHistoryItem, ChatMetadata, MessageSegment, Tag, getCurrentDateString, localToGlobal } from '../../../Interfaces';
import './ChatView.css'
import ChatDialogView from './ChatDialog/ChatDialogView';
import { Loading } from '../../../UI Components/Loading';
import { SERVER, SUPPORTED_MODELS, getUserId } from '../../../Constants';
import Dropdown from 'rc-dropdown'
import 'rc-dropdown/assets/index.css';
import Cookies from 'react-cookies'
import { TwitterPicker } from 'react-color';
import { useNotification } from '../../../Components/Notification/NotificationContext';
import { NotificationProps } from '../../../Components/Notification/Notification';
import ChatChooseModelMenu from './ChatChooseModelMenu/ChatChooseModelMenu';

interface ChatViewProps {
    chatMetadata: ChatMetadata
    isNewInteraction: boolean
    onChatInfoUpdated: () => void
    onDeleteInteraction: () => void
    addNewTag: (tag: Tag) => void
    availableTags: Tag[]
    isTrash: boolean
}

type ChatViewClassImplProps = ChatViewProps & { showNotification: ((_: NotificationProps) => void) }

interface ChatViewState {
    editedTitle?: string
    chatHistory?: ChatHistory
    availableModels?: [{ name: string, via_system_key: boolean }]
    promptValue: string
    inputValue: string
    isWaitingForResponse: boolean
    addTagButtonPosition?: { x: number, y: number }
    newTagName?: string // Undefined means this menu is not showing
    newTagColor: string
    isAddingTag: boolean
    isUpdatingModel: boolean
}

class ChatViewClassImpl extends React.Component<ChatViewClassImplProps, ChatViewState> {
    chatSplitSizes = [70, 30]
    isInitialRender = true
    tagMap: Record<string, Tag> = {} // Maps tag ids to Tag objects

    constructor(props: ChatViewClassImplProps) {
        super(props);
        this.state = {
            promptValue: '',
            inputValue: '',
            isWaitingForResponse: false,
            isUpdatingModel: true,
            isAddingTag: false,
            newTagColor: '#ffffff'
        };
        this.createInteraction = this.createInteraction.bind(this);
        props.availableTags.forEach(tag => this.tagMap[tag.id] = tag)
        this.sendMessage = this.sendMessage.bind(this);
        this.addTag = this.addTag.bind(this);
        this.removeTag = this.removeTag.bind(this);
        this.saveMetadata = this.saveMetadata.bind(this);
        this.loadHistory = this.loadHistory.bind(this);
        this.autoGrowTextArea = this.autoGrowTextArea.bind(this);
        this.addNewTag = this.addNewTag.bind(this);
        this.getModelDisplayName = this.getModelDisplayName.bind(this)
        this.handlePromptClick = this.handlePromptClick.bind(this)
        this.setModel = this.setModel.bind(this)
        this.cannotSendMessage = this.cannotSendMessage.bind(this)
    }

    componentDidUpdate(prevProps: Readonly<ChatViewClassImplProps>, prevState: Readonly<ChatViewState>, snapshot?: any): void {
        if (super.componentDidUpdate) super.componentDidUpdate(prevProps, prevState, snapshot)
        this.props.availableTags.forEach(tag => this.tagMap[tag.id] = tag)
        if (this.props.chatMetadata.interaction.id !== prevProps.chatMetadata.interaction.id) {
            this.setState({ chatHistory: undefined })
            this.loadHistory()
            this.setState({ inputValue: '', isWaitingForResponse: false })
        }
    }

    componentDidMount(): void {
        this.loadHistory()

        const userId = Cookies.load('user_id')
        SERVER.get(`/users/${userId}/models/list`).then(response => {
            this.setState({
                availableModels: response.data.model_names,
                isUpdatingModel: false
            })
        })
    }

    autoGrowTextArea(event: React.FormEvent<HTMLTextAreaElement>) {
        const maxHeight = 5 * 24;
        const area = event.currentTarget;
        area.style.height = "24px";
        area.style.height = (area.scrollHeight) + "px";

        if (area.scrollHeight > maxHeight) {
            area.style.overflowY = "auto";
            area.style.height = maxHeight + "px";
        } else {
            area.style.overflowY = "hidden";
        }
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
            this.setState({ chatHistory: { messages: [] } })
            setTimeout(() => {
                const input = document.querySelector('#chat-input') as HTMLTextAreaElement
                input?.focus()
            }, 1);
        }
    }

    sendMessage() {
        const chatId = this.props.chatMetadata.interaction.id
        this.setState({ isWaitingForResponse: true })
        if (this.props.isNewInteraction) {
            this.createInteraction(true)
        } else if (this.state.inputValue) {
            const messageSegment: MessageSegment = {
                type: "text",
                content: this.state.inputValue,
            }
            if (!this.state.chatHistory) {
                this.setState({ chatHistory: { messages: [] } })
            }
            let new_message: ChatHistoryItem = {
                message: [messageSegment],
                source: 'user',
                id: 'tmp',
                timestamp: getCurrentDateString(),
                offset: this.state.chatHistory!.messages.length
            }

            this.state.chatHistory!.messages.push(new_message)
            this.props.chatMetadata.last_message = new_message
            this.props.onChatInfoUpdated()
            this.setState({ inputValue: '' })
            const requestMessageSegment: MessageSegment = {
                type: "text",
                content: this.state.inputValue,
            }
            SERVER.post(`/interactions/${this.props.chatMetadata.interaction.id}/messages`, {
                message: [requestMessageSegment],
                model: this.props.chatMetadata.interaction.ai_type,
                using_system_key: this.props.chatMetadata.interaction.using_system_key,
                model_config: {}
            }).then(response => {
                if (this.props.chatMetadata.interaction.id !== chatId) { return }
                this.state.chatHistory?.messages.push(response.data)
                this.setState({
                    isWaitingForResponse: false
                }, () => {
                    const chatDialog = document.querySelector("#chat-dialog") as HTMLDivElement
                    chatDialog.scrollTop = chatDialog.scrollHeight
                })
                this.props.chatMetadata.last_message = response.data
                this.props.onChatInfoUpdated()
            }).catch((error) => {
                this.props.showNotification({ title: "Something unexpected happened!", message: error.response.data.detail })
            }).finally(() => this.setState({ isWaitingForResponse: false }))
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
            content: this.state.promptValue || this.state.inputValue,
        }
        if (withMessage) {
            let new_message: ChatHistoryItem = {
                message: [messageSegment],
                source: 'user',
                id: 'tmp',
                timestamp: getCurrentDateString(),
                offset: 0
            }
            this.setState({
                chatHistory: {
                    messages: [new_message]
                },
                inputValue: '',
                promptValue: ''
            })
            this.props.chatMetadata.last_message = new_message
            this.props.onChatInfoUpdated()
        }
        SERVER.post(`/users/${userId}/interactions`, {
            title: this.state.editedTitle,
            initial_message: withMessage ? {
                message: [messageSegment],
                model_config: {},
                model: this.props.chatMetadata.interaction.ai_type,
                using_system_key: this.props.chatMetadata.interaction.using_system_key,
            } : undefined
        }).then(response => {
            console.log(response)
            const metadata = response.data as ChatMetadata
            this.props.chatMetadata.interaction.id = metadata.interaction.id
            this.props.chatMetadata.interaction.title = metadata.interaction.title
            let systemResponse: ChatHistoryItem[] = []
            console.log("response from create interaction:", metadata)
            if (metadata.last_message) {
                systemResponse.push({
                    message: metadata.last_message.message,
                    id: metadata.last_message.id,
                    timestamp: metadata.last_message.timestamp,
                    offset: metadata.last_message.offset,
                    source: metadata.last_message.source as (AI)
                })
                this.props.chatMetadata.last_message = metadata.last_message
                this.props.onChatInfoUpdated()
            }
            if (withMessage) {
                const messageSegment: MessageSegment = {
                    type: "text",
                    content: this.state.promptValue || this.state.inputValue,
                }
                this.setState(prevState => ({
                    chatHistory: {
                        messages: [
                            ...(prevState.chatHistory ? prevState.chatHistory.messages : []),
                            ...systemResponse
                        ]
                    }
                }))
            } else if (this.state.chatHistory === undefined) {
                this.setState({ chatHistory: { messages: [] } })
            }
            if (this.state.editedTitle) {
                this.props.chatMetadata.interaction.title = this.state.editedTitle
                this.props.chatMetadata.last_message = metadata.last_message
            }
            this.props.onChatInfoUpdated()
            this.setState({ isWaitingForResponse: false });
        }).catch((error) => {
            this.props.showNotification({ title: "Something unexpected happened!", message: error.response.data.detail })
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

    setModel(name: string | undefined, is_via_system: boolean) {
        if (!name) {
            return name
        }
        this.props.chatMetadata.interaction.using_system_key = is_via_system

        this.props.chatMetadata.interaction.ai_type = name as AI
        if (!this.props.isNewInteraction) {
            this.setState({ isUpdatingModel: true })
            setTimeout(() => this.setState({ isUpdatingModel: false }), 200)
        }
        this.setState({})
        return this.props.chatMetadata.interaction.ai_type
    }

    getModelDisplayName() {
        const compositeName = this.props.chatMetadata.interaction.ai_type == undefined ? undefined : ((this.props.chatMetadata.interaction.using_system_key ? "trial-" : "") + this.props.chatMetadata.interaction.ai_type)
        return compositeName || this.setModel(this.props.chatMetadata.last_message?.source, false) || "Choose Model"
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
            this.props.addNewTag(newTag)
            this.setState({
                newTagName: undefined,
                newTagColor: '#ffffff',
                addTagButtonPosition: undefined,
                isAddingTag: false
            })
        }).catch((error) => {
            this.props.showNotification({ title: "Something unexpected happened!", message: error.response.data.detail })

        })
    }

    handlePromptClick(prompt: string, ai_type: AI | undefined) {
        this.setState({ promptValue: prompt }, () => {
            this.props.chatMetadata.interaction.ai_type = ai_type;
            this.sendMessage()
        });
    }

    cannotSendMessage() {
        return this.state.isWaitingForResponse || !this.state.inputValue || this.props.chatMetadata.interaction.ai_type === undefined
    }

    render() {
        if (!this.props.isNewInteraction && this.state.chatHistory === undefined) {
            return <div className='loading-spinner'><Loading /></div>
        }

        const addTagButton: JSX.Element = <div className='add-tag-button' onClick={(e) => {
            e.stopPropagation()
            if (this.state.addTagButtonPosition != undefined) {
                this.setState({ addTagButtonPosition: undefined })
                return
            }
            const button = document.querySelector(".add-tag-button") as HTMLDivElement
            const rect = localToGlobal(button);
            this.setState({
                addTagButtonPosition: { x: rect.left, y: rect.top }
            })
        }}>
            <img src='/assets/add tag.svg' width={24} />
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
            top: (this.state.addTagButtonPosition?.y ?? 0) + 28,
            boxShadow: this.state.newTagName === undefined ? "none" : "0px 2px 8px 2px rgba(0, 0, 0, 0.1)"
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
                        <TwitterPicker triangle='hide' className='tag-color-picker' color={this.state.newTagColor || 'fff'} onChange={(c) => this.setState({ newTagColor: c.hex })} styles={{
                            default: {
                                body: {
                                    padding: '8px',
                                    paddingLeft: '12px'
                                },
                            }
                        }} />
                        <button className='generic-button' disabled={!this.state.newTagName || this.state.isAddingTag} onClick={this.addNewTag}>{this.state.isAddingTag ? "Adding Tag..." : "Add Tag"}</button>
                    </div>
            }
        </div>

        const chooseModelMenu = <div className='dropdown-models'><ChatChooseModelMenu availableModels={this.state.availableModels} onChooseModel={this.setModel} disableAllModels={this.state.isWaitingForResponse}/></div>

        return <div className='chat-view'>
            <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 20, display: this.state.addTagButtonPosition ? "block" : "none" }} onClick={() => this.setState({ addTagButtonPosition: undefined, newTagName: undefined })} />
            <div className='heading'>
                <div className='title'>
                    {this.state.editedTitle !== undefined ?
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
                            }} />
                        :
                        <span style={{cursor: "default"}} onDoubleClick={(e) => {
                            e.stopPropagation()
                            this.setState({ editedTitle: this.props.chatMetadata.interaction.title })
                            setTimeout(() => {
                                // This code needs to execute after page refresh
                                const tf = document.querySelector('#conversation-name') as HTMLInputElement
                                tf.select()
                            }, 1)
                        }}>{this.props.chatMetadata.interaction.title}</span>
                    }
                    {this.state.editedTitle === undefined ?
                        <img src="/assets/edit.png" width={20} style={{ margin: '0 5px' }} onClick={(e) => {
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
                    <Dropdown trigger={['click']} overlay={chooseModelMenu} animation="slide-up">
                        <button className='select-model-button'>
                            {this.getModelDisplayName()}
                            <img src="/assets/down.svg" width="12" style={{ marginLeft: '5px' }} />
                        </button>
                    </Dropdown>
                    {this.state.isUpdatingModel && <div style={{ padding: '1px 5px 0px', display: 'inline-block', position: 'relative', height: '15px' }}>
                        <Loading size={15} />
                    </div>}
                </div>}
                <img src="/assets/trash.png" className='trash-button' width={20} onClick={this.props.onDeleteInteraction} />
            </div>
            <hr className='divider' />
            <ChatDialogView
                history={this.state.chatHistory || { messages: [] }}
                waitingForResponse={this.state.isWaitingForResponse}
                isNewInteraction={this.props.isNewInteraction}
                isTrash={this.props.isTrash}
                model={this.props.chatMetadata.interaction.ai_type}
                onClickPrompt={this.handlePromptClick}
            />
            {!this.props.isTrash && <>
                <div className='chat-input-container'>
                    <div className='send-text-line'>
                        <textarea className='text-area' id='chat-input' placeholder='Write something...' value={this.state.inputValue} onChange={(e) => this.setState({ inputValue: e.target.value })}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    if (!this.cannotSendMessage()) {
                                        this.sendMessage()
                                    }
                                }
                            }}
                            onInput={(e) => this.autoGrowTextArea(e)}
                        />
                        <button className={`generic-button send-message-button ${this.state.isWaitingForResponse && 'is-loading'}`} disabled={this.cannotSendMessage()} onClick={this.sendMessage}>
                            <img className={this.state.isWaitingForResponse ? 'send-loading-icon' : 'send-icon'} src={this.state.isWaitingForResponse ? "/assets/send-loading.svg" : "/assets/send.svg"} />
                        </button>
                    </div>
                    <div className='input-prompt'>Press Shift + Enter to start new line.</div>
                </div>
            </>}
        </div>;
    }
}

export function ChatView(props: ChatViewProps) {
    const showNotification = useNotification();
    return <ChatViewClassImpl {...props} showNotification={showNotification} />
};
export default ChatView;