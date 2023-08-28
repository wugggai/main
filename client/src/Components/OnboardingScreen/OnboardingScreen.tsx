import React, { Fragment } from 'react';
import './OnboardingScreen.css'

interface OnboardingScreenProps {
    onExit: () => void
    show: boolean
    children?: JSX.Element[]
}
 
interface OnboardingScreenState {
    currentPage: number
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

    nextPage(e: React.MouseEvent) {
        e.stopPropagation()
        if (this.state.currentPage + 1 < (this.props.children?.length ?? 0)) {
            this.setState({ currentPage: this.state.currentPage + 1 })
        } else {
            this.props.onExit()
        }
    }

    previousPage(e: React.MouseEvent) {
        e.stopPropagation()
        if (this.state.currentPage > 0) {
            this.setState({ currentPage: this.state.currentPage - 1 })
        }
    }

    render() { 
        return <div className='onboarding-sheet-background' tabIndex={0} style={{opacity: this.props.show ? 1 : 0, pointerEvents: this.props.show ? 'auto' : 'none' }}>
            <div className='onboarding-sheet-container'>
                <div className='onboarding-sheet-content' onClick={(e) => { e.stopPropagation() }}>
                    {this.props.children && this.props.children[this.state.currentPage]}
                </div>
                <div className='button-bar'>
                    {this.state.currentPage > 0 && <button className='previous' onClick={this.previousPage}>Previous</button>}
                    <div className='spacer' />
                    {(this.state.currentPage + 1 < (this.props.children?.length ?? 0)) ?
                        <button className='next' onClick={this.nextPage}>Next</button>
                        :
                        <button className='next' onClick={this.nextPage}>Start Using</button>
                    }
                </div>
            </div>
    </div>;
    }
}
 
export default OnboardingScreen;