import {Alert, Typography} from "antd";
import {RxjsNote} from "./RxjsNote";
import {FunctionDoc} from "./FunctionDoc";

export const ApiBaseDocs: React.FC = () => (
    <>
        <Typography.Title level={3}>Base API Documentation</Typography.Title>

        <Alert type="info" message={<RxjsNote/>}/>

        <FunctionDoc
            name="startPistol(opts: PistolOpts): Observable<Pistol>"
            args={['opts?: PistolOpts']}
            returns="Observable<Pistol>"
        >
            Starts a new pistol instance.  You may start more than one pistol instance for things like swarm testing.
        </FunctionDoc>

        <FunctionDoc
            name="pistolPut"
            args={['pistol: Pistol', 'path: string', 'value: PistolValue', 'opts: PutOpts']}
            returns='Observable({pistol: Pistol, value: PistolValue, meta: PistolMeta})'
        >
            Puts a value in the pistol store.
        </FunctionDoc>

        <FunctionDoc
            name="pistolRead"
            args={['pistol: Pistol', 'path: string']}
            returns="Observable<PistolValue>"
        >
            Read a value from the graph.  This returns an observable which will get fired with every update.
            It will also get fired with your local value before being updated by others.
        </FunctionDoc>

        <FunctionDoc
            name="pistolKeys"
            args={['pistol: Pistol, path: string']}
            returns="Observable<{pistol: Pistol, keys: string[]}>"
            >
            Read keys from a level in the graph (children).
        </FunctionDoc>

        <FunctionDoc
            name="dialPeer"
            args={['pistol: Pistol', 'url: string', 'opts?: DialPeerOpts']}
            returns="Observable<Pistol>"
        >
            Dial a peer node at a given URL.
        </FunctionDoc>
    </>
);