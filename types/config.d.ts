interface SESSIONS {
    [key: string]: ColfSession
}

interface Config {
    BED_SPAM_DELAY: string
    BED_SPAM_DURATION: string
    INGAME_NAME: string
    WEBHOOK_URL: string
    FLIP_ACTION_DELAY: number
    USE_COFL_CHAT: boolean
    ENABLE_CONSOLE_INPUT: boolean
    SESSIONS: SESSIONS
    USE_WINDOW_SKIPS: boolean
}

interface ColfSession {
    id: string
    expires: Date
}
