import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone); 

export type AI = 'chatgpt' | 'gpt-4'

export interface ChatMetadata {
    ai_type: AI
    title: string
    first_message: string | null // Null is only possible for new interactions created locally
    date: number
    tags?: string[]
    id: string
}

export interface ChatHistoryItem {
    id: string
    role: 'user' | 'system' | AI
    content: string
    timestamp: number
}

export interface ChatHistory {
    messages: ChatHistoryItem[]
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
    
    return originalDate.tz(dayjs.tz.guess()).format(formatString)
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