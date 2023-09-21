import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone); 

export type AI = 'gpt-4' | "gpt-3.5-turbo-16k" | "DALL-E2" | "stable-diffusion-v3" | "midjourney-v4"

export interface MessageSegment {
    type: string
    content: string
}

export interface Interaction {
    title: string
    id: string
    tag_ids: string[]
    last_updated: string
    creator_user_id: string
    ai_type: AI | undefined
    using_system_key: boolean
}

export interface ChatMetadata {
    interaction: Interaction
    last_message: {
        message: MessageSegment[]
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
    message: MessageSegment[]
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

export function getCurrentDateString(): string {
    return dayjs().utc().format('YYYY-MM-DDTHH:mm:ss')
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

/** Reliable way to get an element's position relative to the viewport. */
export function localToGlobal(_el: HTMLElement): { top: number, left: number, bottom: number, right: number } {
    var target = _el,
    target_width = target.offsetWidth,
    target_height = target.offsetHeight,
    target_left = target.offsetLeft,
    target_top = target.offsetTop,
    gleft = 0,
    gtop = 0,
    rect = { top: 0, left: 0, bottom: 0, right: 0 };

    var moonwalk = function(_parent: any) {
     if (!!_parent) {
         gleft += _parent.offsetLeft;
         gtop += _parent.offsetTop;
         moonwalk( _parent.offsetParent );
     } else {
         return rect = {
            top: target.offsetTop + gtop,
            left: target.offsetLeft + gleft,
            bottom: (target.offsetTop + gtop) + target_height,
            right: (target.offsetLeft + gleft) + target_width
         };
     }
 };
     moonwalk( target.offsetParent );
     return rect;
}