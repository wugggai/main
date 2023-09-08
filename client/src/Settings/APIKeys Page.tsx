import React from 'react'
import './AccountPage.css'
import APIKeyInputBar, { APIKeysObject } from './APIKeyInputBar'
import { SERVER, getUserId } from '../Constants';

interface APIKeysPageProps {
    
}
 
interface APIKeysPageState {
    isLoaded: boolean
}

class APIKeysPage extends React.Component<APIKeysPageProps, APIKeysPageState> {
    initialOpenAIKey: string
    initialStableDiffusionKey: string

    constructor(props: APIKeysPageProps) {
        super(props);
        this.state = {
            isLoaded: false
        };
        this.initialOpenAIKey = ''
        this.initialStableDiffusionKey = ''
    }

    componentDidMount(): void {
        const userId = getUserId()
        if (userId === undefined) {
            alert("You must be logged in to set the API key.")
            window.location.reload()
            return
        }

        // Should fetch all keys in one request
        SERVER.get(`/users/${userId}/apikey`)
        .then(response => {
            this.setState({ isLoaded: true })
            response.data.forEach((e: APIKeysObject) => {
                if (e.provider === "openai") {
                    this.initialOpenAIKey = e.api_key
                } else if (e.provider === "stable_diffusion") {
                    this.initialStableDiffusionKey = e.api_key
                }
            })
        })
        .catch(_ => {
            this.setState({ isLoaded: true })
            this.initialOpenAIKey = ''
            this.initialStableDiffusionKey = ''
        })
    }

    render() {
        if (!this.state.isLoaded) {
            return <div></div>
        }
        return <div>
            <APIKeyInputBar
                provider='openai'
                title='OpenAI API Key'
                keyManagementLink='https://platform.openai.com/account/api-keys'
                keyManagementSiteName='openai.com'
                inputPlaceholder='sk-...'
                initialKey={this.initialOpenAIKey}
            ></APIKeyInputBar>
            <div className="spacer"></div>
            <APIKeyInputBar
                provider='stable_diffusion'
                title='Stable Diffusion API Key'
                keyManagementLink='https://stablediffusionapi.com/settings/api'
                keyManagementSiteName='stablediffusionapi.com'
                initialKey={this.initialStableDiffusionKey}
            ></APIKeyInputBar>
        </div>
    }
}
 
export default APIKeysPage;
