import React, { Fragment, useRef, useState } from 'react'
import { Tag, localToGlobal } from '../../Interfaces'

interface TagProps {
    tags: Tag[]
    onSelect: (index: number, shifted: boolean) => void
    currentSelection: Set<string>
}

export function Tags(props: TagProps) {
    return <div className='tags'>
        {props.tags.map((tag, i) => {
            return TagItem(tag.name, tag.color, i, (e) => props.onSelect(i, e.shiftKey), props.currentSelection.has(tag.id))
        })}
    </div>
}

function TagItem(name: string, color: string, key: number, onSelect: (e: React.MouseEvent) => void, isSelected: boolean) {
    const [showPopupMenu, setShowPopupMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState([0, 0]);
    const imgRef = useRef<HTMLImageElement>(null);
    
    return <Fragment>
        <div className='tag-item' onClick={onSelect} key={key}>
        <div className='tint' style={{opacity: isSelected ? 1 : 0}} />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17.4V6.6C3 6.26863 3.26863 6 3.6 6H16.6789C16.8795 6 17.0668 6.10026 17.1781 6.26718L20.7781 11.6672C20.9125 11.8687 20.9125 12.1313 20.7781 12.3328L17.1781 17.7328C17.0668 17.8997 16.8795 18 16.6789 18H3.6C3.26863 18 3 17.7314 3 17.4Z" fill={color} stroke={color} strokeWidth="1.5"/>
        </svg>
        <span className='tag-name'>{name}</span>
        <img src="/assets/menu-dots.png" width={25} ref={imgRef} className='tag-item-menu-icon' style={{display: showPopupMenu ? "block" : undefined}} onClick={e => {
            setShowPopupMenu(!showPopupMenu)
            if (!showPopupMenu) {
                const position = localToGlobal(imgRef.current!)
                setMenuPosition([position.left, position.bottom])
            }
        }} />

    </div>
    {showPopupMenu && <div style={{position: "fixed", left: 0, right: 0, top: 0, bottom: 0, zIndex: 9}} onClick={() => setShowPopupMenu(false)} />}
    {showPopupMenu && <div className='tag-popup-menu' style={{
        left: menuPosition[0],
        top: menuPosition[1]
    }}>
        <button>Edit</button>
        <button>Delete</button>
    </div>}
    </Fragment>
}