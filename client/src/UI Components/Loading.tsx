import React from 'react'
import { SpinnerCircularFixed } from 'spinners-react'

export function Loading() {
    return <SpinnerCircularFixed size={40} thickness={150} speed={120} color="rgba(125, 126, 220, 0.6)" secondaryColor="rgba(0.5, 0.5, 0.5, 0.1)" className='center-content' />
}