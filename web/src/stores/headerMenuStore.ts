import LD from 'lodash'
import {useGraphPut} from "@end-game/react-graph";

export const initHeaderMenu = LD.once((putFn: ReturnType<typeof useGraphPut>) =>
    getItems().forEach(it => putFn('header-menu-item', '', it))
)

const getItems = () => [{
    key: 'home',
    label: 'Home'
}, {
    key: 'getting-started',
    label: 'Getting Started'
}, {
    key: 'documentation',
    label: 'Documentation'
}];