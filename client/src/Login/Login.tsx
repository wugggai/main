import React, { Fragment } from 'react'
import './Login.css'
import axios from 'axios';
import { API_BASE } from '../Constants';
import Cookies from 'react-cookies'
import { passwordStrength } from 'check-password-strength'

interface LoginProps {
    
}
 
interface LoginState {
    username: string
    password: string
    confirmPassword: string
    mode: 'login' | 'sign up' | 'reset'
    showInstructions: boolean
    passwordWarning?: string
    confirmWarning?: string
    resetDone: boolean
}

 
class Login extends React.Component<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);
        this.state = {
            username: '',
            mode: 'login',
            password: '',
            confirmPassword: '',
            showInstructions: false,
            resetDone: false
        };

        this.login = this.login.bind(this);
        this.signUp = this.signUp.bind(this);
        this.reset = this.reset.bind(this);
    }

    login() {
        axios.postForm(API_BASE + '/token', {
            grant_type: 'password',
            username: this.state.username,
            password: this.state.password
        }).then(response => {
            if (response.status === 200) {
                Cookies.save('access_token', response.data.access_token, { expires: new Date(Date.now() + 30 * 86400 * 1000) })
            
                axios.get(API_BASE + "/users/me", {
                    headers: { "Authorization": `Bearer ${response.data.access_token}` }
                }).then(response => {
                    Cookies.save("user_id", response.data.id, { expires: new Date(Date.now() + 30 * 86400 * 1000) })
                    window.location.reload()
                }).catch(err => {
                    alert(err)
                })
            }
        }).catch(err => {
            if (err.response?.status === 401) {
                alert("Incorrect username/password combination.")
            } else if (err.response?.status === 422) {
                alert("You must enter a username and a password.")
            }
        })
    }

    signUp() {
        axios.post(API_BASE + `/users`, {
            email: this.state.username,
            password: this.state.password
        }).then(response => {
            this.setState({
                showInstructions: true,
                username: '',
                password: '',
                confirmPassword: ''
            })
            // Cookies.save("userId", response.data.id, {expires: new Date(Date.now() + 30 * 86400 * 1000)})
            console.log(response.data)
        }).catch(err => {
            if (err.response?.status === 409) {
                alert("This email address is already taken.")
            }
        })
    }

    reset() {
        axios.post(API_BASE + '/users/forgetpassword', {
            email: this.state.username
        }).finally(() => {
            this.setState({ resetDone: true })
        })
    }

    render() { 
        const enableButton = this.state.username && this.state.password && this.state.password == this.state.confirmPassword
        const loginScreen = <div className='login-fields'>
            <h3>Login</h3>
            <fieldset>
                <label htmlFor="email">Email</label>
                <br />
                <input type="email" name='email' placeholder='somename@domain.com' className='textfield login-field' value={this.state.username} onChange={e => this.setState({ username: e.target.value })} />
                <div style={{height: '20px'}} />
                <label htmlFor='password'>Password</label>
                <br />
                <input type="password" name="password" className='textfield login-field' value={this.state.password} onChange={e => this.setState({ password: e.target.value })} />
                <div style={{textAlign: 'right'}}>
                    <a href='#' id="forgot-password" onClick={() => this.setState({ mode: 'reset' })}>Forgot Password</a>
                </div>
            </fieldset>
            <button className='login-button generic-button' onClick={this.login}>Log In</button>
            <div className='signup-message'>Don't have an account?<a href='#' onClick={() => this.setState({ mode: 'sign up' })}>Sign Up</a></div>
        </div>

        const signupScreen = <div className='login-fields'>
            <h3>Sign Up</h3>
            <fieldset>
                <label htmlFor="email">Email</label>
                <br />
                <input type="email" name='email' placeholder='somename@domain.com' className='textfield login-field' value={this.state.username} onChange={e => this.setState({ username: e.target.value })} />
                <div style={{height: '20px'}} />
                <label htmlFor='password'>Password</label>
                <br />
                <input type="password" name="password" className='textfield login-field' value={this.state.password} onChange={e => {
                    this.setState({
                        password: e.target.value,
                        passwordWarning: passwordStrength(e.target.value).contains.length === 4 ? undefined : "Password must have at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.",
                        confirmWarning: e.target.value === this.state.confirmPassword ? undefined : "Passwords do not match."
                    })
                }} />
                {this.state.passwordWarning && <div className='warning'>
                    {this.state.passwordWarning}
                </div>}
                <div style={{height: '20px'}} />
                <label htmlFor='confirm-password'>Confirm Password</label>
                <br />
                <input type="password" name='confirm-password' className='textfield login-field' value={this.state.confirmPassword} onChange={e => {
                    
                    this.setState({
                        confirmPassword: e.target.value,
                        confirmWarning: e.target.value === this.state.password ? undefined : "Passwords do not match."
                    })
                }} />
                {this.state.confirmWarning && <div className='warning'>
                    {this.state.confirmWarning}
                </div>
                }
                <div className='terms'>
                    By creating an account you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                </div>
                <button className='login-button generic-button' disabled={!enableButton} onClick={this.signUp}>Sign Up</button>
                <div style={{textAlign: 'center'}} className='signup-message'>
                    Or<a href='#' onClick={() => this.setState({ mode: 'login' })}>Return to Login</a>
                </div>
            </fieldset>
        </div>

        const resetScreen = <div className='login-fields' style={{maxWidth: '300px'}}>
            <h3>Password Reset</h3>
            <div className='reset-instructions'>
                Please enter your email address below and we will send you a link with instructions to reset your password.
            </div>
            <input type='email' placeholder='Email' value={this.state.username} onChange={e => this.setState({ username: e.target.value })} className='textfield login-field' />
            {this.state.resetDone ?
                <Fragment>
                    <div style={{display: 'flex', alignItems: 'flex-start', margin: '10px 0px', fontSize: '14px'}}>
                        <img src="/assets/check.svg" width={18} style={{marginRight: '4px'}} />
                        <div style={{color: 'var(--theme-green)'}}>
                            An email has been sent to your email address, please check your inbox and/or your spam folder.
                        </div>
                    </div>
                    <div style={{fontSize: '13px', textAlign: 'center', margin: '20px 0'}}>
                        Back to <a href='#' onClick={() => this.setState({ mode: 'login', resetDone: false, username: '' })}>Login</a>
                    </div>
                </Fragment>
                :
                <Fragment>
                    <button disabled={!this.state.username} className='login-button reset-button' onClick={this.reset}>Reset Password</button>
                    <span style={{fontSize: '13px'}}>
                        Or <a href='#' onClick={() => this.setState({ mode: 'login', resetDone: false })}>Cancel</a>
                    </span>
                </Fragment>
            }
        </div>

        const instructionScreen = <div className='login-fields'>
            Please check your inbox to verify your account.
            <br />
            <div style={{textAlign: 'center'}}>
                <a href="#" onClick={() => this.setState({ mode: 'login', showInstructions: false, password: '', username: '' })}>Return to Login</a>
            </div>
        </div>

        let rightScreen: JSX.Element
        if (this.state.mode === 'login') {
            rightScreen = this.state.showInstructions ? instructionScreen : loginScreen
        } else if (this.state.mode === 'sign up') {
            rightScreen = signupScreen
        } else {
            rightScreen = resetScreen
        }
 
        return <div className='center-screen login-screen'>
            <div className='left'>
                <div className='container'>
                    <img src="/assets/logo.png" width="100px" />
                    <h1>Wug.ai</h1>
                    <div>a lorem ipsum dolor for yorem ipsum dolor sit, using sorem ipsum dolor sit amet </div>

                    <p>Product Description</p>
                </div>
            </div>
            <div className='right'>
                {rightScreen}
            </div>
        </div>;
    }
}
 
export default Login;