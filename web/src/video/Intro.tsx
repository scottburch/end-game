import React, {useEffect} from 'react'
import Snap from 'snapsvg-cjs-ts'

export const Intro: React.FC = () => {

    useEffect(() => {
        const s = Snap('#internet');
        s.transform('s.1,.1')
            s.animate({
                transform: 's.6,.6'
            }, 3000)
    }, []);

    return (
        <div style={{display: 'flex', height: 500, width: 500, border: '3px solid blue', textAlign: 'center', alignItems: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'row', border: '3px solid red', alignItems: 'center', flex: 1}}>
                <Internet/>
            </div>
        </div>
    )
}


const Internet: React.FC = () => (
    <svg
        style={{backgroundColor: 'black', margin: 'auto'}}
        width={982.39539 * .5}
        height={610.2973 * .5}
        viewBox={`0 0 ${259.92545} ${161.47449}`}
        version="1.1"
        id="internet"
        xmlns="http://www.w3.org/2000/svg"
        >
        <defs
     id="defs2" /><g
        id="layer5"
        style={{display:'inline'}}
        transform="translate(-52.177726,-20.114038)"><g
       id="layer6"
       style={{display:'inline'}}><path
         style={{display:'inline',fill:'none',fillOpacity:0.993671,stroke:'#fffffe',strokeWidth:0.5,strokeDasharray:'none',strokeOpacity:1}}
         d="m 127.16541,45.066956 c 26.94158,-27.554531 82.70463,-41.9412421 118.41535,10.971949 11.93879,5.170208 23.93247,10.263095 30.46944,23.041094 63.37204,22.198341 30.34609,72.599051 -5.19364,70.220461 -14.70212,15.83037 -27.98831,16.70454 -40.85676,13.16635 -17.30868,13.5475 -37.39785,14.85764 -60.24642,4.02304 C 147.70719,184.0615 121.9591,192.36292 98.080942,154.78644 46.16402,143.62398 30.620034,83.054908 93.579769,60.793418 Z"
         id="path4507" /></g></g></svg>
)