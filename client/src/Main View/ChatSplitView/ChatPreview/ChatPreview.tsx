import React from 'react'
import { SearchBar } from '../../../UI Components/Search Bar';
import { ChatMetadata, formatDate } from '../../../Interfaces';
import './ChatPreview.css'

interface ChatPreviewProps {
    chatHistoryMetadata: ChatMetadata[]
    selectionChanged: (index?: number) => void
    selectedIndex?: number
}
 
interface ChatPreviewState {
    
}
 
class ChatPreview extends React.Component<ChatPreviewProps, ChatPreviewState> {
    constructor(props: ChatPreviewProps) {
        super(props);
        this.state = {};
    }
    render() {
        const rows = this.props.chatHistoryMetadata.map((metadata, i) => {
            return <div key={i} style={{backgroundColor: this.props.selectedIndex === i ? 'var(--selection-background)' : 'white'}} className='chat-preview-cell' onMouseDown={() => this.props.selectionChanged(i) }>
                <img src="/assets/chatgpt.png" />
                <div className='chat-preview-title'>{metadata.title}</div>
                <div className='chat-preview-content'>{metadata.initial_message}</div>
                <div className='chat-preview-date'>{formatDate(metadata.date)}</div>
            </div>
        })

        return <div className='chat-preview'>
            <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}} onMouseDown={() => this.props.selectionChanged(undefined)}/>
            <SearchBar style={{position: 'absolute', top: '40px', left: '20px', right: '20px'}}/>
            <button className='generic-button new-conversation-button'>
                <img src="/assets/plus.png" width={18} style={{verticalAlign: 'middle', marginRight: '10px', marginTop: '1px', filter: 'invert(1)'}} />
                <span style={{verticalAlign: 'middle'}}>New Conversation</span>
            </button>
            <div style={{position: 'absolute', top: '150px', left: 0, right: 0, maxHeight: 'calc(100% - 100px)'}}>
                {rows}
            </div>
        </div>;
    }
}
 
export default ChatPreview;