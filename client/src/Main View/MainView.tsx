import React, { Fragment } from 'react'
import SideBar from './SideBar/SideBar';
import SplitView from 'react-split'
import './MainView.css'
import ChatPreview from './ChatSplitView/ChatPreview/ChatPreview';
import { ChatMetadata, Tag } from '../Interfaces';
import { SpinnerCircularFixed } from 'spinners-react';
import ChatSplitView from './ChatSplitView/ChatSplitView';
import { Loading } from '../UI Components/Loading';
import axios from 'axios';
import { API_BASE, SERVER, TEST_USER_ID } from '../Constants';
import Settings from '../Settings/Settings';
import Login from '../Login/Login';

interface MainViewProps {
    
}
 
interface MainViewState {
    showLoginScreen: boolean
    currentTabIndex: number
    chatHistory?: ChatMetadata[]
    tagList?: Tag[]
    selectedTagIds: Set<string>
}
 
class MainView extends React.Component<MainViewProps, MainViewState> {

    splitSizes = [16, 84]

    constructor(props: MainViewProps) {
        super(props);

        document.title = "Conversations"
        this.state = {
            showLoginScreen: false,
            currentTabIndex: 0,
            selectedTagIds: new Set()
        };
    }

    componentDidMount(): void {
        SERVER.get(`/users/${TEST_USER_ID}/tags`).then(response => {
            console.log("tags:", response.data)
            this.setState({
                tagList: response.data
            })
        }).catch(err => {
            if (err.response?.status === 401) {
                this.setState({ showLoginScreen: true })
            }
        })
    }

    render() { 
        if (this.state.tagList === undefined) {
            return <Loading />
        }
        let contentView: JSX.Element = <Loading />
        switch (this.state.currentTabIndex) {
        case 0:
            contentView = <ChatSplitView availableTags={this.state.tagList} selectedTagIds={this.state.selectedTagIds} isTrash={false} />
            break
        case 2:
            contentView = <ChatSplitView availableTags={this.state.tagList} selectedTagIds={this.state.selectedTagIds} isTrash={true} />
            break
        case 3:
            contentView = <Settings />
            break
        default:
            break
        }

        const overlayStyles: React.CSSProperties = {
            // filter: 'blur(10px)',
            // pointerEvents: 'none'
        }
        
        return <Fragment>
            <SplitView className='center-screen split'
                direction='horizontal'
                minSize={[210, 500]}
                maxSize={[310, Infinity]} sizes={this.splitSizes}
                snapOffset={0} gutterSize={4}
                style={{minHeight: '560px', minWidth: '800px', ...overlayStyles}}
                onDrag={newSizes => this.splitSizes = newSizes }
            >
                <SideBar
                    currentTabIndex={this.state.currentTabIndex}
                    onTabChange={(newTab) => this.setState({ currentTabIndex: newTab })}
                    onAddNewTag={(newTag) => this.setState({ tagList: this.state.tagList!.concat(newTag) })}
                    currentTags={this.state.tagList!}
                    selectedTagIds={this.state.selectedTagIds}
                    onTagSelected={(i, shifted) => {
                        if (shifted) {
                            if (this.state.selectedTagIds.has(this.state.tagList![i].id)) {
                                this.state.selectedTagIds.delete(this.state.tagList![i].id)
                            } else {
                                this.state.selectedTagIds.add(this.state.tagList![i].id)
                            }
                        } else {
                            if (this.state.selectedTagIds.size === 1 && this.state.selectedTagIds.has(this.state.tagList![i].id)) {
                                this.state.selectedTagIds.clear()
                            } else {
                                this.state.selectedTagIds.clear()
                                this.state.selectedTagIds.add(this.state.tagList![i].id)
                            }
                        }
                        this.forceUpdate()
                    }}
                />
                <div style={{position: 'relative'}}>
                    {contentView}
                </div>
                {/* {newTagPopover} */}
            </SplitView>;

            {this.state.showLoginScreen && <Login />}
        </Fragment>
    }
}
 
export default MainView;