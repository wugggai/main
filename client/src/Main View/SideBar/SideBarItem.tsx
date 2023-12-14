import { ReactElement } from 'react'
import './SideBarItem.css'

interface SideBarItemProps {
    name: string
    icon: string
    isSelected: boolean
    onSelected?: () => void
    auxiliaryView?: ReactElement
    disableHoverState?: boolean
    href?: string
}
 
function SideBarItem(props: SideBarItemProps) {
    function onMouseDownHandler() {!!props.href ? window.open(props.href) : props.onSelected?.()}

    return <div className={`item ${props.isSelected ? 'selected' : ''} ${!!props.disableHoverState ? '' : 'has-hover'}`} onMouseDown={onMouseDownHandler}>
        <img className='sidebar-icon' src={`/assets/${props.icon}.png`} alt={props.icon} width={20} height={20} />
        {props.name}
        <div style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)'}}>
            {props.auxiliaryView}
        </div>
    </div>;
}
 
export default SideBarItem;