import React, { Fragment } from 'react'
import './Login.css'
import axios from 'axios';
import { API_BASE } from '../Constants';
import Cookies from 'react-cookies'
import { passwordStrength } from 'check-password-strength'
import Verification from './Verification';
import { useNotification } from '../Components/Notification/NotificationContext';
import { NotificationProps } from '../Components/Notification/Notification';
import { error } from 'console';

interface LoginProps {
    resetToken?: string
    verificationToken?: string
}

type LoginImplProps =  LoginProps & {showNotification: ((_: NotificationProps) => void)}

type Mode = 'login' | 'sign up' | 'reset' | 'new password' | 'verified'
 
interface LoginState {
    username: string
    password: string
    confirmPassword: string
    mode: Mode
    showInstructions: boolean
    passwordWarning?: string
    confirmWarning?: string
    resetDone: boolean
    isProcessingLogin: boolean
}

 
class LoginImpl extends React.Component<LoginImplProps, LoginState> {
    constructor(props: LoginImplProps) {
        super(props);

        let mode: Mode = "login"
        if (this.props.resetToken) {
            mode = "new password"
        } else if (this.props.verificationToken) {
            mode = "verified"
        }

        this.state = {
            username: '',
            mode: mode,
            password: '',
            confirmPassword: '',
            showInstructions: false,
            resetDone: false,
            isProcessingLogin: false
        };
        
        this.login = this.login.bind(this);
        this.signUp = this.signUp.bind(this);
        this.reset = this.reset.bind(this);
        this.setNewPassword = this.setNewPassword.bind(this);
        this.handleEnter = this.handleEnter.bind(this)
    }

