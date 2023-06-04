import React, { Fragment } from 'react'
import './SideBar.css'
import SideBarItem from './SideBarItem'
import { Tags } from './Tags'
import { Color, TwitterPicker } from 'react-color'
import { Tag } from '../../Interfaces'
import axios from 'axios'
import * as uuid from "uuid"
import { API_BASE, TEST_USER_ID } from '../../Constants'

interface SideBarProps {
    currentTabIndex: number
    onTabChange: (newTabIndex: number) => void
    currentTags: Tag[]
    onAddNewTag: (tag: Tag) => void
    onTagSelected: (index: number, shifted: boolean) => void
    selectedTagIds: Set<string>
}
 
interface SideBarState {
    currentTabIndex: number
    newTagPopoverAnchor?: { x: number, y: number }
    newTagColor?: string
    newTagName: string
    isAddingTag: boolean
}
 
class SideBar extends React.Component<SideBarProps, SideBarState> {
    constructor(props: SideBarProps) {
        super(props);
        this.state = {
            currentTabIndex: 0,
            newTagName: '',
            isAddingTag: false
        };
        this.addTag = this.addTag.bind(this);
    }

    addTag() {
        this.setState({ isAddingTag: true })
        let tagID = uuid.v4()
        console.log(tagID)
        axios.post(API_BASE + `/users/${TEST_USER_ID}/tags`, {
            name: this.state.newTagName,
            color: this.state.newTagColor!
        }).then(response => {
            this.setState({
                isAddingTag: false,
                newTagName: '',
                newTagColor: undefined,
                newTagPopoverAnchor: undefined
            })
            let newTag = response.data as Tag
            this.props.onAddNewTag(newTag)
        })
        // this.props.onAddNewTag({ name: this.state.newTagName, color: this.state.newTagColor!, uuid: '' })
        // this.setState({ newTagName: '', newTagColor: undefined, newTagPopoverAnchor: undefined })
    }

    render() {
        let newTagPopover = <Fragment />
        if (this.state.newTagPopoverAnchor) {
            newTagPopover = <div className='new-tag-popover' style={{
                top: this.state.newTagPopoverAnchor.y + 20,
                left: this.state.newTagPopoverAnchor.x - 140 + 12
            }} onClick={(e) => e.stopPropagation()}>
                <input type="text" placeholder='New Tag Name' className='textfield new-tag-textfield' onChange={(e) => this.setState({ newTagName: e.target.value })} />
                <TwitterPicker triangle='hide' className='tag-color-picker' color={this.state.newTagColor || 'fff'} onChange={(c) => this.setState({ newTagColor: c.hex })} styles={{default: {
                    body: {
                        padding: '8px',
                        paddingLeft: '12px'
                    },
                }}}/>
                <button className='generic-button' disabled={this.state.newTagName.length === 0 || this.state.newTagColor === undefined || this.state.isAddingTag} onClick={this.addTag}>{this.state.isAddingTag ? "Adding Tag..." : "Add Tag"}</button>
            </div>
        }

        const topTabs = ["Chats", "Favorites", "Trash"]
        const bottomTabs = ["Settings", "Discord"]
        return <div className='sidebar' onClick={() => this.setState({ newTagPopoverAnchor: undefined })}>
            <div style={{height: '50px'}} />
            {
                topTabs.map((tab, i) => {
                    return <SideBarItem
                        name={tab}
                        icon={tab.toLowerCase()}
                        isSelected={this.props.currentTabIndex === i}
                        key={i}
                        onSelected={() => this.props.onTabChange(i)}
                    />
                })
            }
            <hr />
            <SideBarItem name="Tags" icon="tags" isSelected={false} auxiliaryView={
                <img src="/assets/plus.png" id="add-tag-button" onClick={(e) => {
                    e.stopPropagation()
                    const target = e.target as HTMLImageElement
                    // this.props.onNewTagButtonTriggered({x: target.x, y: target.y })
                    if (this.state.newTagPopoverAnchor === undefined)
                        this.setState({ newTagPopoverAnchor: target })
                    else
                        this.setState({ newTagPopoverAnchor: undefined })
                }}/>
            } />
            <Tags tags={this.props.currentTags} onSelect={this.props.onTagSelected} currentSelection={this.props.selectedTagIds}/>
            { newTagPopover }

            <div style={{position: 'absolute', bottom: '30px', width: '100%'}}>
                {
                    bottomTabs.map((tab, i) => {
                        return <SideBarItem
                            name={tab}
                            icon={tab.toLowerCase()}
                            isSelected={this.props.currentTabIndex===i + topTabs.length}
                            key={i}
                            onSelected={() => this.props.onTabChange(i + topTabs.length)}
                        />
                    })
                }
            </div>
        </div>;
    }
}
 
export default SideBar;