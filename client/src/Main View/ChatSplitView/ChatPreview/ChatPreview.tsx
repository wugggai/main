import React from 'react'
import { SearchBar } from '../../../UI Components/Search Bar';
import { ChatMetadata, formatDate } from '../../../Interfaces';
import './ChatPreview.css'

interface ChatPreviewProps {
    chatHistoryMetadata: ChatMetadata[]
    newChatMetadata?: ChatMetadata
    selectionChanged: (index?: number) => void
    selectedIndex?: number
    onCreateNewInteraction: () => void
    filterByTags: Set<string>
    isTrash: boolean
}
 
interface ChatPreviewState {
    searchString: string
}
 
class ChatPreview extends React.Component<ChatPreviewProps, ChatPreviewState> {
    constructor(props: ChatPreviewProps) {
        super(props);
        this.state = {
            searchString: ''
        };
    }

    render() {
        let combinedMetadata: ChatMetadata[] = []
        if (this.props.newChatMetadata) {
            combinedMetadata.push(this.props.newChatMetadata)
        }
        combinedMetadata.push(...this.props.chatHistoryMetadata)
        
        const rows = combinedMetadata.map((metadata, i) => {
            if (this.props.filterByTags.size > 0 && !metadata.interaction.tag_ids.map(tag => this.props.filterByTags.has(tag)).includes(true)) {
                return undefined
            }

            if (this.state.searchString !== '' && !metadata.interaction.title.toLocaleLowerCase().includes(this.state.searchString.toLowerCase())) {
                return undefined
            }

            return <li key={i} style={{backgroundColor: this.props.selectedIndex === i ? 'var(--selection-background)' : 'white'}} className='chat-preview-cell' onMouseDown={(event) => {
                event.stopPropagation();
                this.props.selectionChanged(i)
            }  }>
                <img src="/assets/gpt-3.5-turbo.png" />
                <div className='chat-preview-title'>{metadata.interaction.title}</div>
                <div className='chat-preview-content'>{metadata.last_message && metadata.last_message.message.length > 0 && metadata.last_message.message[0].content || <em>No message</em>}</div>
                <div className='chat-preview-date'>{formatDate(metadata.interaction.last_updated)}</div>
            </li>
        })
        
        const emptyMessage = 
            <div className='empty-conversation-list'>
                No conversations.
            </div>

        return <div className='chat-preview' onMouseDown={() => this.props.selectionChanged(undefined)}>
            <div className='chat-preview-header'>
                <SearchBar style={{width: "100%", marginTop: "16px"}} onChange={(s) => this.setState({ searchString: s })}/>
                {!this.props.isTrash && this.props.filterByTags.size === 0 && 
                    <button className='generic-button new-conversation-button' onClick={this.props.onCreateNewInteraction}>
                        <img src="/assets/plus.png" width={18} style={{verticalAlign: 'middle', marginRight: '10px', marginTop: '1px', filter: 'invert(1)'}} />
                        <span style={{verticalAlign: 'middle'}}>New Conversation</span>
                    </button>
                }
            </div>
            {
                rows.filter(r => r !== undefined).length > 0 ?
                (<ul className='preview-chat-list'>
                    {rows}
                </ul>)
                : emptyMessage
            }
        </div>;
    }
}
 
export default ChatPreview;