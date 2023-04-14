export const splitTags = (text: string) => ({
    tags: text.match(/#[^\s]*/gi) || [],
    parts: text.split(/#[^\s]*/gi) || []
});
