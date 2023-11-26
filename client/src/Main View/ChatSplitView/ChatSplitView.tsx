import React, { Fragment } from 'react'
import { ChatMetadata, Tag, formatDate, getCurrentDateString } from '../../Interfaces';
import SplitView from 'react-split'
import ChatPreview from './ChatPreview/ChatPreview';
import ChatView from './ChatView/ChatView';
import { SERVER, getUserId } from '../../Constants';
import AlertSheet from '../../Components/AlertSheet/AlertSheet';
import Cookies from "react-cookies"
import './ChatSplitView.css'

interface ChatViewProps {
    onChatHistoryLoaded?: () => void
    addNewTag: (tag: Tag) => void
    availableTags: Tag[]
    selectedTagIds: Set<string>
    isTrash: boolean
}

interface ChatViewState {
    chatHistoryMetadata?: ChatMetadata[]
    selectedIndex?: number
    deletingChat?: ChatMetadata
}
 
class ChatSplitView extends React.Component<ChatViewProps, ChatViewState> {
    // Initial sizes (percentages) of the splits
    splitSizes = [28, 72]

    unsavedStates: Record<string, string> = {}

    constructor(props: ChatViewProps) {
        super(props);
        this.state = {};
        this.newInteraction = this.newInteraction.bind(this);
        this.moveInteractionToTrash = this.moveInteractionToTrash.bind(this);
        this.updateSplitSizes = this.updateSplitSizes.bind(this);
        this.newestInteractionIfExists = this.newestInteractionIfExists.bind(this);
    }

    componentDidMount(): void {
        const userId = getUserId()
        if (userId === undefined) {
            return
        }
        SERVER.get(`/users/${userId}/interactions` + (this.props.isTrash ? "/deleted" : "")).then(response => {
            this.setState({
                chatHistoryMetadata: response.data,
            }, () => {
                this.setState({
                    selectedIndex: this.newestInteractionIfExists(),
                }, () => console.log(this.state.selectedIndex))
                
            })
            setTimeout(() => {
                const chatSidebar = document.querySelector(".chat-sidebar") as HTMLDivElement
                const chatContent = document.querySelector(".chat-content") as HTMLDivElement
                chatSidebar.style.width = `${chatSidebar.clientWidth}px`
                chatContent.style.width = `calc(100% - 4px - ${chatSidebar.clientWidth}px)`
            }, 100)
        }).catch(err => {
            this.setState({ chatHistoryMetadata: [] })
        })


    }

    componentDidUpdate(prevProps: Readonly<ChatViewProps>, prevState: Readonly<ChatViewState>, snapshot?: any): void {
        if (prevProps.isTrash !== this.props.isTrash) {
            this.setState({ chatHistoryMetadata: undefined, selectedIndex: undefined })
            this.componentDidMount()
        }
    }

    updateSplitSizes() {
        const chatSidebar = document.querySelector(".chat-sidebar") as HTMLDivElement
        const splitView = document.querySelector(".main-content") as HTMLDivElement
        
        const leftSize = Math.round((chatSidebar.clientWidth + 2) / splitView.clientWidth * 100)
        this.splitSizes = [leftSize, 100 - leftSize]
    }

    updateSplitStyles() {
        const chatSidebar = document.querySelector(".chat-sidebar") as HTMLDivElement
        const chatContent = document.querySelector(".chat-content") as HTMLDivElement
        chatSidebar.style.width = `${chatSidebar.clientWidth}px`
        chatContent.style.width = `calc(100% - 4px - ${chatSidebar.clientWidth}px)`
    }

    newInteraction() {
        const userId = Cookies.load("user_id")
        if (userId !== undefined) {
            SERVER.post(`/users/${userId}/interactions`, {}).then(response => {
                console.log(response.data)
                this.state.chatHistoryMetadata?.unshift({
                    last_message: null,
                    interaction: response.data.interaction
                })
                this.setState({
                    selectedIndex: 0
                })
            }).then(err => {
                console.log(err)
                alert("Sorry, an error has occurred. Please refresh the page and try again.")
            })
        }
    }

    // Return the correct selectedIndex state to display:
    // 0 if there's at least one interaction available, undefined otherwise
    newestInteractionIfExists() {
        if (this.state.chatHistoryMetadata && this.state.chatHistoryMetadata.length > 0) {
            return 0
        }
        return undefined
    }

