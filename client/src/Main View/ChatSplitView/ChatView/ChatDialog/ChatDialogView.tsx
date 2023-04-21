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

        let dialogCells: JSX.Element[] = [<div />] // Dummy item needed for content to align to bottom
        this.props.history.messages.forEach((msg, i) => {
            if (i === 0 || msg.timestamp - this.props.history.messages[i - 1].timestamp >= 600) {
                dialogCells.push(<div className='history-item'>
                    <div className='date-label center-content'>
                        {formatDate(msg.timestamp)}
                    </div>
                </div>)
            }

            dialogCells.push(<div className='history-item' style={{ display: 'flex' }}>
                <img src={`/assets/${msg.sender}.png`} width={40} className='avatar' />
                <div className='message'>
                    <MarkdownTextView rawText={msg.message}/>
                </div>
            </div>)
        })

        return <div className='dialog-container'>
            <div className='dialog'>
                {dialogCells}
            </div>
        </div>;
    }
}
 
export default ChatDialogView;