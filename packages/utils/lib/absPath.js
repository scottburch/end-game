import url from "url";
export const absPath = (source, filename = '.') => url.fileURLToPath(new URL(filename, source));
//# sourceMappingURL=absPath.js.map