import { Fragment, useEffect, useState } from 'react'
import { SpinnerCircularFixed } from 'spinners-react'

interface LoadingProps {
    size?: number

    /** Number of milliseconds to wait before making the animation visible. Default is 200. */
    delay?: number
}

export function Loading(props: LoadingProps) {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true)
        }, props.delay ?? 200)

        return () => clearTimeout(timer)
    })

    if (showContent) {
        return <SpinnerCircularFixed size={props.size || 40} thickness={150} speed={120} color="rgba(125, 126, 220, 0.6)" secondaryColor="rgba(0.5, 0.5, 0.5, 0.1)" />
    } else {
        return <Fragment />
    }
}