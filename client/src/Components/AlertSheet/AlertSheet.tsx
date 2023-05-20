import React, { Fragment } from 'react';
import './AlertSheet.css'

interface AlertSheetProps {
    show: boolean
    onClickedOutside?: () => void
    width?: string
    title?: string
    message?: string
    allowScroll?: boolean
    buttons?: {
        title: string
        onClick: () => void
        disabled?: boolean
        type: "normal" | "default" | "default-hollow" | "destructive"
    }[]
    children?: JSX.Element[]
}

class AlertSheet extends React.Component<AlertSheetProps> {
    render() { 
        return (
            <div className='alert-sheet-background' onClick={ this.props.onClickedOutside } style={{opacity: this.props.show ? 1 : 0, pointerEvents: this.props.show ? 'auto' : 'none' }}>
                <div className='alert-sheet-content' style={{width: this.props.width || '365px', overflow: (this.props.allowScroll === false) ? 'visible' : undefined}} onClick={(e) => { e.stopPropagation() }}>
                    <Fragment>
                        <div className='alert-title'>{this.props.title}</div>
                        {this.props.message ? <p className='alert-message'>{this.props.message}</p> : <Fragment />}
                        <div className='alert-children'>{this.props.children}</div>
                        <div className='alert-button-group'>
                            {this.props.buttons?.map((buttonInfo, i) => {
                                return <button onClick={buttonInfo.onClick} className={`alert-button alert-button-${buttonInfo.type}`} disabled={buttonInfo.disabled} key={i}>{buttonInfo.title}</button>
                            })}
                        </div>
                    </Fragment>
                </div>
            </div>
        )
    }
}
 
export default AlertSheet;
