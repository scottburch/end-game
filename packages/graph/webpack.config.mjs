import {webpackBase} from "../webpack.config.base.mjs";

const base = webpackBase(import.meta.url);

export default {
    ...base,
    entry: {
        ...base.entry,
        "internal": './src/internal.ts'
    }
}