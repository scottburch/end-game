import {TypeDoc, TypeDocData} from "./TypeDoc";

export const PistolOptsTypeDoc: React.FC = () => {
    const data: TypeDocData = {
        name: 'PistolOpts',
        items: [{
            prop: 'port',
            type: 'number',
            desc: 'Port for the node to listen on for peer connections'
        }, {
            prop: 'name',
            type: 'string',
            desc: 'The published name of this node'
        }, {
            prop: 'isTrusted',
            type: 'boolean',
            desc: 'Is this node on a trusted network.  If so, it will skip things like message signing.  Not recommended on a public network'
        }]
    };

    return <TypeDoc data={data} />
}