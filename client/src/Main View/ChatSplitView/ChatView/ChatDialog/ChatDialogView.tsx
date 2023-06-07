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

    componentDidMount(): void {
        // Needed to scroll div to bottom before displaying to the user
        // setTimeout(() => {
        //     const chatDialog = document.querySelector("#chat-dialog") as HTMLDivElement
        //     chatDialog.scrollTop = chatDialog.scrollHeight
        //     chatDialog.style.opacity = "1"
        // }, 1)
    }

    // componentDidUpdate(prevProps: Readonly<ChatDialogProps>, prevState: Readonly<ChatDialogState>, snapshot?: any): void {
    //     const chatDialog = document.querySelector("#chat-dialog") as HTMLDivElement
    //     chatDialog.style.opacity = '0'
    //     setTimeout(() => {
    //         chatDialog.scrollTop = chatDialog.scrollHeight
    //         chatDialog.style.opacity = "1"
    //     }, 1)
    // }

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
            dialogCells.push(<div className='history-item' style={{ display: 'flex' }} key={i}>
                <img src={`/assets/${msg.source}.png`} width={40} className='avatar' />
                <div className='message'>
                    <MarkdownTextView rawText={msg.message}/>
                </div>
            </div>)
        })

        return <div className='dialog-container'>
            <div id='chat-dialog' style={{ paddingBottom: this.props.isTrash ? '20px' : '80px' }}>
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