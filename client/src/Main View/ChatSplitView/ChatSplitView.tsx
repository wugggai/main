import React, { Fragment } from 'react'
import { ChatMetadata } from '../../Interfaces';
import SplitView from 'react-split'
import ChatPreview from './ChatPreview/ChatPreview';
import { Loading } from '../../UI Components/Loading';
import ChatView from './ChatView/ChatView';

interface ChatViewProps {
    onChatHistoryLoaded?: () => void
}

interface ChatViewState {
    chatHistoryMetadata?: ChatMetadata[]
    selectedIndex?: number
}
 
class ChatSplitView extends React.Component<ChatViewProps, ChatViewState> {
    splitSizes = [25, 75]

    constructor(props: ChatViewProps) {
        super(props);
        this.state = {};
    }

    componentDidMount(): void {
        setTimeout(() => this.setState({ chatHistoryMetadata: [
            {
                ai_type: 'chatgpt',
                title: "What is a chatbot?",
                initial_message: "A chatbot is a computer program that simulates human conversation through voice commands or text chats.",
                date: Date.now()
            }
        ] }), 1000)
    }


    render() {
        if (this.state.chatHistoryMetadata === undefined) {
            return <Loading />
        }

        return <SplitView className='split' minSize={[280, 400]} maxSize={[380, Infinity]} snapOffset={0} expandToMin sizes={this.splitSizes} gutterSize={4} style={{height: '100%'}} onDrag={newSizes => this.splitSizes = newSizes }>
            <ChatPreview chatHistoryMetadata={this.state.chatHistoryMetadata} selectionChanged={(i) => this.setState({ selectedIndex: i })} selectedIndex={this.state.selectedIndex} />
            <div style={{position: 'relative'}}>
                {this.state.selectedIndex === undefined ? <div className='center-content'>No chat selected</div> : <ChatView chatMetadata={this.state.chatHistoryMetadata[this.state.selectedIndex]} onChatInfoUpdated={() => this.forceUpdate()} />}
            </div>
        </SplitView>;
    }
}
 
export default ChatSplitView;