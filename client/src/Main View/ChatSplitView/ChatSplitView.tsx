import React, { Fragment } from 'react'
import { ChatMetadata, Tag } from '../../Interfaces';
import SplitView from 'react-split'
import ChatPreview from './ChatPreview/ChatPreview';
import { Loading } from '../../UI Components/Loading';
import ChatView from './ChatView/ChatView';
import axios from 'axios';
import { API_BASE, SERVER, getUserId } from '../../Constants';
import AlertSheet from '../../Components/AlertSheet/AlertSheet';

interface ChatViewProps {
    onChatHistoryLoaded?: () => void
    availableTags: Tag[]
    selectedTagIds: Set<string>
    isTrash: boolean
}

interface ChatViewState {
    chatHistoryMetadata?: ChatMetadata[]
    newInteractionMetadata?: ChatMetadata
    selectedIndex?: number
    deletingChat?: ChatMetadata
}
 
class ChatSplitView extends React.Component<ChatViewProps, ChatViewState> {
    splitSizes = [28, 72]

    constructor(props: ChatViewProps) {
        super(props);
        this.state = {};
        this.newInteraction = this.newInteraction.bind(this);
        this.moveInteractionToTrash = this.moveInteractionToTrash.bind(this);
    }

    componentDidMount(): void {
        const userId = getUserId()
        if (userId === undefined) {
            return
        }
        SERVER.get(`/users/${userId}/interactions` + (this.props.isTrash ? "/deleted" : "")).then(response => {
            this.setState({
                chatHistoryMetadata: response.data
            })
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

    newInteraction() {
        this.setState({
            newInteractionMetadata: {
                interaction: {
                    ai_type: 'echo', // todo: choose from popup button
                    id: '',
                    tag_ids: [],
                    creator_user_id: `${getUserId()}`,
                    last_updated: new Date().toISOString(),
                    title: this.state.newInteractionMetadata?.interaction.title ?? "Untitled Conversation"
                },
                last_message: null
            },
            selectedIndex: undefined
        })
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
                    this.setState({ selectedIndex: undefined, deletingChat: undefined })
                }
            })
        }

        SERVER.put(`/interactions/${this.state.deletingChat.interaction.id}`, {
            deleted: true
        }).then(response => {
            if (this.state.selectedIndex !== undefined) {
                this.state.chatHistoryMetadata!.splice(this.state.selectedIndex, 1)
            }
            this.setState({ selectedIndex: undefined, newInteractionMetadata: undefined, deletingChat: undefined })
        })
    }

    render() {
        if (this.state.chatHistoryMetadata === undefined) {
            return <Loading />
        }

        let content: JSX.Element
        if (this.state.selectedIndex !== undefined && (this.props.selectedTagIds.size == 0 || this.state.chatHistoryMetadata[this.state.selectedIndex].interaction.tag_ids.map(id => this.props.selectedTagIds.has(id)).includes(true))) {
            let metadata = this.state.chatHistoryMetadata[this.state.selectedIndex]
            content = <ChatView chatMetadata={metadata} isTrash={this.props.isTrash} availableTags={this.props.availableTags} onChatInfoUpdated={() => {
                this.forceUpdate()
            }} isNewInteraction={false} onDeleteInteraction={() => {
                this.setState({ deletingChat: metadata })}
            }/>
        } else if (this.state.newInteractionMetadata !== undefined) {
            content = <ChatView chatMetadata={this.state.newInteractionMetadata} isTrash={this.props.isTrash} availableTags={this.props.availableTags} onChatInfoUpdated={() => {
                this.setState({
                    chatHistoryMetadata: [this.state.newInteractionMetadata!, ...this.state.chatHistoryMetadata!],
                    selectedIndex: 0,
                    newInteractionMetadata: undefined
                })
            }} isNewInteraction onDeleteInteraction={() => this.setState({ newInteractionMetadata: undefined })} />
        } else {
            content = <div className='center-content'>No chat selected</div>
        }

        return <Fragment>
            <SplitView className='split' minSize={[280, 400]} maxSize={[450, Infinity]} snapOffset={0} expandToMin sizes={this.splitSizes} gutterSize={4} style={{height: '100%'}} onDrag={newSizes => this.splitSizes = newSizes }>
                <ChatPreview
                    chatHistoryMetadata={this.state.chatHistoryMetadata}
                    newChatMetadata={this.state.newInteractionMetadata}
                    selectionChanged={(i) => {
                        if (i === undefined) {
                            this.setState({ selectedIndex: undefined, newInteractionMetadata: undefined })
                        } else if (this.state.newInteractionMetadata && i !== 0) {
                            this.setState({ selectedIndex: i-1, newInteractionMetadata: undefined })
                        } else if (i !== this.state.selectedIndex) {
                            this.setState({ selectedIndex: i })
                        }
                    }}
                    selectedIndex={this.state.newInteractionMetadata ? 0 : this.state.selectedIndex}
                    onCreateNewInteraction={this.newInteraction}
                    filterByTags={this.props.selectedTagIds}
                    isTrash={this.props.isTrash}
                />
                
                <div style={{position: 'relative'}}>
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
            />
        </Fragment>
    }
}
 
export default ChatSplitView;