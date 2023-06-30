import LD from 'lodash'
import {useGraphPut} from "@end-game/react-graph";
import {asNodeId} from "@end-game/graph";

export const initHeaderMenu = LD.once((putFn: ReturnType<typeof useGraphPut>) =>
    getItems().forEach((it, idx) => putFn('header-menu-item', asNodeId(`header-menu-item-${idx}`), it).subscribe())
)

const getItems = () => [{
    key: '',
    label: 'Home'
}, {
    key: 'getting-started',
    label: 'Getting Started'
}, {
    key: 'documentation',
    label: 'Documentation'
}, {
    key: 'faq',
    label: 'FAQ'
}];