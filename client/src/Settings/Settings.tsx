import React from 'react'
import TabView from '../Components/TabView';
import AccountPage from './Account Page';
import APIKeysPage from './APIKeys Page';

interface SettingsProps {
    
}
 
interface SettingsState {
    
}
 
class Settings extends React.Component<SettingsProps, SettingsState> {
    constructor(props: SettingsProps) {
        super(props);
        this.state = {};
    }
    render() { 
        return <div className='generic-container' style={{padding: '20px'}}>
            <h1>Settings</h1>
            <TabView tabs={[
                {title: "Account", view: <AccountPage />},
                {title: "API Keys", view: <APIKeysPage />},
                {title: "Display", view: <div />}
            ]} />
        </div>;
    }
}
 
export default Settings;