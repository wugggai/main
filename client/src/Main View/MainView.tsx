import React, { Fragment } from 'react'
import SideBar from './SideBar/SideBar';
import SplitView from 'react-split'
import './MainView.css'
import ChatPreview from './ChatSplitView/ChatPreview/ChatPreview';
import { ChatMetadata } from '../Interfaces';
import { SpinnerCircularFixed } from 'spinners-react';
import ChatSplitView from './ChatSplitView/ChatSplitView';
import { Loading } from '../UI Components/Loading';

interface MainViewProps {
    
}
 
interface MainViewState {
    currentTabIndex: number
    chatHistory?: ChatMetadata[]
    tagList?: { name: string, color: string }[]
    selectedTag?: string
}
 
class MainView extends React.Component<MainViewProps, MainViewState> {

    splitSizes = [18, 82]

    constructor(props: MainViewProps) {
        super(props);

        document.title = "Conversations"
        this.state = {
            currentTabIndex: 0,
            tagList: [
                {name: 'storytelling', color: "#e0fde0"},
                {name: 'cooking', color: "#e0f0fd"}
            ]
        };
    }

    render() { 
        let contentView: JSX.Element = <Loading />
        switch (this.state.currentTabIndex) {
        case 0:
            contentView = <ChatSplitView />
            break
        default:
            break
        }
        
        return <SplitView className='center-screen split'
            direction='horizontal'
            minSize={[210, 500]}
            maxSize={[310, Infinity]} sizes={this.splitSizes}
            snapOffset={0} gutterSize={4}
            style={{minHeight: '560px', minWidth: '800px'}}
            onDrag={newSizes => this.splitSizes = newSizes }
        >
            <SideBar
                currentTabIndex={this.state.currentTabIndex}
                onTabChange={(newTab) => this.setState({ currentTabIndex: newTab })}
                onAddNewTag={(newTag) => this.setState({ tagList: this.state.tagList!.concat(newTag) })}
                currentTags={this.state.tagList!}
            />
            <div style={{position: 'relative'}}>
                {contentView}
            </div>
            {/* {newTagPopover} */}
        </SplitView>;
    }
}
 
export default MainView;