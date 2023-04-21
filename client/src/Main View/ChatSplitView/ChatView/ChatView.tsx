import React, { Fragment } from 'react'
import { ChatMetadata } from '../../../Interfaces';
import './ChatView.css'
import SplitView from 'react-split'
import ChatDialog from './ChatDialog/ChatDialog';

interface ChatViewProps {
    chatMetadata: ChatMetadata
    onChatInfoUpdated?: () => void
}
 
interface ChatViewState {
    editedTitle?: string
}
 
class ChatView extends React.Component<ChatViewProps, ChatViewState> {
    chatSplitSizes = [70, 30]

    constructor(props: ChatViewProps) {
        super(props);
        this.state = {};
    }
    render() { 
        return <div className='chat-view' onClick={() => this.setState({ editedTitle: undefined })}>
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
                                    this.props.onChatInfoUpdated && this.props.onChatInfoUpdated()
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
                <img src="/assets/trash.png" className='trash-button' width={20}/>
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
                    <ChatDialog />
                    <div className='chat-input-container'>
                        <textarea className='text-area' placeholder='Write something...' />
                    </div>
                </SplitView>
            </div>
        </div>;
    }
}
 
export default ChatView;