    moveInteractionToTrash() {
        if (this.state.deletingChat === undefined || this.state.selectedIndex === undefined) {
            return
        }

        const index = this.state.selectedIndex

        // TODO
        if (this.props.isTrash) {
            SERVER.delete(`/interactions/${this.state.deletingChat.interaction.id}`).then(response => {
                if (response.status === 200) {
                    this.state.chatHistoryMetadata!.splice(index, 1)
                    this.setState({ selectedIndex: this.newestInteractionIfExists(), deletingChat: undefined })
                }
            })
        }

        SERVER.put(`/interactions/${this.state.deletingChat.interaction.id}`, {
            deleted: true
        }).then(_ => {
            if (this.state.selectedIndex !== undefined) {
                this.state.chatHistoryMetadata!.splice(this.state.selectedIndex, 1)
            }
            this.setState({ selectedIndex: this.newestInteractionIfExists(), deletingChat: undefined })
        })
    }
    
    render() {
        if (this.state.chatHistoryMetadata === undefined) {
            return <div></div>
        }
        
        let content: JSX.Element
        if (this.state.selectedIndex !== undefined && (this.props.selectedTagIds.size == 0 || this.state.chatHistoryMetadata[this.state.selectedIndex].interaction.tag_ids.some(id => this.props.selectedTagIds.has(id)))) {
            let metadata = this.state.chatHistoryMetadata[this.state.selectedIndex]
            content = <ChatView chatMetadata={metadata} isTrash={this.props.isTrash} availableTags={this.props.availableTags} onChatInfoUpdated={() => {
                this.forceUpdate()
            }}
            isNewInteraction={false} onDeleteInteraction={() => {
                this.setState({ deletingChat: metadata })}
            }
            addNewTag={this.props.addNewTag}
            unsavedStates={this.unsavedStates}
            />
        } else {
            if (this.props.isTrash) {
                content = <div className='no-chat-empty-state'>
                    Trash Default Screen
                </div>
            } else {
                content = <div className='no-chat-empty-state'>
                    <img src="/assets/instructions.png" style={{width: "min(100%, 512px)"}} />
                </div>
            }
        }

        return <Fragment>
            <SplitView className='split' minSize={[280, 400]} maxSize={[448, Infinity]} snapOffset={0} expandToMin sizes={this.splitSizes} gutterSize={4} style={{height: '100%'}}
                onDrag={newSizes => this.splitSizes = newSizes}
                onDragEnd={() => {
                    // Constrain left split view width after drag ends
                    const chatSidebar = document.querySelector(".chat-sidebar") as HTMLDivElement
                    const chatContent = document.querySelector(".chat-content") as HTMLDivElement
                    chatSidebar.style.width = `${chatSidebar.clientWidth}px`
                    chatContent.style.width = `calc(100% - 4px - ${chatSidebar.clientWidth}px)`
                }
            }>
                <div className='chat-sidebar'>
                    <ChatPreview
                        chatHistoryMetadata={this.state.chatHistoryMetadata}
                        selectionChanged={(i) => {
                            if (i === undefined) {
                                this.setState({ selectedIndex: undefined })
                            } else if (i !== this.state.selectedIndex) {
                                this.setState({ selectedIndex: i })
                            }
                        }}
                        selectedIndex={this.state.selectedIndex}
                        onCreateNewInteraction={this.newInteraction}
                        filterByTags={this.props.selectedTagIds}
                        isTrash={this.props.isTrash}
                    />
                </div>
                
                <div className='chat-content'>
                    {content}
                </div>
            </SplitView>
            <AlertSheet
                show={this.state.deletingChat !== undefined}
                title={this.props.isTrash ? 'Permanently Delete this Conversation?' : 'Move This Conversation to Trash?'}
                message={this.state.deletingChat?.interaction.title}
                onClickedOutside={() => this.setState({ deletingChat: undefined })}
                buttons={[
                    {
                        title: "Cancel",
                        type: "normal",
                        onClick: () => this.setState({ deletingChat: undefined })
                    },
                    {
                        title: this.props.isTrash ? "Delete" : "Move to Trash",
                        type: 'destructive',
                        onClick: () => this.moveInteractionToTrash()
                    }
                ]}
                onEnter={() => this.moveInteractionToTrash() }
            />
        </Fragment>
    }
}
 
export default ChatSplitView;