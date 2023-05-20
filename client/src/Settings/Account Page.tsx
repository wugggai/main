import React from 'react'
import './AccountPage.css'

interface AccountPageProps {
    
}
 
interface AccountPageState {
    
}
 
class AccountPage extends React.Component<AccountPageProps, AccountPageState> {
    constructor(props: AccountPageProps) {
        super(props);
        this.state = {

        };
    }
    render() { 
        return <table className='settings-table'>
            <colgroup>
                <col style={{width: '300px'}} />
                <col />
            </colgroup>
            <tr>
                <td>
                    <div>Email</div>
                    <div className='caption'>this is the same email you use for signing in</div>
                </td>
                <td><input type="email" placeholder='name@example.com' className='textfield settings-textfield' autoCorrect='false'/></td>
            </tr>
            <tr>
                <td>Password</td>
                <td><input type="password" placeholder='Password' className='textfield settings-textfield'/><button>Change</button></td>
            </tr>
        </table>;
    }
}
 
export default AccountPage;