import React, { Fragment } from 'react'
import './AccountPage.css'
import { Loading } from '../UI Components/Loading';
import axios from 'axios';
import Cookies from 'react-cookies'
import { SERVER } from '../Constants';

interface AccountPageProps {
    
}
 
interface AccountPageState {
    email?: string
    passwordFieldsExpanded: boolean
    password: string
    confirmPassword: string
    passwordUpdating: boolean
}
 
class AccountPage extends React.Component<AccountPageProps, AccountPageState> {
    constructor(props: AccountPageProps) {
        super(props);
        this.state = {
            password: '',
            confirmPassword: '',
            passwordFieldsExpanded: false,
            passwordUpdating: false
        };
        this.changePassword = this.changePassword.bind(this);
        this.logout = this.logout.bind(this);
        this.expandPasswordFields = this.expandPasswordFields.bind(this);
    }

    componentDidMount(): void {
        const accessToken = Cookies.load('access_token')
        if (accessToken === undefined) {
            alert("You must be logged in to view account settings.")
            window.location.reload()
            return
        }

        SERVER.get("/users/me")
        .then(response => {
            this.setState({ email: response.data.email })
        }).catch(err => {
            alert("You must be logged in to view account settings.")
            Cookies.remove('access_token')
            window.location.reload()
        })
    }

    expandPasswordFields() {
        this.setState({ passwordFieldsExpanded: true })
    }

    changePassword() {
        const userId = Cookies.load('user_id')
        if (userId === undefined) {
            return
        }
        this.setState({ passwordUpdating: true })
        SERVER.patch(`/users/${userId}/password`, {
            new_password: this.state.password
        }).then(response => {
            console.log(response)
            this.setState({ passwordFieldsExpanded: false, password: '', confirmPassword: '', passwordUpdating: false })
        }).catch(err => {
            alert("Error: " + err.response)
            this.setState({ passwordUpdating: false })
        })
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
            return <div className='loading-state'><Loading /></div>
        }

        const inlineSpinner = <div style={{position: 'relative', display: 'inline-block', width: '75px', height: '43px'}}>
            <Loading size={20} />
        </div>

        return <Fragment>
            <table className='settings-table'>
                <colgroup>
                    <col style={{width: '300px'}} />
                    <col />
                </colgroup>
                <tbody>
                    <tr>
                        <td>
                            <div>Email</div>
                            <div className='caption'>this is the same email you use for logging in</div>
                        </td>
                        <td><input type="email" placeholder='name@example.com' className='textfield settings-textfield' autoCorrect='false' value={this.state.email} disabled/></td>
                    </tr>
                    <tr>
                        <td>Password</td>
                        <td>{!this.state.passwordFieldsExpanded &&
                            <Fragment>
                                <input type="password" placeholder='••••••••' className='textfield settings-textfield' readOnly disabled /> <button onClick={this.expandPasswordFields}>Change</button>
                            </Fragment>}
                        </td>
                    </tr>
                    {this.state.passwordFieldsExpanded &&
                        <Fragment>
                            <tr style={{height: '40px'}}>
                                <td>Current Password</td>
                                <td><input type="password" placeholder='' className='textfield settings-textfield' /></td>
                            </tr>
                            <tr style={{height: '40px'}}>
                                <td>New Password</td>
                                <td><input type="password" placeholder='' className='textfield settings-textfield' value={this.state.password} onChange={(e) => this.setState({ password: e.target.value })} /></td>
                            </tr>
                            <tr>
                                <td />
                                <td>
                                    <div className='caption' style={{margin: '6px 1px', width: '220px'}}>
                                        Your new password must be at least 8 characters long and contains:
                                        <ul>
                                            <li>At least 1 uppercase letter</li>
                                            <li>At least 1 lowercase letter</li>
                                            <li>At least 1 number</li>
                                            <li>At least 1 symbol</li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            <tr style={{height: '40px'}}>
                                <td>Confirm New Password</td>
                                <td><input type="password" placeholder='' className='textfield settings-textfield' /></td>
                            </tr>
                            <tr>
                                <td />
                                <td style={{textAlign: 'right'}}>
                                    {
                                        this.state.passwordUpdating ?
                                            inlineSpinner
                                            : 
                                            <button onClick={this.changePassword} style={{marginRight: 0}}>Change</button>
                                    }
                                    <br />
                                    <span style={{fontSize: '13px', color: 'var(--lighter-text-color)'}}>Or <span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={() => this.setState({ passwordFieldsExpanded: false, password: '' })}>discard</span></span>
                                </td>
                            </tr>
                        </Fragment>
                    }
                </tbody>
            </table>
            <button className='warning-button' onClick={this.logout}>Log Out</button>
        </Fragment>
    }
}
 
export default AccountPage;