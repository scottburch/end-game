import {Alert, Typography} from "antd";
import {RxjsNote} from "./RxjsNote";
import {FunctionDoc} from "./FunctionDoc";
import {PistolOptsTypeDoc} from "./PistolOptsTypeDoc";
import {PistolValueTypeDoc} from "./PistolValueTypeDoc";

export const ApiReactDocs: React.FC = () => (
    <>
        <Typography.Title level={3}>React API Documentation</Typography.Title>
        <Typography.Title level={5}>A list of the hooks and functions available in React.</Typography.Title>

        <Alert type="info" message={<RxjsNote/>}/>

        <Typography.Title level={4}>Functions</Typography.Title>


        <FunctionDoc
            name="startPistolReact"
            args={['opts?: PistolOpts']}
            returns="Observable<void>"
            types={[PistolOptsTypeDoc]}
        >
            Start the pistol react session.  This must be done before any other functions are called.
        </FunctionDoc>

        <FunctionDoc
            name="putPistolValue"
            args={['path: string', 'value: PistolValue']}
            returns="Observable<void>"
            types={[PistolValueTypeDoc]}
        >Put a value in the pistol store.  pistolLogin() must be called before calling putPistolValue()</FunctionDoc>

        <FunctionDoc
            name="pistolLogin"
            args={['username: string', 'password: string']}
            returns="Observable<void>"
        >Login to pistol to setup your private/public keys for writing.</FunctionDoc>

        <FunctionDoc
            name="dialPeerConnection"
            args={['url: string', 'opts?: DialPeerOpts']}
            returns='Observable<void>'
        >Dial a peer node.  You can dial as many peer nodes as you wish for redundancy.</FunctionDoc>

        <Typography.Title level={4}>Hooks</Typography.Title>

        <FunctionDoc
            name="usePistolAuth"
            returns="PistolAuth"
            args={[]}
        >
            Provides updates for user authentication information in components.
            Used to check if a user is logged in, or to get your id, private or public key info.
        </FunctionDoc>

        <FunctionDoc
            name="usePistolValue"
            args={['path: string']}
            returns="PistolValue"
            >
            Provides updates for a value in the store in components.
        </FunctionDoc>
    </>
)

export type FunctionDocProps = {
    name: string
    args: string[]
    returns: string
    types?: React.FC[]
}

