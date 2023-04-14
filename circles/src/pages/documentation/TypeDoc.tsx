import {Card, Table} from "antd";

export type TypeDocData = {
    name: string
    items:  {
        prop: string,
        type: string,
        desc: string
    }[]
};

export const TypeDoc: React.FC<{ data: TypeDocData}> = ({data}) => {
    const columns = (data.items[0].prop ? [{
        title: 'Property',
        dataIndex: 'prop',
        key: 'prop',
    }] : []).concat([{
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        }, {
            title: 'Description',
            dataIndex: 'desc',
            key: 'desc',
    }]);
    return (
            <Card title={data.name} size="small">
            <Table
                dataSource={data.items}
                columns={columns}
                size="small"
                pagination={{hideOnSinglePage: true}}
            />
        </Card>
    )
};

