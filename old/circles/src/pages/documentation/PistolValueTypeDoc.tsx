import {TypeDoc, TypeDocData} from "./TypeDoc";

export const PistolValueTypeDoc: React.FC = () => {
    const data: TypeDocData = {
        name: 'PistolValue',
        items: [{
            prop: '',
            type: 'string | boolean | number',
            desc: 'a value to be stored or retrieved'
        }]
    };

    return <TypeDoc data={data} />
}