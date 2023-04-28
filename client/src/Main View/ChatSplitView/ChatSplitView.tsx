import React, { Fragment } from 'react'
import { ChatMetadata } from '../../Interfaces';
import SplitView from 'react-split'
import ChatPreview from './ChatPreview/ChatPreview';
import { Loading } from '../../UI Components/Loading';
import ChatView from './ChatView/ChatView';
import axios from 'axios';
import { API_BASE } from '../../Constants';

interface ChatViewProps {
    onChatHistoryLoaded?: () => void
}

interface ChatViewState {
    chatHistoryMetadata?: ChatMetadata[]
    newInteractionMetadata?: ChatMetadata
    selectedIndex?: number
}
 
class ChatSplitView extends React.Component<ChatViewProps, ChatViewState> {
    splitSizes = [25, 75]

    constructor(props: ChatViewProps) {
        super(props);
        this.state = {};
        this.newInteraction = this.newInteraction.bind(this);
        this.moveInteractionToTrash = this.moveInteractionToTrash.bind(this);
    }

    componentDidMount(): void {
        axios.get(API_BASE + "/interactions").then(response => {
            console.log(response)
        }).catch(err => {
            this.setState({ chatHistoryMetadata: [] })
        })
    }

    newInteraction() {
        this.setState({
            newInteractionMetadata: {
                ai_type: 'chatgpt',
                date: Date.now(),
                initial_message: null,
                title: "Untitled Conversation"
            }
        })
    }

    moveInteractionToTrash(metadata?: ChatMetadata) {
        console.log("Moving to trash:", metadata)
        this.setState({ selectedIndex: undefined, newInteractionMetadata: undefined })
    }

    render() {
        if (this.state.chatHistoryMetadata === undefined) {
            return <Loading />
        }

        let content: JSX.Element
        if (this.state.selectedIndex !== undefined) {
            const metadata = this.state.chatHistoryMetadata[this.state.selectedIndex]
            content = <ChatView chatMetadata={metadata} onChatInfoUpdated={() => this.forceUpdate()} isNewInteraction={false} onDeleteInteraction={() => this.moveInteractionToTrash(metadata)} />
        } else if (this.state.newInteractionMetadata !== undefined) {
            content = <ChatView chatMetadata={this.state.newInteractionMetadata} onChatInfoUpdated={() => this.forceUpdate()} isNewInteraction onDeleteInteraction={this.moveInteractionToTrash} />
        } else {
            content = <div className='center-content'>No chat selected</div>
        }

        return <SplitView className='split' minSize={[280, 400]} maxSize={[380, Infinity]} snapOffset={0} expandToMin sizes={this.splitSizes} gutterSize={4} style={{height: '100%'}} onDrag={newSizes => this.splitSizes = newSizes }>
            <ChatPreview chatHistoryMetadata={this.state.chatHistoryMetadata} selectionChanged={(i) => this.setState({ selectedIndex: i })} selectedIndex={this.state.selectedIndex} onCreateNewInteraction={this.newInteraction} />
            
            <div style={{position: 'relative'}}>
                {content}
            </div>
        </SplitView>;
    }
}
 
export default ChatSplitView;