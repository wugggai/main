import React from 'react'
import './ChatDialogView.css'
import { ChatHistory, formatDate } from '../../../../Interfaces';
import MarkdownTextView from '../../../../UI Components/MarkdownTextView';

interface ChatDialogProps {
    history: ChatHistory
}
 
interface ChatDialogState {
    
}
 
class ChatDialogView extends React.Component<ChatDialogProps, ChatDialogState> {
    constructor(props: ChatDialogProps) {
        super(props);
        this.state = { };
    }

    render() {
        // Needed to scroll div to bottom before displaying to the user
        setTimeout(() => {
            const chatDialog = document.querySelector("#chat-dialog") as HTMLDivElement
            chatDialog.scrollTop = chatDialog.scrollHeight
            chatDialog.style.opacity = "1"
        }, 1)
        let dialogCells: JSX.Element[] = [<div key={-1} />] // Dummy item needed for content to align to bottom
        this.props.history.messages.forEach((msg, i) => {
            if (i === 0 || msg.timestamp - this.props.history.messages[i - 1].timestamp >= 600000) {
                dialogCells.push(<div className='history-item' key={`${i} time`}>
                    <div className='date-label'>
                        {formatDate(msg.timestamp)}
                    </div>
                </div>)
            }

            dialogCells.push(<div className='history-item' style={{ display: 'flex' }} key={i}>
                <img src={`/assets/${msg.role}.png`} width={40} className='avatar' />
                <div className='message'>
                    <MarkdownTextView rawText={msg.content}/>
                </div>
            </div>)
        })

        return <div className='dialog-container'>
            <div id='chat-dialog' style={{opacity: 0}}>
                {dialogCells}
            </div>
        </div>;
    }
}
 
export default ChatDialogView;