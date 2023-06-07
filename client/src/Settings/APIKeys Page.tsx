import React from 'react'
import './AccountPage.css'
import { Loading } from '../UI Components/Loading';
import axios from 'axios'
import { API_BASE, getUserId } from '../Constants';

interface APIKeysPageProps {
    
}
 
interface APIKeysPageState {
    openaiAPIKey?: string | null
    isUpdatingAPIKey?: boolean // undefined: hidden, false: 'Update', true: spinner
}
 
class APIKeysPage extends React.Component<APIKeysPageProps, APIKeysPageState> {
    constructor(props: APIKeysPageProps) {
        super(props);
        this.state = {

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
        axios.get(API_BASE + `/users/${userId}/apikey/providers/openai`)
        .then(response => {
            console.log(response)
            this.setState({ openaiAPIKey: response.data.api_key })
        })
        .catch(response => {
            this.setState({ openaiAPIKey: null })
        })
    }

    updateAPIKey() {
        const userId = getUserId()
        if (userId === undefined) {
            alert("You must be logged in to set the API key.")
            window.location.reload()
            return
        }

        this.setState({ isUpdatingAPIKey: true })
        axios.post(API_BASE + `/users/${userId}/apikey/providers/openai`, {
            api_key: this.state.openaiAPIKey
        }).then(response => {
            this.setState({ isUpdatingAPIKey: undefined })
        })
    }

    render() { 
        
        if (this.state.openaiAPIKey === undefined) {
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
                    {this.state.isUpdatingAPIKey !== undefined && (this.state.isUpdatingAPIKey ? inlineSpinner : <button onClick={this.updateAPIKey} disabled={!this.state.openaiAPIKey}>Update</button>)}
                </td>
            </tr>
        </table>;
    }
}
 
export default APIKeysPage;