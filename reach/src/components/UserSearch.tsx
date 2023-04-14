import {AutoComplete, Input} from "antd";
import {useEffect, useState} from "react";
import {getOwnerFromNickname, nicknameSearch} from "../services/userService.js";
import {firstValueFrom, tap} from "rxjs";
import {useNavigate} from "react-router-dom";



export const UserSearch: React.FC = () => {
    const [searchText, setSearchText] = useState<string>('');
    const [nicknames, setNicknames] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const sub = nicknameSearch(searchText).pipe(
            tap(({keys}) => setNicknames(keys))
        ).subscribe()
        return () => {
            sub.unsubscribe();
        }
    }, [searchText])

    const doSearch = (nick: string) => {
        return firstValueFrom(getOwnerFromNickname(nick).pipe(
            tap(() => setSearchText('')),
            tap(() => setSearchText('')),
            tap(({owner}) => navigate(`/user/profile/${owner}`))
        ))
    }
    const options = nicknames.map(n => ({value: n}));

    return (
        <div id="user-search">
        <AutoComplete
            id="user-search"
            options={options}
            filterOption={(inputValue, option) =>
                option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
        >
            <Input.Search allowClear value={searchText} placeholder="Nickname" onChange={ev => setSearchText(ev.target.value)} onSearch={doSearch}/>
        </AutoComplete>
        </div>
    )
}

