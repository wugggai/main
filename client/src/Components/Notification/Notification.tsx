import React from 'react';
import './Notification.css'; // You can define your notification styles here

export interface NotificationProps {
    title: string;
    message: string;
    hideCloseButton?: boolean;
    show?: boolean
}

type NotificationImplProps = NotificationProps & {onClose: () => void}

class Notification extends React.Component<NotificationImplProps> {
    constructor(props: NotificationImplProps) {
        super(props)
    }

    render() { 
        return (
            <div className='notification' style={{
                opacity: this.props.show !== false ? 1.0 : 0.0,
                right: this.props.show !== false ? 10 : -200
            }}>
                <div className='info'>
                    <div style={{marginBottom: "4px"}}>
                        {this.props.title}
                    </div>
                    <div className='message'>
                        {this.props.message}
                    </div>
                </div>
                {!this.props.hideCloseButton && 
                <button className='close-button' onClick={this.props.onClose}>
                    ✕
                </button>
                }
            </div>
        )
    }
}

export default Notification;