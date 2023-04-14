import {usePistolValue} from "@scottburch/pistol";

export const Counter: React.FC = () => {
    const count = usePistolValue<number>('demo-app.counter');

    return <div>Count: <span id="count">{count || 0}</span></div>;
};