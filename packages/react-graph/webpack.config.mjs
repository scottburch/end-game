import {webpackBase} from "../webpack.config.base.mjs";

export default webpackBase(import.meta.url, {
    entry: {
        'index': './src/index.ts',
        'reactTestUtils': './src/test/reactTestUtils.tsx'
    }
});


