export const isWorldWritable = (perms: number) => !!(perms & 0o002);
export const isNotWorldWritable = (perms: number) => !isWorldWritable(perms);