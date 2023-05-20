import React from 'react'
import './TabView.css'

interface TabViewProps {
    styles?: React.CSSProperties
    tabs: {
        title: string
        view: JSX.Element
    }[]
}
 
interface TabViewState {
    selectedIndex: number
}
 
class TabView extends React.Component<TabViewProps, TabViewState> {
    constructor(props: TabViewProps) {
        super(props);
        this.state = {
            selectedIndex: 0
        };
    }
    render() {
        const tabControlItems = this.props.tabs.map((tab, i) => {
            const className = this.state.selectedIndex === i ? 'tab-item tab-item-selected' : 'tab-item'
            return <div className={className} key={i} onClick={() => this.setState({ selectedIndex: i })}>
                {tab.title}
            </div>
        })

        return <div className='tab-view' style={this.props.styles}>
            <div className='tab-control'>
                {tabControlItems}
            </div>
            <div className='view-container'>
                {this.props.tabs[this.state.selectedIndex].view}
            </div>
        </div>;
    }
}
 
export default TabView;