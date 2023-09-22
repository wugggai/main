import React, { Fragment } from 'react'
import './SideBar.css'
import SideBarItem from './SideBarItem'
import { Tags } from './Tags'
import { Color, TwitterPicker } from 'react-color'
import { Tag, localToGlobal } from '../../Interfaces'
import axios from 'axios'
import * as uuid from "uuid"
import { SERVER, getUserId } from '../../Constants'
import { useNotification } from '../../Components/Notification/NotificationContext'
import { NotificationProps } from '../../Components/Notification/Notification'

interface SideBarProps {
    currentTabIndex: number
    onTabChange: (newTabIndex: number) => void
    currentTags: Tag[]
    onAddNewTag: (tag: Tag) => void
    onTagSelected: (index: number, shifted: boolean) => void
    onTagDeleted: (tagId: string) => void
    selectedTagIds: Set<string>
}
 
type SideBarImplProps = SideBarProps & {showNotification: ((_: NotificationProps) => void)}

interface SideBarState {
    currentTabIndex: number
    newTagPopoverAnchor?: { x: number, y: number }
    newTagColor?: string
    newTagName: string
    isAddingTag: boolean
}
 
class SideBarImpl extends React.Component<SideBarImplProps, SideBarState> {
    constructor(props: SideBarImplProps) {
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
        const userId = getUserId()
        SERVER.post(`/users/${userId}/tags`, {
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
        }).catch((error) => {
            this.props.showNotification({title: "Something unexpected happened!", message: "Unexpected error."})

        })
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

        const topTabs = ["Chats", "Trash"]
        const bottomTabs = ["Settings"]
        return <div className='sidebar' onClick={() => this.setState({ newTagPopoverAnchor: undefined })}>
            <div className='top-section'>
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
                <hr className='divider' />
                <SideBarItem disableHoverState name="Tags" icon="tags" isSelected={false} auxiliaryView={
                    <img src="/assets/plus.svg" id="add-tag-button" onClick={(e) => {
                        e.stopPropagation()
                        const target = e.target as HTMLImageElement
                        // this.props.onNewTagButtonTriggered({x: target.x, y: target.y })
                        if (this.state.newTagPopoverAnchor === undefined) {
                            let rect = localToGlobal(e.currentTarget)
                            this.setState({ newTagPopoverAnchor: {
                                x: rect.left,
                                y: rect.top
                            } })
                        } else {
                            this.setState({ newTagPopoverAnchor: undefined })
                        }
                    }}/>
                } />
                <Tags tags={this.props.currentTags} onSelect={this.props.onTagSelected} currentSelection={this.props.selectedTagIds} onTagDeleted={this.props.onTagDeleted}/>
                { this.state.newTagPopoverAnchor && <div style={{position: 'fixed', zIndex: 100, left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#00000020'}} onClick={(e) => {this.setState({ newTagPopoverAnchor: undefined }); e.stopPropagation()}}>
                    {newTagPopover}
                </div> }
            </div>
            <div className='bottom-section'>
                <hr className='divider' />
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
        </div>
    }
}
 
export function SideBar(props: SideBarProps) {
    const showNotification = useNotification();
    return <SideBarImpl {...props} showNotification={showNotification}/>
};
export default SideBar;