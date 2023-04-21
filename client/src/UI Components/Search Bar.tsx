import React from 'react'
import './Search Bar.css'

interface SearchBarProps {
    placeholder?: string
    style?: React.CSSProperties
}

export function SearchBar(props: SearchBarProps) {
    return <input type='text' placeholder={props.placeholder ?? 'Search'} className='search-bar textfield' style={props.style} />
}