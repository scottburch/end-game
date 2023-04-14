import url from "url";

export const absPath = (source: string, filename: string) => url.fileURLToPath(new URL(filename, source));
