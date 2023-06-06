import {Subject} from "rxjs";
import {useEffect, useState} from "react";

const rightSide = new Subject<{cmd: string, data: Object}>();

export const useShowProfile = () => (authId: string) => rightSide.next({cmd: 'profile', data: authId});

export const useRightSide = () => {
    const [data, setData] = useState<{cmd: string, data: any}>({cmd: '', data: {}});

    useEffect(() => {
        rightSide.subscribe(data => setData(data))
    }, []);
    return data;
}