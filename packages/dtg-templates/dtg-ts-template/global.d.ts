declare module '*.png' {
    const value: import('react-native').ImageSourcePropType;
    export default value;
}

declare module '*.txt' {
    const content: string;
    export default content;
}

declare module '*.html' {
    const content: string;
    export default content;
}
