import React, { Fragment, useRef, useState } from 'react'
import { Tag, localToGlobal } from '../../Interfaces'
import { SERVER } from '../../Constants'

interface TagProps {
    tags: Tag[]
    onSelect: (index: number, shifted: boolean) => void
    onTagDeleted: (tagId: string) => void
    currentSelection: Set<string>
}

export function Tags(props: TagProps) {
    const [editingRow, setEditingRow] = useState<number | undefined>(undefined);
    const [popupMenuRow, setPopupMenuRow] = useState<number | undefined>(undefined);
    const [menuPosition, setMenuPosition] = useState([0, 0]);
    const tagNameRefs = useRef<Array<HTMLSpanElement | null>>(Array(props.tags.length).fill(null));
    const menuImgRefs = useRef<Array<HTMLSpanElement | null>>(Array(props.tags.length).fill(null));

    function updateTag(tag: Tag, newName: string) {
        SERVER.put(`/tags/${tag.id}`, { name: newName, color: tag.color }).then(response => {
            console.log(response.data)
        })
    }

    function deleteTag(tag: Tag, index: number) {
        SERVER.delete(`/tags/${tag.id}`).then(response => {
            console.log(response.data)
        }).then(_ => {
            props.onTagDeleted(tag.id)
        }).catch(err => {
            console.log(err)
        })
    }

    return <div className='tags'>
        {props.tags.map((tag, i) => {
            return <Fragment key={i}>
                <div className='tag-item' onClick={(e) => props.onSelect(i, e.shiftKey) } key={i}>
                <div className='tint' style={{opacity: props.currentSelection.has(tag.id) ? 1 : 0}} />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.4V6.6C3 6.26863 3.26863 6 3.6 6H16.6789C16.8795 6 17.0668 6.10026 17.1781 6.26718L20.7781 11.6672C20.9125 11.8687 20.9125 12.1313 20.7781 12.3328L17.1781 17.7328C17.0668 17.8997 16.8795 18 16.6789 18H3.6C3.26863 18 3 17.7314 3 17.4Z" fill={tag.color} stroke={tag.color} strokeWidth="1.5" />
                </svg>
                <span className='tag-name'
                ref={e => tagNameRefs.current[i] = e} contentEditable={editingRow === i} onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.preventDefault()
                        tagNameRefs.current![i]!.blur()
                    }
                }}
                onBlur={() => {
                    setEditingRow(undefined)
                    updateTag(tag, tagNameRefs.current![i]!.innerText)
                }}>{tag.name}</span>
                <img src="/assets/menu-dots.png" width={25} ref={(e) => menuImgRefs.current[i] = e} className='tag-item-menu-icon' style={{
                    display: popupMenuRow === i ? "block": undefined,
                    opacity: popupMenuRow === i ? 1 : undefined,
                    backgroundColor: popupMenuRow === i ? 'var(--tag-icon-highlight)' : undefined
                }} onClick={e => {
                    e.stopPropagation()
                    setPopupMenuRow(popupMenuRow === undefined ? i : undefined)
                    if (popupMenuRow === undefined) {
                        const position = localToGlobal(menuImgRefs.current![i]!)
                        setMenuPosition([position.left, position.bottom])
                    }
                }} />

            </div>
            {popupMenuRow === i && <div style={{position: "fixed", left: 0, right: 0, top: 0, bottom: 0, zIndex: 9}} onClick={() => setPopupMenuRow(undefined)} />}
            {popupMenuRow === i && <div className='tag-popup-menu' style={{
                left: menuPosition[0],
                top: menuPosition[1]
            }}>
                <button onClick={() => {
                    setEditingRow(i)
                    setPopupMenuRow(undefined)
                    setTimeout(() => {
                        const range = document.createRange()
                        range.selectNodeContents(tagNameRefs.current![i]!)
                        window.getSelection()?.removeAllRanges()
                        window.getSelection()?.addRange(range)
                    }, 1)
                }}>Edit</button>
                <button onClick={() => {
                    setPopupMenuRow(undefined)
                    deleteTag(tag, i)
                }}>Delete</button>
            </div>}
            </Fragment>
        })}
    </div>
}
