export const fixupMentions = (text: string) =>
    text.replace(/@\[([^\]]*?)\].*?\)/g, '$1')
