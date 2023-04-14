import * as React from "react";
import {usePistolKeys} from "@scottburch/pistol";
import {chatPath} from "../constants";
import {useLocation, useNavigate} from "react-router";
import {map, of, tap} from "rxjs";

export const TagSelector: React.FC = () => {
    const navigate = useNavigate();
    const tags = usePistolKeys(chatPath('tags'));
    const location = useLocation();

    const onSelection = (tag: string) =>
        of(tag).pipe(
            map(tag => tag === 'all' ? '/' : `/tag/messages/${tag}`),
            tap(path => navigate(path))
        ).subscribe()

    return (
        <select onChange={ev => onSelection(ev.target.value)}>
            <option value="all">All tags</option>
            {tags.map(tag => <option selected={location.pathname.includes(`/tag/messages/${tag}`)} key={tag} value={tag}>#{tag}</option>)}
        </select>
    )
}