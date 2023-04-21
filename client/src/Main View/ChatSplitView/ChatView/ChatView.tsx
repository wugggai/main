import React, { Fragment } from 'react'
import { ChatHistory, ChatMetadata } from '../../../Interfaces';
import './ChatView.css'
import SplitView from 'react-split'
import ChatDialogView from './ChatDialog/ChatDialogView';
import { Loading } from '../../../UI Components/Loading';

interface ChatViewProps {
    chatMetadata: ChatMetadata
    onChatInfoUpdated?: () => void
}
 
interface ChatViewState {
    editedTitle?: string
    chatHistory?: ChatHistory
}
 
class ChatView extends React.Component<ChatViewProps, ChatViewState> {
    chatSplitSizes = [70, 30]

    constructor(props: ChatViewProps) {
        super(props);
        this.state = {};
    }

    componentDidMount(): void {
        // Load chat history from server
        setTimeout(() => this.setState( {
            chatHistory: {
                messages: [
                    { sender: 'user', message: 'This is an ancient message', timestamp: Date.now() - 86400000 },
                    { sender: 'user', message: 'This message shows that Markdown works:\n\n\n# Heading 1\n## Heading 2\n### Heading 3\n- [Hyperlinks](https://google.com)\n\n - LaTeX expressions, e.g. $\\displaystyle f(x) = \\frac{1}{\\sigma \\sqrt{2 \\pi}} e^{-\\frac{1}{2} \\left(\\frac{x - \\mu}{\\sigma}\\right)^2}$\n\n- Code rendering\n\n  - `inline code block`\n\n  - Block code\n  ```swift\n  import Foundation\n  print("Hello world")\n  ```\n- Blockquotes, for things like poems:\n  > AI thinks and learns beyond compare,\n  >\n  > With precision and speed that\'s rare,\n  >\n  > Let\'s use it wisely and with care,\n  >\n  > To build a future that\'s right and fair.', timestamp: Date.now() },
                    { sender: 'chatgpt', message: "I'm ChatGPT", timestamp: Date.now() }
                ]
            }
        }), 1000)
    }

    render() {
        if (this.state.chatHistory === undefined) {
            return <Loading />
        }
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
                    <ChatDialogView history={this.state.chatHistory} />
                    <div className='chat-input-container'>
                        <textarea className='text-area' placeholder='Write something...' />
                    </div>
                </SplitView>
            </div>
        </div>;
    }
}
 
export default ChatView;