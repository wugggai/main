import axios from 'axios';
import React, { Fragment } from 'react'
import { API_BASE } from '../Constants';
import Cookies from 'react-cookies'
import { useNotification } from '../Components/Notification/NotificationContext';
import { NotificationProps } from '../Components/Notification/Notification';

interface VerificationProps {
    token: string
}

type VerificationImplProps = VerificationProps & {showNotification: ((_: NotificationProps) => void)}
 
interface VerificationState {
    verified?: boolean
}
 
class VerificationImpl extends React.Component<VerificationImplProps, VerificationState> {
    constructor(props: VerificationImplProps) {
        super(props);
        this.state = {};
    }

    componentDidMount(): void {
        axios.post(API_BASE + `/verification?token=${encodeURIComponent(this.props.token)}`, {})
        .then(response => {
            Cookies.save('access_token', response.data.access_token, {
                path: "/",
                expires: new Date(Date.now() + 30 * 86400 * 1000)
            })

            axios.get(API_BASE + "/users/me", {
                headers: { "Authorization": `Bearer ${response.data.access_token}` }
            }).then(response => {
                Cookies.save("user_id", response.data.id, {
                    path: "/",
                    expires: new Date(Date.now() + 30 * 86400 * 1000)
                })
                this.setState({ verified: true })
                setTimeout(() => window.location.assign('/'), 3000)
            }).catch(err => {
                alert(err)
            })

        }).catch(err => {
            this.props.showNotification({title: "Verification error!", message: err.code})
            this.setState({ verified: false })
        })
    }

    render() { 
        if (this.state.verified === true) {
            return <Fragment>
                <div style={{display: 'flex', alignItems: 'flex-start', margin: '10px 0px', fontSize: '17px'}}>
                    <img src="/assets/check.svg" width={18} style={{marginRight: '4px'}} />
                    <div style={{color: 'var(--theme-green)', fontWeight: '600'}}>
                        Your account has been verified!
                    </div>
                </div>
                <div style={{fontSize: '14px'}}>
                    You are logged in and we will redirect you to the main application in 3 seconds...
                </div>
            </Fragment>
        } else if (this.state.verified === false) {
            return <div style={{display: 'flex', alignItems: 'flex-start', margin: '10px 0px', fontSize: '17px'}}>
                <div style={{color: 'var(--theme-warning)', fontWeight: '600'}}>
                    This verification link is invalid or has expired.
                </div>
            </div>
        } else {
            <div style={{margin: '10px 0px', fontSize: '15px', color: 'var(--theme-warning)', fontWeight: '600'}}>
                Verifying account...
            </div>
        }
    }
}
 
export function Verification(props: VerificationProps) {
    const showNotification = useNotification();
    return <VerificationImpl {...props} showNotification={showNotification}/>
};
export default Verification;