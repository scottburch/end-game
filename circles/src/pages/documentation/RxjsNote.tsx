import {Typography} from "antd";

export const RxjsNote: React.FC = () => (
    <div>
    <Typography.Title level={5}>NOTE:</Typography.Title>

    <Typography.Paragraph>
        Pistol uses the RxJS streaming library. The functions listed below are Observables in RxJS.
        You can run these functions in one of three ways:
    </Typography.Paragraph>
        <ul>
            <li>
                Add <Typography.Text code>.subscribe()</Typography.Text> to the end (ex. <Typography.Text code>startPistolReact().subscribe();</Typography.Text>)
            </li>
            <li>
                Wrap in <Typography.Text code>firstValueFrom()</Typography.Text> or
                <Typography.Text code>lastValueFrom()</Typography.Text> functions to return a promise.
            </li>
            <li>
                Use them in a RxJS chain (ex. <Typography.Text code>{`switchMap(() => startPistolReact())`}</Typography.Text>
            </li>

            <Typography.Paragraph>
            If you are new to RxJS, I would suggest either just adding a .subscribe() to the end with a function for the return value (callback style) or use firstValueFrom() for a promise style return.
            </Typography.Paragraph>

            <label>Examples:</label>
            <Typography.Text code style={{display: 'block'}}>
                {`pistolLogin('me', 'pass').subscribe(() => {// called on success})`}
            </Typography.Text>
                <Typography.Text code style={{display: 'block'}}>
                    {`firstValueFrom(pistolLogin('me', 'pass')).then(() => {// called on success})`}
                </Typography.Text>
        </ul>
    </div>
    )