import React, { Fragment } from 'react';
import './OnboardingScreen.css'
import Dropdown from 'rc-dropdown';
import ChatChooseModelMenu from '../../Main View/ChatSplitView/ChatView/ChatChooseModelMenu/ChatChooseModelMenu';
import Cookies from "react-cookies"
import { SERVER } from '../../Constants';
import 'rc-dropdown/assets/index.css';
import { ModelAndKey } from '../../Interfaces';
import MarkdownTextView from '../../UI Components/MarkdownTextView';

interface OnboardingScreenProps {
    onExit: () => void
    goToSettings: () => void
    show: boolean
}
 
interface OnboardingScreenState {
    currentPage: number
    useCustomAPIKey?: boolean
    availableModels?: ModelAndKey[]
}
 
class OnboardingScreen extends React.Component<OnboardingScreenProps, OnboardingScreenState> {
    constructor(props: OnboardingScreenProps) {
        
        super(props);
        this.state = {
            currentPage: 0
        };
        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
    }

    componentDidMount(): void {
        const userId = Cookies.load('user_id')
        SERVER.get(`/users/${userId}/models/list`).then(response => {
            this.setState({
                availableModels: response.data.model_names,
            })
        })
    }

    nextPage(e: React.MouseEvent) {
        e.stopPropagation()
        if (this.state.currentPage + 1 < 4) {
            this.setState({ currentPage: this.state.currentPage + 1 })
        } else {
            this.props.onExit()
        }
    }

    previousPage(e: React.MouseEvent) {
        e.stopPropagation()
        if (this.state.currentPage === 4) {
            this.setState({ currentPage: 2 })
        } else if (this.state.currentPage > 0) {
            this.setState({ currentPage: this.state.currentPage - 1 })
        }
    }

