import React from 'react'

interface TagProps {
    tags: { name: string, color: string }[]
}

export function Tags(props: TagProps) {
    return <div className='tags'>
        {props.tags.map((tag, i) => {
            return TagItem(tag.name, tag.color, i)
        })}
    </div>
}

function TagItem(name: string, color: string, key: number) {
    return <div className='tag-item' key={key}>
        <div className='tag-box' style={{backgroundColor: color}}>
            {name}
        </div>
        <div className='tag-end' style={{borderLeft: `15px solid ${color}`}}/>
    </div>
}