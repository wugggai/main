import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone); 

export type AI = 'gpt-3.5-turbo' | 'gpt-4'

export interface Interaction {
    title: string
    id: string
    tag_ids: string[]
    last_updated: string
    creator_user_id: string
    ai_type: AI | 'echo'
}

export interface ChatMetadata {
    interaction: Interaction
    last_message: {
        message: string
        source: string
        id: string
        timestamp: string
        offset: number
    } | null // Null is only possible for new interactions created locally
}

export interface ChatHistoryItem {
    id: string
    interaction_id?: string
    source: 'user' | 'echo' | AI
    message: string
    offset: number
    timestamp: string
}

export interface ChatHistory {
    messages: ChatHistoryItem[]
}

export interface Tag {
    id: string
    name: string
    color: string
    last_used?: string
}


export function formatDate(date: string | Date | number | null): string {
    if (!date) {
        return "No Date"
    }
    const originalDate = dayjs(date)
    let formatString = 'MMMM D, h:mm A'
    if (originalDate.year() !== dayjs().year()) {
        formatString = 'MMM D, YYYY [at] h:mm A'
    }
    
    return originalDate.utc(true).tz(dayjs.tz.guess()).format(formatString)
}

export function formatTimeInterval(ms: number): string {
    const days = Math.floor(ms / 86400000)
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor(ms / 1000)
    if (days >= 1) {
        return `${days} Day${days === 1 ? "" : "s"}`
    } else if (hours >= 1) {
        return `${hours} Hour${hours === 1 ? "" : "s"}`
    } else if (minutes >= 1) {
        return `${minutes} Minute${minutes === 1 ? "" : "s"}`
    } else {
        return `${seconds} Second${seconds === 1 ? "" : "s"}`
    }
}