    getPage(index: number): JSX.Element {
        const chooseModelMenu = <div className='dropdown-models'><ChatChooseModelMenu availableModels={this.state.availableModels} onChooseModel={() => {}} disableAllModels={false}/></div>
        switch (index) {
            case 0:
                return <Fragment>
                    <div style={{backgroundColor: "#EDEDF9B2", left: 0, right: 0, top: 0, height: 290, position: "relative"}}>
                        <img src="/assets/logo.svg" width={70} className='center-content' />
                    </div>
                    <div style={{margin: "30px"}}>
                        <h3>Welcome!</h3>
                        <p>Welcome to Yuse.ai, your new home for communicating with AIs productively.</p>
                    </div>
                </Fragment>
            case 1:
                return <Fragment>
                    <div style={{
                        backgroundColor: "#EDEDF9B2", left: 0, right: 0, top: 0, height: 248, position: "relative",
                        display: "flex", columnGap: 20, justifyContent: "center"
                    }}>
                        <img src="/assets/onboarding/throw.png" width={160} style={{objectFit: "contain"}} />
                        <img src="/assets/onboarding/type.png" width={160} style={{objectFit: "contain"}} />
                    </div>
                    <div style={{margin: "30px"}}>
                        <h3>More control over your conversations with models</h3>
                        <ul>
                            <li>
                                <b>organize</b> your conversations easily using
                                <img src="/assets/onboarding/tag.png" width={20} height={20} style={{margin: "5px 5px 6px 6px", verticalAlign: "middle"}} />
                                tags
                            </li>
                            <li>
                                <b>select</b>
                                <Dropdown trigger={['click']} overlay={chooseModelMenu} animation="slide-up">
                                    <button className='select-model-button'>
                                        different AI models
                                        <img src="/assets/down.svg" width="12" style={{ marginLeft: '5px' }} />
                                    </button>
                                </Dropdown>
                                before and during conversation in two clicks
                            </li>
                        </ul>
                        <p>Please note that we only support switching between the same type of models for now (i.e. switching between different text-to-text models) for the sake of preserving chat contexts.</p>
                    </div>
                </Fragment>
            case 2:
                return <Fragment>
                    <div style={{
                        backgroundColor: "#EDEDF9B2", left: 0, right: 0, top: 0, height: 248, position: "relative",
                        display: "flex", columnGap: 20, justifyContent: "center"
                    }}>
                        <img src="/assets/onboarding/computer.png" width={160} style={{objectFit: "contain"}} />
                    </div>
                    <div style={{margin: "30px"}}>
                        <h3>Setting up</h3>
                        <MarkdownTextView rawText={`We currently support [GPT 3.5](https://platform.openai.com/docs/models/gpt-3-5), [GPT 4.0](https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo), [DALL-E](https://platform.openai.com/docs/models/dall-e), [Stable Diffusion](https://stability.ai), and [Midjourney](https://www.midjourney.com) using API service.\n\nThere are two ways you could use our platform:
1. Look for the models with **YUSE** if you do not want to use your own API keys, if you use up the free usage limit provided by us and wish to top up, please reach out via our Discord channel;
2. If you want to use your own API keys, select models with **API** after providing us with your API keys.

To give you a taste of what we offer, we are also providing you 50 free messages with each model. Have fun!`}/>
                    </div>
                </Fragment>
            case 3:
                return <Fragment>
                    <div style={{margin: "30px"}}>
                        <h3>Finally...</h3>
                        <p>You can monitor your credit/usage in <img src="/assets/onboarding/settings.png" width={20} style={{verticalAlign: "middle", marginBottom: 5}} /> Settings</p>
                        <MarkdownTextView rawText='We hope you will enjoy using our platform! If you need to top up or have any questions/comments, please reach us through our [Discord](https://discord.gg/PwCSdCcWd4) server. We look forward to hearing from you!' />
                    </div>
                </Fragment>
            case 4:
                return <Fragment>
                    <div style={{
                        backgroundColor: "#EDEDF9B2", left: 0, right: 0, top: 0, height: 248, position: "relative",
                        display: "flex", columnGap: 20, justifyContent: "center"
                    }}>
                        <div className='center-content'>TODO</div>
                    </div>

                    <div style={{margin: "30px"}}>
                        <h3>To input your API keys...</h3>
                        <ol>
                            <li>head over to <img src="/assets/onboarding/settings.png" width={20} style={{verticalAlign: "middle", marginBottom: 5}} /> settings</li>
                            <li>look for the “API Keys” tab</li>
                            <li>input your API keys and save using the “update” button, and you are done!</li>
                        </ol>
                    </div>
                </Fragment>
            default:
                return <Fragment />
        }
    }

    render() {
        let buttonBar: JSX.Element
        switch (this.state.currentPage) {
            case 0:
            case 1:
                buttonBar = <button className='next' onClick={this.nextPage}>Next</button>
                break;
            case 2:
                buttonBar = <Fragment>
                    <button className='next-alt' onClick={() => this.setState({ currentPage: this.state.currentPage + 2, useCustomAPIKey: true })}>I will use my own API keys</button>
                    <button className='next' onClick={() => this.setState({ currentPage: this.state.currentPage + 1, useCustomAPIKey: false })}>I will let YUSE take care of APIs for me</button>
                </Fragment>
                break;
            case 3:
                buttonBar = <Fragment>
                    <button className='next' onClick={this.props.onExit}>Start chatting!</button>
                </Fragment>
                break;
            case 4:
                buttonBar = <Fragment>
                    <button className='next' onClick={this.props.goToSettings}>Take me to Settings</button>
                </Fragment>
                break;
            default:
                buttonBar = <Fragment />;
        }
        return <div className='onboarding-sheet-background' tabIndex={0} style={{opacity: this.props.show ? 1 : 0, pointerEvents: this.props.show ? 'auto' : 'none' }}>
            <div className='onboarding-sheet-container' onClick={(e) => { e.stopPropagation() }}>
                {this.getPage(this.state.currentPage)}
                <div className='button-bar'>
                    {this.state.currentPage > 0 && <button className='previous' onClick={this.previousPage}>Previous</button>}
                    <div className='spacer' />
                    {buttonBar}
                </div>
            </div>
    </div>;
    }
}
 
export default OnboardingScreen;