    login() {
        this.setState({isProcessingLogin: true})
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
                }).catch(error => {
                    this.setState({isProcessingLogin: false})
                    this.props.showNotification({title: "Something unexpected happened!", message: error.response.data.detail})
                })
            }
        }).catch(err => {
            this.setState({isProcessingLogin: false})
            if (err.response?.status === 401) {
                this.props.showNotification({title: "Login error!", message: "Incorrect username/password combination."})
            } else if (err.response?.status === 422) {
                this.props.showNotification({title: "Login error!", message: "You must enter a username and a password."})
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
                mode: 'login',
                username: '',
                password: '',
                confirmPassword: ''
            })
            Cookies.save("user_id", response.data.id, {expires: new Date(Date.now() + 30 * 86400 * 1000)})
        }).catch(err => {
            if (err.response?.status === 409) {
                this.props.showNotification({title: "Sign up error!", message: "This email address is already taken."})
            }
        })
    }

    handleEnter(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.key === 'Enter') {
            if (this.state.mode === 'login') {
                this.login()
            } else if (this.state.mode === 'sign up') {
                this.signUp()
            } else if (this.state.mode === 'reset') {
                this.reset()
            } else if (this.state.mode === 'new password') {
                this.setNewPassword()
            }
        }
    }

    reset() {
        axios.post(API_BASE + '/users/forgetpassword', {
            email: this.state.username
        }).catch(error => {
            this.props.showNotification({title: "Something unexpected happened!", message: error.response.data.detail})
        }).finally(() => {
            this.setState({ resetDone: true })
        })
    }

    setNewPassword() {
        axios.put(API_BASE + '/users/resetpassword', {
            token: this.props.resetToken,
            new_password: this.state.password
        }).then(response => {
            alert("Password changed! We will now redirect you to the login screen, where you can log in with your new password.")
            window.location.assign('/')
        })
    }

    render() { 
        const pStrength = passwordStrength<string>(this.state.password)
        const enableButton = this.state.password && this.state.password === this.state.confirmPassword && pStrength.contains.length === 4

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
            <div className='login-button-container'>
                {this.state.isProcessingLogin ? 
                    <button disabled className='login-processing-button'><img src="/assets/login-loading.svg"></img></button> :
                    <button className='login-button generic-button' onClick={this.login}>Log In</button>
                }
            </div>
            <div className='signup-message'>Don't have an account?<a href='#' onClick={() => this.setState({
                mode: 'sign up',
                password: ''
            })}>Sign Up</a></div>
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
                <div className='login-button-container'>
                    <button className='login-button generic-button' disabled={!enableButton} onClick={this.signUp}>Sign Up</button>
                </div>
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
                <div style={{margin: "10px 0px 20px", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <button disabled={!this.state.username} className='login-button reset-button' onClick={this.reset}>Reset Password</button>
                    <span style={{fontSize: '13px'}}>
                        Or <a href='#' onClick={() => this.setState({ mode: 'login', resetDone: false })}>Cancel</a>
                    </span>
                </div>
            }
        </div>

        const instructionScreen = <div className='login-fields'>
            Please check your inbox to verify your account.
            <br />
            <div style={{textAlign: 'center'}}>
                <a href="#" onClick={() => this.setState({ mode: 'login', showInstructions: false, password: '', username: '' })}>Return to Login</a>
            </div>
        </div>

        const newPasswordScreen = <div className='login-fields'>
            <h3>Password Reset</h3>
            <fieldset>
                <label htmlFor='email'>Email</label>
                <input type="email" name='email' className='textfield login-field' disabled value={this.state.username} />
                <div style={{height: '20px'}} />

                <label htmlFor='password'>New Password</label>
                <br />
                <input type="password" name="password" className='textfield login-field' value={this.state.password} onChange={e => this.setState({ password: e.target.value })} />
                {(pStrength.contains.length < 4 || this.state.password.length < 8) && <div style={{fontSize: '13px', color: 'var(--lighter-text-color)', margin: '2px 0px', width: 320}}>
                    Your new password must be at least 8 characters long and contains:
                    <div className='password-warning-container'>
                        <div style={{color: pStrength.contains.includes("uppercase") ? 'inherit' : 'red'}}>At least 1 uppercase letter</div>
                        <div style={{color: pStrength.contains.includes("lowercase") ? 'inherit' : 'red'}}>At least 1 lowercase letter</div>
                        <div style={{color: pStrength.contains.includes("number") ? 'inherit' : 'red'}}>At least 1 number</div>
                        <div style={{color: pStrength.contains.includes("symbol") ? 'inherit' : 'red'}}>At least 1 symbol</div>
                    </div>
                </div>}
                <div style={{height: '20px'}} />

                <label htmlFor='password'>Confirm Password</label>
                <br />
                <input type="password" name="password" className='textfield login-field' value={this.state.confirmPassword} onChange={e => {
                    this.setState({
                        confirmPassword: e.target.value,
                        confirmWarning: e.target.value === this.state.password ? undefined : "Passwords do not match."
                    })
                }} />
                {this.state.confirmWarning && <div className='warning'>
                    {this.state.confirmWarning}
                </div>}
                <div style={{textAlign: 'center'}}>
                    <button className='login-button reset-button' disabled={!enableButton} onClick={this.setNewPassword}>Save Password</button>
                </div>
            </fieldset>
        </div>

        const accountVerified  = <div className='login-fields'>
            {this.props.verificationToken && <Verification token={this.props.verificationToken}/>}
        </div>

        let rightScreen: JSX.Element
        if (this.state.mode === 'login') {
            rightScreen = this.state.showInstructions ? instructionScreen : loginScreen
        } else if (this.state.mode === 'sign up') {
            rightScreen = signupScreen
        } else if (this.state.mode === 'reset') {
            rightScreen = resetScreen
        } else if (this.state.mode === 'new password') {
            rightScreen = newPasswordScreen
        } else if (this.state.mode === 'verified') {
            rightScreen = accountVerified
        } else {
            rightScreen = <Fragment />
        }
 
        return <div className='center-screen login-screen'>
            <div className='left'>
                <div className='container'>
                    <img src="/assets/logo.svg" width="100px" />
                    <h1>Yuse.ai</h1>
                    <div>Welcome to Yuse.ai, where you can use AIs productively and communicate with AIs seamlessly</div>
                </div>
            </div>
            <div className='right' onKeyDown={this.handleEnter}>
                {rightScreen}
            </div>
        </div>;
    }
}
 
export function Login(props: LoginProps) {
    const showNotification = useNotification();
    return <LoginImpl {...props} showNotification={showNotification}/>
};
export default Login;