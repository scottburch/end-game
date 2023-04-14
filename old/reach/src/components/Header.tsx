import {HeaderMenuBtn} from "./HeaderMenuBtn.js";
import {UserSearch} from "./UserSearch.js";

export const Header: React.FC = () => {
    return (
        <div style={{display: 'flex', height: '100%'}}>
            <div style={{display: 'flex', flexDirection: 'column', flex: 1, padding: 5}}>
                <div style={{fontSize: 20, lineHeight: '1.5em'}}>REACH</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', padding: 5}}>
                <div style={{flex: 1}}/>
                <UserSearch/>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', padding: 5}}>
                <div style={{flex: 1}}/>
                <HeaderMenuBtn/>
            </div>
        </div>
    )
}