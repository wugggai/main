import React from 'react'

interface VerificationProps {
    token: string
}
 
interface VerificationState {
    
}
 
class Verification extends React.Component<VerificationProps, VerificationState> {
    constructor(props: VerificationProps) {
        super(props);
        this.state = {};
    }
    render() { 
        return <div className='generic-container'>
            <div className='center-content'>
                {`Verification with token ${this.props.token}`}
            </div>
        </div>;
    }
}
 
export default Verification;