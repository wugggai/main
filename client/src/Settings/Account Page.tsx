import React, { Fragment } from 'react'
import './AccountPage.css'
import { Loading } from '../UI Components/Loading';
import axios from 'axios';
import Cookies from 'react-cookies'
import { API_BASE, SERVER } from '../Constants';

interface AccountPageProps {
    
}
 
interface AccountPageState {
    email?: string
    password: string
    passwordUpdating?: boolean // undefined: hidden, false: 'change', true: spinner
}
 
class AccountPage extends React.Component<AccountPageProps, AccountPageState> {
    constructor(props: AccountPageProps) {
        super(props);
        this.state = {
            password: ''
        };
        this.changePassword = this.changePassword.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount(): void {
        const accessToken = Cookies.load('access_token')
        if (accessToken === undefined) {
            alert("You must be logged in to view account settings.")
            window.location.reload()
            return
        }

        axios.get(API_BASE + "/users/me", {
            headers: { "Authorization": `Bearer ${accessToken}` }
        }).then(response => {
            console.log(response)
            this.setState({ email: response.data.email })
        }).catch(err => {
            alert("You must be logged in to view account settings.")
            Cookies.remove('access_token')
            window.location.reload()
        })
    }

    changePassword() {
        const userId = Cookies.load('user_id')
        if (userId === undefined) {
            return
        }
        this.setState({ passwordUpdating: true })
        // SERVER.patch(`/users/${userId}/password`, undefined).then(response => {
        //     this.setState({ passwordUpdating: undefined })
        // })
    }

    logout() {
        if (window.confirm("Log out?")) {
            Cookies.remove('access_token')
            Cookies.remove('user_id')
            window.location.reload()
        }
    }

    render() { 
        if (this.state.email === undefined) {
            return <Loading />
        }

        const inlineSpinner = <div style={{position: 'relative', display: 'inline-block', width: '35px', height: '40px'}}>
            <Loading size={20} />
        </div>

        return <Fragment>
            <table className='settings-table'>
                <colgroup>
                    <col style={{width: '300px'}} />
                    <col />
                </colgroup>
                <tr>
                    <td>
                        <div>Email</div>
                        <div className='caption'>this is the same email you use for signing in</div>
                    </td>
                    <td><input type="email" placeholder='name@example.com' className='textfield settings-textfield' autoCorrect='false' value={this.state.email} disabled/></td>
                </tr>
                <tr>
                    <td>Password</td>
                    <td><input type="password" placeholder='Password' className='textfield settings-textfield'
                        value={this.state.password}
                        onChange={e => this.setState({ passwordUpdating: false, password: e.target.value })}
                    />{
                        this.state.passwordUpdating ?
                            inlineSpinner
                            : 
                            (this.state.passwordUpdating !== undefined && <button onClick={this.changePassword}>Change</button>)
                    }</td>
                </tr>
            </table>
            <button className='settings-button' onClick={this.logout}>Log Out</button>
        </Fragment>
    }
}
 
export default AccountPage;