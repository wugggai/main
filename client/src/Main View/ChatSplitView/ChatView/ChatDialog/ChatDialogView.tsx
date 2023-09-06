import React from 'react'
import './ChatDialogView.css'
import { ChatHistory, formatDate } from '../../../../Interfaces';
import MarkdownTextView from '../../../../UI Components/MarkdownTextView';
import { Loading } from '../../../../UI Components/Loading';

interface ChatDialogProps {
    history: ChatHistory
    waitingForResponse: boolean
    isTrash: boolean
}
 
interface ChatDialogState {
    
}
 
class ChatDialogView extends React.Component<ChatDialogProps, ChatDialogState> {
    constructor(props: ChatDialogProps) {
        super(props);
        this.state = { };
    }

    render() {
        let dialogCells: JSX.Element[] = [<div key={-1} />] // Dummy item needed for content to align to bottom
        this.props.history.messages.forEach((msg, i) => {
            if (i === 0 || new Date(msg.timestamp).getTime() - new Date(this.props.history.messages[i - 1].timestamp).getTime() >= 600000) {
                dialogCells.push(<div className='history-item' key={`${i} time`}>
                    <div className='date-label'>
                        {formatDate(msg.timestamp)}
                    </div>
                </div>)
            }
            // TODO: get the image with an API call once backend store's the user's profile pic
            var iconAssetName = msg.source
            if (iconAssetName.startsWith("user")) {
                iconAssetName = "user"
            }

            const messageSegments = msg.message.map((segment, index) => {
                if (segment.type === "text") {
                    return <MarkdownTextView key={index} rawText={segment.content} />;
                } else if (segment.type === "image_url") {
                    return <img className='ai-image' key={index} src={segment.content}/>;
                } else {
                    return null;
                }
            });

            dialogCells.push(<div className='history-item' style={{ display: 'flex' }} key={i}>
                <img src={`/assets/${iconAssetName}.png`} width={40} className='avatar' />
                <div className='messageContainer'>{messageSegments}</div>
            </div>)
        })

        return <div className='dialog-container'>
            <div id='chat-dialog'>
                {this.props.waitingForResponse && <div className='history-item' style={{ display: 'flex', minHeight: '70px' }} key={-1}>
                    <img src={`/assets/gpt-3.5-turbo.png`} width={40} className='avatar' />
                    <div className='message'>
                        <div style={{width: 20, height: '40px', position: 'relative'}}><Loading size={20}/></div>
                    </div>
                </div>}
                {dialogCells.reverse()}
            </div>
        </div>;
    }
}
 
export default ChatDialogView;