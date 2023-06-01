import React from 'react'
import { Tag } from '../../Interfaces'

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
    return <div className='tag-item' onClick={onSelect} key={key}>
        <div className='tint' style={{opacity: isSelected ? 1 : 0}} />
        <span className='tag-icon'>
            <div className='tag-box' style={{backgroundColor: color}} />
            <div className='tag-end' style={{borderLeft: `7px solid ${color}`}}/>
        </span>
        <span className='tag-name'>{name}</span>
    </div>
}