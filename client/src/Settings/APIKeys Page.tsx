import React from 'react'
import './AccountPage.css'

interface APIKeysPageProps {
    
}
 
interface APIKeysPageState {
    
}
 
class APIKeysPage extends React.Component<APIKeysPageProps, APIKeysPageState> {
    constructor(props: APIKeysPageProps) {
        super(props);
        this.state = {

        };
    }
    render() { 
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
                <td><input type="text" placeholder='sk-....' className='textfield settings-textfield' autoCorrect='false'/></td>
            </tr>
        </table>;
    }
}
 
export default APIKeysPage;