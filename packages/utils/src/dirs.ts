import {absPath} from "./absPath.js";

export const endgameRootDir = (path: string) => absPath(import.meta.url, '../../../' + path);
export const endgamePackagesDir = (path: string) => endgameRootDir('packages/' + path);