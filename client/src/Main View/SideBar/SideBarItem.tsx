import { ReactElement } from 'react'
import './SideBar.css'

interface SideBarItemProps {
    name: string
    icon: string
    isSelected: boolean
    onSelected?: () => void
    auxiliaryView?: ReactElement
}
 
function SideBarItem(props: SideBarItemProps) {
    return <div className='item' onMouseDown={props.onSelected}>
        <div className='tint' style={{opacity: props.isSelected ? 1 : 0}}/>
        <img className='sidebar-icon' src={`/assets/${props.icon}.png`} alt={props.icon} width={20} height={20} />
        <span className='sidebar-item-title'>{props.name}</span>
        <div style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)'}}>
            {props.auxiliaryView}
        </div>
    </div>;
}
 
export default SideBarItem;