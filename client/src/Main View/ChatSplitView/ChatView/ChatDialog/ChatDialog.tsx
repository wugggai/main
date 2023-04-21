import React from 'react'
import './ChatDialog.css'

interface ChatDialogProps {
    
}
 
interface ChatDialogState {
    
}
 
class ChatDialog extends React.Component<ChatDialogProps, ChatDialogState> {
    constructor(props: ChatDialogProps) {
        super(props);
        this.state = { };
    }
    render() { 
        return <div className='dialog-container'>
            <div className='dialog'>
                <span className='center-content'>TODO: Chat dialog view</span>
            </div>
        </div>;
    }
}
 
export default ChatDialog;