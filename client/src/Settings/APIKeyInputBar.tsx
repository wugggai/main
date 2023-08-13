import React from 'react'
import './AccountPage.css'
import { Loading } from '../UI Components/Loading';
import { SERVER, getUserId } from '../Constants';

interface APIKeyInputBarProps {
    provider: string
    title: string
    keyManagementLink: string
    keyManagementSiteName: string
    inputPlaceholder?: string
    // TODO: support generic HTML caption if required
    additionalCaption?: string
    initialKey?: string
}

interface APIKeyInputBarState {
    isUpdatingAPIKey?: boolean // undefined: hidden, false: 'Update', true: spinner
    savedKey: string
    inputKey: string
    apiKeyErrMsg: string
}

export interface APIKeysObject {
    provider: string
    api_key: string
}

class APIKeyInputBar extends React.Component<APIKeyInputBarProps, APIKeyInputBarState> {
    constructor(props: APIKeyInputBarProps) {
        super(props);
        this.state ={
            isUpdatingAPIKey: false,
            savedKey: props.initialKey || '',
            inputKey: '',
            apiKeyErrMsg: '',
        }
        this.updateAPIKey = this.updateAPIKey.bind(this);
    }

    updateAPIKey(key: string) {
        const userId = getUserId()
        if (userId === undefined) {
            alert("You must be logged in to set the API key.")
            window.location.reload()
            return
        }
        this.setState({ isUpdatingAPIKey: true })
        SERVER.post(`/users/${userId}/apikey/providers/${this.props.provider}`, {
            api_key: key
        }).then(res => {
            let data: APIKeysObject = res.data
            this.setState({
                isUpdatingAPIKey: undefined,
                savedKey: data.api_key,
                inputKey: '',
                apiKeyErrMsg: '',
            })
        }).catch(_ => {
            this.setState({
                isUpdatingAPIKey: false,
                apiKeyErrMsg: `Invalid API key, please follow the provider's instructions and double check your copy-paste`,
            })
        })
    }

    render() {
        const inlineSpinner = <div style={{position: 'relative', display: 'inline-block', width: '35px', height: '40px'}}>
            <Loading size={20} />
        </div>
        const title = <div>{this.props.title}</div>
        const caption = <div className='caption'>Manage keys at <a href={this.props.keyManagementLink}>{this.props.keyManagementSiteName}</a>. {this.props.additionalCaption}</div>
        const inputbox = <input type="text" 
            className='textfield settings-textfield' style={{minWidth: '300px'}} 
            placeholder={this.props.inputPlaceholder || ''} 
            autoCorrect='false' 
            onChange={(e) => {
                this.setState({ 
                    isUpdatingAPIKey: false,
                    inputKey: e.target.value, 
                })
            }}
            value={this.state.inputKey || this.state.savedKey}
        />
        const updateButton = <button 
            onClick={() => {this.updateAPIKey(this.state.inputKey || '')}} 
            disabled={!this.state.inputKey}>
            Update
        </button>
        const spinnerOrButton = <div>{this.state.isUpdatingAPIKey !== undefined && (this.state.isUpdatingAPIKey ? inlineSpinner : updateButton)}</div>
        const savedKey = <div>{this.state.savedKey}</div>
        
        return <table className='settings-table'>
            <colgroup>
                <col style={{width: '272px'}} />
                <col />
            </colgroup>
        
            <tr>
                <td>
                    {title}
                    {caption}
                </td>
                <td>
                    <div className='spacer'></div>
                    <div className="horizontal-container">
                        {inputbox} {spinnerOrButton}
                    </div>
                    <div className='error-message'>{this.state.apiKeyErrMsg}</div>
                </td>
            </tr>
        </table>
    }
}

export default APIKeyInputBar;
