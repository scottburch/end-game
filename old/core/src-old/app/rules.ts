export type Rule = {
    reader: string    // path to user that can read
    writer: string   // path to user that can write
    ownerPath: string
    sig: string
}