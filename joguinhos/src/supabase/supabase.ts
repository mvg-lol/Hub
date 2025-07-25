import { createClient, User } from '@supabase/supabase-js'
import { Database } from '../database.types'
const supabaseUrl = 'https://ayigaknwmqjtqrsfcvvw.supabase.co'
const supabase = createClient<Database>(supabaseUrl, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5aWdha253bXFqdHFyc2ZjdnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjgxNzAsImV4cCI6MjA2ODk0NDE3MH0.dbM9RoHwMlyDStqQIRC7GaB26soVCf6Y-xrnWbUlpHQ")
const userIsMartinho = (uid: string) => Object.values(UIDsMartinho).filter(uidE => uidE === uid).length > 0
export enum UIDsMartinho {
    Github = 'bd6ace80-9173-432e-b1b6-d6512b0d2386',
    GithubVicente = '33wirV2uLFdV1eDdITiiSYs5zAH3',
}

// from https://github.com/supabase/supabase/blob/df52ea7ee0f0c76ba952ac09c6182fe79824eef0/apps/studio/components/interfaces/Auth/Users/UserListItem.utils.ts#L6
export const getUserDisplayName = (user: User | null): string => {
    if (!user || !user.user_metadata) {
        return 'Unknown User'
    }
    const {
        displayName,
        display_name,
        fullName,
        full_name,
        familyName,
        family_name,
        givenName,
        given_name,
        surname,
        lastName,
        last_name,
        firstName,
        first_name,
    } = user.user_metadata ?? {}

    const last = familyName || family_name || surname || lastName || last_name
    const first = givenName || given_name || firstName || first_name

    return (
        displayName ||
        display_name ||
        fullName ||
        full_name ||
        (first && last && `${first} ${last}`) ||
        'Unknown User'
    )
}

export default supabase
export { userIsMartinho }