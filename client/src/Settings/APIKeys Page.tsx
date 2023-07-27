import React from 'react'
import './AccountPage.css'
import { Loading } from '../UI Components/Loading';
import axios from 'axios'
import { API_BASE, SERVER, getUserId } from '../Constants';

interface APIKeysPageProps {
    
}
 
interface APIKeysPageState {
    isLoaded: boolean
    openaiAPIKey?: string | null
    stableDiffusionAPIKey?: string | null
    isUpdatingAPIKey?: boolean // undefined: hidden, false: 'Update', true: spinner
}

interface APIKeysObject {
    provider: string
    api_key: string
}
 
class APIKeysPage extends React.Component<APIKeysPageProps, APIKeysPageState> {
    constructor(props: APIKeysPageProps) {
        super(props);
        this.state = {
            isLoaded: false
        };
        this.updateAPIKey = this.updateAPIKey.bind(this);
    }

    componentDidMount(): void {
        const userId = getUserId()
        if (userId === undefined) {
            alert("You must be logged in to set the API key.")
            window.location.reload()
            return
        }

        // Should fetch all keys in one request
        axios.get(API_BASE + `/users/${userId}/apikey`)
        .then(response => {
            console.log(response)
            this.setState({ isLoaded: true })
            response.data.forEach((e: APIKeysObject) => {
                if (e.provider == "openai") {
                    this.setState({ openaiAPIKey: e.api_key })
                } else if (e.provider == "stable_diffusion") {
                    this.setState({ stableDiffusionAPIKey: e.api_key })
                }
            })
        })
        .catch(response => {
            this.setState({ openaiAPIKey: null, stableDiffusionAPIKey: null })
        })
    }

    updateAPIKey(provider: string, api_key: string) {
        const userId = getUserId()
        if (userId === undefined) {
            alert("You must be logged in to set the API key.")
            window.location.reload()
            return
        }

        this.setState({ isUpdatingAPIKey: true })
        SERVER.post(`/users/${userId}/apikey/providers/${provider}`, {
            api_key: api_key
        }).then(response => {
            this.setState({ isUpdatingAPIKey: undefined })
        })
    }

    render() { 
        
        if (!this.state.isLoaded) {
            return <Loading />
        }

        const inlineSpinner = <div style={{position: 'relative', display: 'inline-block', width: '35px', height: '40px'}}>
            <Loading size={20} />
        </div>
        return <table className='settings-table'>
            <colgroup>
                <col style={{width: '270px'}} />
                <col />
            </colgroup>
            <tr>
                <td>
                    <div>OpenAI API Key</div>
                    <div className='caption'>Manage your keys at <a href='https://platform.openai.com/account/api-keys'>openai.com</a></div>
                </td>
                <td>
                    <input type="text" placeholder='sk-....' className='textfield settings-textfield' style={{minWidth: '250px'}} autoCorrect='false' onChange={(e) => {
                        this.setState({ isUpdatingAPIKey: false, openaiAPIKey: e.target.value })}
                    } value={this.state.openaiAPIKey || ''} />
                    {this.state.isUpdatingAPIKey !== undefined && (this.state.isUpdatingAPIKey ? inlineSpinner : <button onClick={() => this.updateAPIKey("openai", this.state.openaiAPIKey || '')} disabled={!this.state.openaiAPIKey}>Update</button>)}
                </td>
            </tr>
            <tr>
                <td>
                    <div>Stable Diffusion API Key</div>
                    <div className='caption'>Manage your keys at <a href='https://stablediffusionapi.com/settings/api'>stablediffusionapi.com</a></div>
                </td>
                <td>
                    <input type="text" placeholder='' className='textfield settings-textfield' style={{minWidth: '250px'}} autoCorrect='false' onChange={(e) => {
                        this.setState({ isUpdatingAPIKey: false, stableDiffusionAPIKey: e.target.value })}
                    } value={this.state.stableDiffusionAPIKey || ''} />
                    {this.state.isUpdatingAPIKey !== undefined && (this.state.isUpdatingAPIKey ? inlineSpinner : <button onClick={() => this.updateAPIKey("stable_diffusion", this.state.stableDiffusionAPIKey || '')} disabled={!this.state.stableDiffusionAPIKey}>Update</button>)}
                </td>
            </tr>
        </table>;
    }
}
 
export default APIKeysPage;