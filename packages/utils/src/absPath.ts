import url from "url";

export const absPath = (source: string, filename = '.') => url.fileURLToPath(new URL(filename, source));
