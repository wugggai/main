import React from 'react'
import './AccountPage.css'
import { Loading } from '../UI Components/Loading';
import { SERVER, getUserId } from '../Constants';
import { useNotification } from '../Components/Notification/NotificationContext';
import { NotificationProps } from '../Components/Notification/Notification';

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

type APIKeyInputBarImplProps = APIKeyInputBarProps & {showNotification: ((_: NotificationProps) => void)}


interface APIKeyInputBarState {
    isUpdatingAPIKey?: boolean // false: 'Update', true: spinner
    inputKey: string
    savedKey: string
    displayKey: string
    apiKeyErrMsg: string
    apiKeySuccessMsg: string
}

const createErrMsg = `Invalid API key, please follow the provider's instructions and double check your copy-paste`
const deleteErrMsg = "Failed to delete API key, please try again later"
const createSuccessMsg = "API key successfully verified"
const deleteSuccessMsg = "API key successfully deleted"

export interface APIKeysObject {
    provider: string
    api_key: string
}

class APIKeyInputBarImpl extends React.Component<APIKeyInputBarImplProps, APIKeyInputBarState> {
    constructor(props: APIKeyInputBarImplProps) {
        super(props);
        this.state ={
            isUpdatingAPIKey: false,
            inputKey: '',
            savedKey: props.initialKey || '',
            displayKey: props.initialKey || '',
            apiKeyErrMsg: '',
            apiKeySuccessMsg: '',
        }
        this.updateAPIKey = this.updateAPIKey.bind(this);
        this.deleteAPIKey = this.deleteAPIKey.bind(this);
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
                isUpdatingAPIKey: false,
                inputKey: '',
                savedKey: data.api_key,
                displayKey: data.api_key,
                apiKeyErrMsg: '',
                apiKeySuccessMsg: createSuccessMsg,
            })
        }).catch((error) => {
            this.props.showNotification({title: "Something unexpected happened!", message: error.code})
            this.setState({
                isUpdatingAPIKey: false,
                apiKeyErrMsg: createErrMsg,
                apiKeySuccessMsg: '',
            })
        })
    }

    deleteAPIKey() {
        const userId = getUserId()
        if (userId === undefined) {
            alert("You must be logged in to delete the API key.")
            window.location.reload()
            return
        }
        this.setState({ isUpdatingAPIKey: true })
        SERVER.delete(`/users/${userId}/apikey/providers/${this.props.provider}`)
            .then(res => {
                this.setState({
                    isUpdatingAPIKey: false,
                    savedKey: '',
                    displayKey: '',
                    apiKeyErrMsg: '',
                    apiKeySuccessMsg: deleteSuccessMsg,
                })
            })
            .catch(_ => {
                this.setState({
                    isUpdatingAPIKey: false,
                    apiKeyErrMsg: deleteErrMsg,
                    apiKeySuccessMsg: '',
                })
            })
    }

    render() {
        const inlineSpinner = <div style={{
                position: 'relative', display: 'flex', alignItems: 'center',
                justifyContent: 'center', width: '35px', height: '40px'
        }}>
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
                    displayKey: e.target.value,
                    apiKeyErrMsg: '',
                })
            }}
            onBlur={() => {
                this.setState({
                    displayKey: this.state.inputKey || this.state.savedKey
                })
                if (this.state.inputKey === "" && this.state.savedKey) {
                    this.setState({
                        isUpdatingAPIKey: false,
                    })
                }
            }}
            value={this.state.displayKey}
        />
        const updateButton = <button
            onClick={() => {this.updateAPIKey(this.state.inputKey || '')}} 
            disabled={!this.state.inputKey}>
            Update
        </button>
        const deleteButton = <button className='warning-button'
            onClick={() => {this.deleteAPIKey()}} 
            disabled={!this.state.savedKey}>
            Delete
        </button>
        const buttons = <div className="horizontal-container">
            {updateButton} {deleteButton}
        </div>
        const spinnerOrButtons = <div>{this.state.isUpdatingAPIKey ? inlineSpinner : buttons}</div>
        let errOrSuccessMessage = <div className='error-message'></div>
        if (this.state.apiKeyErrMsg) {
            errOrSuccessMessage = <div className='error-message'>{this.state.apiKeyErrMsg}</div>
        } else if (this.state.apiKeySuccessMsg) {
            errOrSuccessMessage = <div className='success-message'>{this.state.apiKeySuccessMsg}</div>
        }
        
        return <table className='settings-table'>
            <colgroup>
                <col style={{width: '272px'}} />
                <col />
            </colgroup>
            <tbody>
                <tr>
                    <td>
                        {title}
                        {caption}
                    </td>
                    <td>
                        <div className='spacer'></div>
                        <div className="horizontal-container">
                            {inputbox} {spinnerOrButtons}
                        </div>
                        {errOrSuccessMessage}
                    </td>
                </tr>
            </tbody> 
        </table>
    }
}

export function APIKeyInputBar(props: APIKeyInputBarProps) {
    const showNotification = useNotification();
    return <APIKeyInputBarImpl {...props} showNotification={showNotification}/>
};
export default APIKeyInputBar;