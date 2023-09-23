import React, { Fragment } from 'react'
import SideBar from './SideBar/SideBar';
import SplitView from 'react-split'
import './MainView.css'
import { ChatMetadata, Tag } from '../Interfaces';
import ChatSplitView from './ChatSplitView/ChatSplitView';
import { SERVER, getUserId } from '../Constants';
import Settings from '../Settings/Settings';
import Login from '../Login/Login';
import Cookies from 'react-cookies'
import OnboardingScreen from '../Components/OnboardingScreen/OnboardingScreen';

interface MainViewProps {
    resetPasswordToken?: string
    verificationToken?: string
}
 
interface MainViewState {
    showLoginScreen: boolean
    currentTabIndex: number
    chatHistory?: ChatMetadata[]
    tagList?: Tag[]
    selectedTagIds: Set<string>
    showOnboardingScreen: boolean
}
 
class MainView extends React.Component<MainViewProps, MainViewState> {

    // Initial sizes (percentages) of the splits
    splitSizes = [15, 85]

    chatSplitViewRef: { current: ChatSplitView | null } = { current: null }
    resizeTimer?: any

    constructor(props: MainViewProps) {
        super(props);

        document.title = "Conversations"
        this.state = {
            showOnboardingScreen: false,
            showLoginScreen: !Cookies.load('access_token') || !Cookies.load('user_id') || this.props.resetPasswordToken !== undefined || this.props.verificationToken !== undefined,
            currentTabIndex: 0,
            selectedTagIds: new Set()
        };
    }

    componentDidMount(): void {
        const userId = getUserId()
        if (userId === undefined || this.state.showLoginScreen) {
            this.setState({ tagList: [], showLoginScreen: true })
            return
        }
        SERVER.get(`/users/${userId}/tags`)
        .then(response => {
            this.setState({
                tagList: response.data
            })
        }).catch(err => {
            if (err.response?.status === 401 || err.response?.status === 400) {
                this.setState({ showLoginScreen: true, tagList: [] })
            }
        })

        // Determine whether to show onboarding popups for current user
        SERVER.get(`/users/${userId}/onboardinghistory/seen_onboarding_education`)
        .then(response => {
            this.setState({
                showOnboardingScreen: response.data.count === 0
            })
            setTimeout(() => {
                const sidebar = document.querySelector(".sidebar") as HTMLDivElement
                sidebar.style.width = `${sidebar.clientWidth}px`
                const mainContent = document.querySelector(".main-content") as HTMLDivElement
                mainContent.style.width = `calc(100% - 4px - ${sidebar.clientWidth}px)`
            }, 100)
        })
        
        window.onresize = (ev: UIEvent) => {
            this.chatSplitViewRef.current?.updateSplitStyles()
        }
    }

    render() { 
        if (this.state.tagList === undefined) {
            return <Fragment />
        }
        let contentView: JSX.Element = <div></div>
        switch (this.state.currentTabIndex) {
        case 0:
            contentView = <ChatSplitView ref={this.chatSplitViewRef} availableTags={this.state.tagList} selectedTagIds={this.state.selectedTagIds} isTrash={false} addNewTag={(tag: Tag) => {
                this.forceUpdate()
            }} />
            break
        case 1:
            contentView = <ChatSplitView ref={this.chatSplitViewRef} availableTags={this.state.tagList} selectedTagIds={this.state.selectedTagIds} isTrash={true} addNewTag={(tag: Tag) => {
                this.forceUpdate()
            }} />
            break
        case 2:
            contentView = <Settings />
            break
        default:
            break
        }

        const overlayStyles: React.CSSProperties = {
            filter: 'blur(10px)',
            pointerEvents: 'none'
        }
        
        return <Fragment>
            <SplitView className='center-screen split'
                direction='horizontal'
                minSize={[208, 496]}
                maxSize={[320, Infinity]}
                sizes={this.splitSizes}
                snapOffset={0} gutterSize={4}
                style={{...(this.state.showLoginScreen ? overlayStyles : {})}}
                onDragStart={() => {
                    this.chatSplitViewRef.current?.updateSplitStyles()
                }}
                onDrag={sizes => {
                    this.splitSizes = sizes
                    this.chatSplitViewRef.current?.updateSplitSizes()
                }}
                onDragEnd={() => {
                    // Fix sidebar width after drag ends
                    const sidebar = document.querySelector(".sidebar") as HTMLDivElement
                    sidebar.style.width = `${sidebar.clientWidth}px`
                    const mainContent = document.querySelector(".main-content") as HTMLDivElement
                    mainContent.style.width = `calc(100% - 4px - ${sidebar.clientWidth}px)`

                    this.chatSplitViewRef.current?.updateSplitSizes()
                }}
            >
                <SideBar
                    currentTabIndex={this.state.currentTabIndex}
                    onTabChange={(newTab) => {
                        if (this.state.currentTabIndex !== newTab) {
                            this.setState({ currentTabIndex: newTab })
                        } else {
                            this.setState({ selectedTagIds: new Set() })
                        }
                    }}
                    onAddNewTag={(newTag) => {
                        this.setState({ tagList: this.state.tagList!.concat(newTag) })
                    }}
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
                    onTagDeleted={(tagId: string) => {
                        this.state.selectedTagIds.delete(tagId)
                        this.chatSplitViewRef.current?.componentDidMount()
                    }}
                />
                <div className='main-content' style={{position: 'relative'}}>
                    {contentView}
                </div>
                {/* {newTagPopover} */}
            </SplitView>;

            {this.state.showLoginScreen && <Login resetToken={this.props.resetPasswordToken} verificationToken={this.props.verificationToken} />}
            {this.state.showOnboardingScreen && !this.state.showLoginScreen &&
            <OnboardingScreen
                show={true}
                onExit={() => {
                    this.setState({ showOnboardingScreen: false })
                    SERVER.put(`/users/${getUserId()}/onboardinghistory/seen_onboarding_education`)
                }}
            >
                <div>
                    <h1>Page 1</h1>
                    <p>Welcome to LLM platform</p>
                    <br />
                    <img src="/assets/logo.png" width="100px" />
                </div>
                
                <div>
                    <h1>Page 2</h1>
                </div>
                <div><h1>Page 3</h1></div>
            </OnboardingScreen>}
        </Fragment>
    }
}
 
export default MainView;