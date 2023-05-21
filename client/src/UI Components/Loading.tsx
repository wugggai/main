import React from 'react'
import { SpinnerCircularFixed } from 'spinners-react'

interface LoadingProps {
    size?: number
}

export function Loading(props: LoadingProps) {
    return <SpinnerCircularFixed size={props.size || 40} thickness={150} speed={120} color="rgba(125, 126, 220, 0.6)" secondaryColor="rgba(0.5, 0.5, 0.5, 0.1)" className='center-content' />
}