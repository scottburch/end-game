import React, {useEffect} from 'react'
// @ts-ignore
import * as KeyshapeJS from 'keyshapejs'
import {concatMap, Observable, of, range, switchMap, tap} from "rxjs";

(window as any).ks = KeyshapeJS;

export const IntroVideo: React.FC = () => {

    useEffect(svgJS, []);

    const play = <T extends string | number>(start: T, end: T) => of(KeyshapeJS.timelines()[0]).pipe(
        tap(tl => tl.range(start, end)),
        tap(tl => tl.play()),
        switchMap(tl => new Observable(sub =>
            tl.onfinish = () => {
                sub.next();
                sub.complete();
            }
        ))
    );

    return (
        <>
            <div style={{height: 300, width: '100%', textAlign: 'center'}} dangerouslySetInnerHTML={{__html: svg()}}/>
            <button onClick={() => {
                range(1, 3).pipe(
                    concatMap(() => play('serverToServerData', 'serverToComputerStart')),
                ).subscribe();
            }}>Play</button>
        </>

    );
}


const svgJS = () => {
    if(KeyshapeJS.version.indexOf('1.')!=0)throw Error('Expected KeyshapeJS v1.*.*');(window as any).ks=(document as any).ks=KeyshapeJS;(function(ks){
        var tl=ks.animate("#_a0",[{p:'visibility',t:[0,9500,10000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],
            "#data",[{p:'mpath',t:[1000,2000,3000,4000,6000,6900,7000,8000,8900,9000,9500],v:['0%','13.666631%','27.347432%','41.07897%','55.323999%','63.286329%','70.884362%','78.333742%','86.940535%','95.573017%','100%'],e:[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],mp:"M63.5185,70.022C105.367,31.3271,151.325,31.305,201.567,71.5943C152.705,31.083,106.82,31.2451,63.833,70.9654C106.259,31.2152,152.536,31.9611,202.511,71.5943C154.709,30.7847,106.91,30.6869,59.116,73.481C109.788,39.5257,102.829,21.3834,127.983,18.7647L62.2607,73.1666C84.6066,51.4433,91.5083,42.7668,126.096,19.3936C151.148,37.9885,178.21,55.3374,207.542,71.2798L125.467,19.7081L175.152,21.2804"},{p:'visibility',t:[1000,2000,2998,4000,6000,6900,7000,8900,9000,10000],v:['visible','hidden','visible','hidden','visible','hidden','visible','hidden','visible','hidden'],e:[[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1]],fill:[2,'hidden']}],
            "#_a1",[{p:'mpath',t:[0,500],v:['0%','100%'],e:[[1,0,0,0.58,1],[0]],mp:"M130.611,-26.0847C132.939,36.6095,131,81,130.935,80.8622"}],
            "#Right Server",[{p:'mpath',t:[200,1000,2000,3000],v:['0%','56.035063%','56.385989%','100%'],e:[[0],[0],[1,0,0,1,1],[0]],mp:"M296.791,90.8221L204.274,85.282L204.715,84.9046L276.6,90.9423"}],
            "#Left Server",[{p:'mpath',t:[0,1000,4000,5000],v:['0%','51.779933%','51.779933%','100%'],e:[[0],[0],[0],[0]],mp:"M-19.8111,84.5902L56.5046,84.7135L56.5046,84.7135L-14.5638,84.399"}],
            "#leftComputer",[{p:'mpath',t:[5000,6000],v:['0%','100%'],e:[[0],[0]],mp:"M-20.1255,87.1059L51.5717,88.3637"}],
            "#rightComputer",[{p:'mpath',t:[2000,3000],v:['0%','100%'],e:[[0],[0]],mp:"M286.789,87.322L207.428,86.3786"}],
            "#girl",[{p:'visibility',t:[0,3000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],
            "#boy",[{p:'visibility',t:[0,6000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],
            "#topServer",[{p:'visibility',t:[0,6000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],
            "#_a2",[{p:'visibility',t:[0,1000,2000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],
            "#_a3",[{p:'visibility',t:[0,3000,4000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],
            "#_a4",[{p:'visibility',t:[0,6000,8000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],
            {autoremove:false,autoplay:false,markers:{"serverToServerStart":{time: 0},"serverToServerData":{time: 1000},"serverToComputerStart":{time: 2000},"serverToComputerData":{time: 3000},"serverToComputerEnd":{time: 4000},"computerToComputerData":{time: 6000}}}).range(0,10000);
        if(document.location.search.substr(1).split('&').indexOf('global=paused')>=0)ks.globalPause();})(KeyshapeJS);

}

const svg = () =>
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="endgame" viewBox="0 0 261.86974 161.72449" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" height="161.724" width="261.87" style="white-space: pre;">\n' +
    '    <defs>\n' +
    '        <symbol id="Internet Cloud" preserveAspectRatio="none" width="264.287" height="162.745" viewBox="0 0 264.287 162.745" overflow="visible" style="white-space: preserve-spaces;">\n' +
    '            <g id="Internet Cloud-2" transform="translate(132.376,81.5949) translate(-130.685,-80.6123)">\n' +
    '                <g id="Cloud-2" display="inline" transform="translate(129.963,80.4872) translate(-182.141,-100.851)">\n' +
    '                    <path id="path4507-2" d="M127.165,45.067C154.107,17.5124,209.87,3.12571,245.581,56.0389C257.52,61.2091,269.513,66.302,276.05,79.08C339.422,101.278,306.396,151.679,270.857,149.3C256.154,165.131,242.868,166.005,230,162.467C212.691,176.014,192.602,177.324,169.753,166.49C147.707,184.061,121.959,192.363,98.0809,154.786C46.164,143.624,30.62,83.0549,93.5798,60.7934Z" display="inline" fill="none" fill-opacity="0.993671" stroke="#000000" stroke-dasharray="none" stroke-opacity="1" stroke-width="1.5" filter="drop-shadow(3px 3px 2px rgba(0,0,0,0.50))" transform="translate(182.141,100.851) translate(-182.141,-100.851)"/>\n' +
    '                </g>\n' +
    '                <text fill="#000000" fill-opacity="0.993671" font-size="57" font-family="Noteworthy" letter-spacing="0" word-spacing="0" stroke="none" transform="translate(47.7837,107.75)" style="line-height: 16px; white-space: pre;">Internet</text>\n' +
    '            </g>\n' +
    '        </symbol>\n' +
    '        <symbol id="Desktop Computer" preserveAspectRatio="none" width="172.703" height="155.882" viewBox="0 0 172.703 155.882" overflow="visible">\n' +
    '            <g transform="translate(-26.9147,-3.09176)">\n' +
    '                <path d="M3.8,0.4L0.65,0.45L8.21501,109.4L141.2,97.6485" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(26.8,3.2)"/>\n' +
    '                <path d="M0,0L131.4,2L138.4,94.8L7.6,106.6Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(30.6,3.6)"/>\n' +
    '                <path d="M0,0L110.891,0.630063L114.041,76.8676L5.0405,84.1134Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(43.1593,12.2862)"/>\n' +
    '                <path d="M0,0L-5.9856,19.0819" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(74.0324,109.001)"/>\n' +
    '                <path d="M0,0L-5.35553,17.8218" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(107.426,106.796)"/>\n' +
    '                <path d="M0,0L-7.84081,18.747" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(82.5382,108.686)"/>\n' +
    '                <path d="M0,0L112.781,-11.6562L160.036,4.41044L159.721,11.0261L38.4338,27.0927L1.26013,12.2862Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(39.0639,131.368)"/>\n' +
    '                <path d="M0.8,1.4L39.669,20.162L160.351,6.67681" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(38.6456,130.253)"/>\n' +
    '                <path d="M0,0L0.9,-2.2" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" stroke-linejoin="round" transform="translate(168.2,100.7)"/>\n' +
    '            </g>\n' +
    '        </symbol>\n' +
    '        <symbol id="Symbol-1" preserveAspectRatio="none" width="101.517" height="155.55" viewBox="0 0 101.517 155.55" overflow="visible">\n' +
    '            <g transform="translate(-81.25,-2.2185)">\n' +
    '                <path d="M0,0L60,-23L100,-14L97,92L48.9349,131C29.3012,129.656,14,126,0,116Z" stroke="#000000" fill="#ffffff" fill-opacity="0.993671" stroke-width="1.5" transform="translate(82,26)"/>\n' +
    '                <path d="M0,0L-47,27L-97,14" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" transform="translate(179,12)"/>\n' +
    '                <path d="M0,0L-1.06513,118" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" transform="translate(132,39)"/>\n' +
    '                <path d="M0,0L-1,54L33,63L34,8Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(90,36)"/>\n' +
    '                <path d="M0,0L34,8" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(90,48)"/>\n' +
    '                <path d="M0,0L33,9" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(90,59)"/>\n' +
    '                <path d="M0,0L33,9" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(90,69)"/>\n' +
    '                <path d="M0,0L34,9" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(89,79)"/>\n' +
    '                <path d="M0,0L24,6" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(94,98)"/>\n' +
    '                <path d="M0,0L0,4L-6.4,2.46667C-11.7997,2.68891,-15.9109,1.66676,-18.7333,-0.6L-24.0667,-1.93333L-23.9333,-5.93333" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(118,104)"/>\n' +
    '            </g>\n' +
    '        </symbol>\n' +
    '        <symbol id="Symbol-2" preserveAspectRatio="none" width="77.3303" height="99.9509" viewBox="0 0 77.3303 99.9509" overflow="visible">\n' +
    '            <g transform="translate(-58.0103,-41.1654)">\n' +
    '                <path d="M-10.5,87.6667C-16.8144,82.8494,-19.2165,78.1503,-20,73.5L-20.3333,66.8333C-20.4566,63.2845,-19.1973,58.2687,-18.6667,53.3333C-18.3217,50.1245,-18.6161,47.1149,-18.6667,44C-18.7314,40.0174,-20.2853,36.6524,-20.5,33.8333C-21.2614,23.8346,-22.8304,21.8945,-21.3333,16.6667C-18.1667,8.16667,-12.3954,1.77198,0.766667,-0.166667L18.1,0.433333C20.4288,0.755954,23.0534,1.78344,24.9,3.5C30.1682,6.85754,32.2859,22.4676,36.1667,32.1667C38.4702,36.1539,42.2967,39.7525,45.1667,43.6667C47.7494,47.1891,49.4487,51.1054,52.1667,54.8333C54.6843,58.2863,53.7447,62.0146,54.3333,65.5C53.117,72.4259,50.1527,77.6911,45.3,82.5667" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1" stroke-linecap="round" transform="translate(80.5,41.8333)"/>\n' +
    '                <path d="M-0.0666667,-0.199967C9.12134,-1.06404,17.0318,-4.4014,23.5333,-10.4667C25.0325,-4.19893,26.7782,0.81498,32.4,4.8C35.2276,6.80436,36.8344,8.22882,39.077,10.7042C38.0098,14.3127,36.6066,17.1718,35.0667,19.5333C33.9581,21.2335,32.9624,22.9721,31.4667,24.0667C29.8592,25.2431,27.728,25.7389,25.8667,26.5333C24.2628,26.0541,22.6428,26.1793,21.0667,25.9333C18.6426,25.555,16.3231,24.8078,14.3333,23.6C10.5555,21.3071,7.81861,16.6179,5.4,13.2667C4.03701,11.3781,3.2395,9.03487,2.4,6.8C1.5401,4.51084,0.646442,2.32302,-0.0666667,-0.199967Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(66.7333,76.5333)"/>\n' +
    '                <path d="M0,0L0.266667,6.33333C-9.78649,9.67819,-14.1091,18.4164,-18.6667,26.9333" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(88.7333,102.8)"/>\n' +
    '                <path d="M0,0C2.29137,2.68159,5.12557,5.02453,7.46667,7.46667C7.74924,7.76144,8.00309,8.01989,8.33333,8.26667C8.87444,8.67101,9.5178,9.03401,10.0667,9.4C11.6938,10.485,13.2932,11.4841,14.5333,12.8667C16.2658,14.7982,18.3234,16.6321,19.6,18.8667C21.1986,21.665,21.9931,24.8988,24.2,27.5333" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(101.467,96.6)"/>\n' +
    '                <path d="M0,0L-4.6,10.1333" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(70.0667,129.733)"/>\n' +
    '                <path d="M0.0666667,3.33333e-05C2.13333,4.8,3,10,4.26667,15.5333" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(125.933,124.533)"/>\n' +
    '                <path d="M0,0C-1.91315,11.1741,-2.58718,19.2559,-2.625,25.75" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(80,114.5)"/>\n' +
    '                <path d="M0,0C2.625,-9.375,9.5,-25.875,16,-23.625C27.5,-19.75,23.2784,-9.94826,19.25,-0.25" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(99.375,140.5)"/>\n' +
    '            </g>\n' +
    '        </symbol>\n' +
    '        <symbol id="Symbol-3" preserveAspectRatio="none" width="68.0287" height="77.2153" viewBox="0 0 68.0287 77.2153" overflow="visible">\n' +
    '            <g transform="translate(-78.8171,-30.4252) scale(0.948642,1)">\n' +
    '                <path d="M-0.133337,0.133367C-4.40001,-1.9333,-7.06667,-6.6,-7.26667,-11.5333C-6.96465,-12.6272,-6.64658,-12.9396,-6.2,-13.5999C-6.8,-17.1333,-8.33333,-20.2666,-7.4,-23.9333C-5.4706,-27.9621,-2.06667,-30.2667,0.133333,-33.7333C3.37159,-34.8832,5.93658,-36.9297,8.13333,-39.4667C11.4337,-40.8952,14.9557,-40.8008,18.6,-39.8667C19.5198,-39.2096,20.3935,-38.525,20.8667,-37.6C28.3333,-36.1333,32.8667,-30.8,32.4667,-26.3333C37.6914,-20.2683,32.9382,-9.82592,28.0667,-10.7333C28.5333,-15.6667,25.6397,-20.2221,23.3334,-24.7333C16.5465,-18.8972,9.98978,-14.4402,2.26667,-11.8C2.7258,-6.84801,2.07181,-2.75726,-0.133337,0.133367Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(112.867,71.5333)"/>\n' +
    '                <path d="M-0.0666667,0.266667C-1.17661,6.10579,-17.9333,6.06667,-27.8,13.0667" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(112.667,71.8)"/>\n' +
    '                <path d="M0,0C-2.2,7.13333,-6.20345,12.5274,-10.8666,15.4667C-7.4,20.6,4.34667,23.2533,10.28,28.6533" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(140.8,60.8667)"/>\n' +
    '                <path d="M0,0C12.4454,12.2005,22.977,14.0338,31.1333,3" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(103.4,77.6)"/>\n' +
    '                <path d="M-0.2,-0.0533333C-3.22953,3.20443,-4.53858,7.1665,-5.13333,11.4667C-5.61879,15.2797,-5.53683,18.2983,-5.13333,20.8667" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(84.8,85.1333)"/>\n' +
    '                <path d="M0,0C1.87439,3.76989,2.8609,11.9612,3,17.4667" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(151.133,89.6)"/>\n' +
    '                <path d="M0,0L74.2,1.06667" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(79.6667,106.067)"/>\n' +
    '            </g>\n' +
    '        </symbol>\n' +
    '        <symbol id="Symbol-4" preserveAspectRatio="none" width="44.3066" height="65.0595" viewBox="-1 133.183456 44.306598 65.059526" overflow="visible">\n' +
    '            <g transform="translate(-49.3439,80.5615) scale(0.647184,0.795541)">\n' +
    '                <path d="M0,0L47.4478,0.233733L66.6139,17.7637L67.0814,79.9367L0.934932,79.9367Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(75.262,66.8476)"/>\n' +
    '                <path d="M0,0L22.2046,0.233733" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(85.0788,86.2475)"/>\n' +
    '                <path d="M0,0L48.3827,-0.233733" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(85.6638,134.888)"/>\n' +
    '                <path d="M0,0L48.3827,-0.233733" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(85.6638,122.938)"/>\n' +
    '                <path d="M0,0L48.3827,-0.233733" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(85.9783,109.731)"/>\n' +
    '                <path d="M0,0L48.3827,-0.233733" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(85.3494,97.7812)"/>\n' +
    '                <path d="M0.0910101,0.685715L0.233733,18.4649L19.1577,18.9524" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(122.242,66.8476)"/>\n' +
    '            </g>\n' +
    '        </symbol>\n' +
    '        <clipPath id="ClipPath-1">\n' +
    '            <rect width="262.313" height="161.424" fill="#000000" fill-opacity="0.993671" stroke="none" transform="translate(131.157,80.7118) translate(-131.157,-80.7118)"/>\n' +
    '        </clipPath>\n' +
    '    </defs>\n' +
    '    <g filter="none">\n' +
    '        <g clip-path="url(#ClipPath-1)">\n' +
    '            <text id="_a0" fill="#000000" fill-opacity="0.993671" font-size="24" font-family="Noteworthy" font-weight="400" letter-spacing="0" word-spacing="0" stroke="none" visibility="hidden" transform="translate(4.088,149.684)" style="line-height: 16px;">Person to service to Person</text>\n' +
    '            <text id="_a1" fill="#000000" fill-opacity="0.993671" font-size="24" font-family="Noteworthy" font-weight="400" letter-spacing="0" word-spacing="0" stroke="none" visibility="hidden" transform="translate(44.3391,149.684)" style="line-height: 16px;">Computer to Person</text>\n' +
    '            <text id="_a2" fill="#000000" fill-opacity="0.993671" font-size="24" font-family="Noteworthy" font-weight="400" letter-spacing="0" word-spacing="0" stroke="none" visibility="hidden" transform="translate(27.3582,147.797)" style="line-height: 16px;">Computer to Computer</text>\n' +
    '            <g id="topServer" visibility="hidden" transform="translate(129.183,30.7599) scale(0.323432,0.325955) translate(-43.1811,-78.3709)">\n' +
    '                <g transform="translate(-81.25,-2.2185)">\n' +
    '                    <path d="M0,0L60,-23L100,-14L97,92L48.9349,131C29.3012,129.656,14,126,0,116Z" stroke="#000000" fill="#ffffff" fill-opacity="0.993671" stroke-width="1.5" transform="translate(82,26)"/>\n' +
    '                    <path d="M0,0L-47,27L-97,14" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" transform="translate(179,12)"/>\n' +
    '                    <path d="M0,0L-1.06513,118" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" transform="translate(132,39)"/>\n' +
    '                    <path d="M0,0L-1,54L33,63L34,8Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(90,36)"/>\n' +
    '                    <path d="M0,0L34,8" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(90,48)"/>\n' +
    '                    <path d="M0,0L33,9" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(90,59)"/>\n' +
    '                    <path d="M0,0L33,9" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(90,69)"/>\n' +
    '                    <path d="M0,0L34,9" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(89,79)"/>\n' +
    '                    <path d="M0,0L24,6" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(94,98)"/>\n' +
    '                    <path d="M0,0L0,4L-6.4,2.46667C-11.7997,2.68891,-15.9109,1.66676,-18.7333,-0.6L-24.0667,-1.93333L-23.9333,-5.93333" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(118,104)"/>\n' +
    '                </g>\n' +
    '            </g>\n' +
    '            <g id="boy" visibility="hidden" transform="translate(19.2479,84.7559) scale(0.446448,0.459976) translate(-39.297,-38.6076)">\n' +
    '                <g transform="translate(-78.8171,-30.4252) scale(0.948642,1)">\n' +
    '                    <path d="M-0.133337,0.133367C-4.40001,-1.9333,-7.06667,-6.6,-7.26667,-11.5333C-6.96465,-12.6272,-6.64658,-12.9396,-6.2,-13.5999C-6.8,-17.1333,-8.33333,-20.2666,-7.4,-23.9333C-5.4706,-27.9621,-2.06667,-30.2667,0.133333,-33.7333C3.37159,-34.8832,5.93658,-36.9297,8.13333,-39.4667C11.4337,-40.8952,14.9557,-40.8008,18.6,-39.8667C19.5198,-39.2096,20.3935,-38.525,20.8667,-37.6C28.3333,-36.1333,32.8667,-30.8,32.4667,-26.3333C37.6914,-20.2683,32.9382,-9.82592,28.0667,-10.7333C28.5333,-15.6667,25.6397,-20.2221,23.3334,-24.7333C16.5465,-18.8972,9.98978,-14.4402,2.26667,-11.8C2.7258,-6.84801,2.07181,-2.75726,-0.133337,0.133367Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(112.867,71.5333)"/>\n' +
    '                    <path d="M-0.0666667,0.266667C-1.17661,6.10579,-17.9333,6.06667,-27.8,13.0667" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(112.667,71.8)"/>\n' +
    '                    <path d="M0,0C-2.2,7.13333,-6.20345,12.5274,-10.8666,15.4667C-7.4,20.6,4.34667,23.2533,10.28,28.6533" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(140.8,60.8667)"/>\n' +
    '                    <path d="M0,0C12.4454,12.2005,22.977,14.0338,31.1333,3" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(103.4,77.6)"/>\n' +
    '                    <path d="M-0.2,-0.0533333C-3.22953,3.20443,-4.53858,7.1665,-5.13333,11.4667C-5.61879,15.2797,-5.53683,18.2983,-5.13333,20.8667" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(84.8,85.1333)"/>\n' +
    '                    <path d="M0,0C1.87439,3.76989,2.8609,11.9612,3,17.4667" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(151.133,89.6)"/>\n' +
    '                    <path d="M0,0L74.2,1.06667" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(79.6667,106.067)"/>\n' +
    '                </g>\n' +
    '            </g>\n' +
    '            <text id="_a3" fill="#fe0310" fill-opacity="0.993671" font-size="24" font-family="Monaco" letter-spacing="0" word-spacing="0" stroke="none" visibility="hidden" transform="translate(166.036,39.6222)" style="line-height: 16px;">X</text>\n' +
    '            <g id="data" visibility="hidden" transform="translate(63.5185,70.022) translate(0,0) scale(0.357143,0.363739) translate(-26.5697,-140.901)">\n' +
    '                <g transform="translate(-49.3439,80.5615) scale(0.647184,0.795541)">\n' +
    '                    <path d="M0,0L47.4478,0.233733L66.6139,17.7637L67.0814,79.9367L0.934932,79.9367Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(75.262,66.8476)"/>\n' +
    '                    <path d="M0,0L22.2046,0.233733" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(85.0788,86.2475)"/>\n' +
    '                    <path d="M0,0L48.3827,-0.233733" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(85.6638,134.888)"/>\n' +
    '                    <path d="M0,0L48.3827,-0.233733" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(85.6638,122.938)"/>\n' +
    '                    <path d="M0,0L48.3827,-0.233733" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(85.9783,109.731)"/>\n' +
    '                    <path d="M0,0L48.3827,-0.233733" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(85.3494,97.7812)"/>\n' +
    '                    <path d="M0.0910101,0.685715L0.233733,18.4649L19.1577,18.9524" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(122.242,66.8476)"/>\n' +
    '                </g>\n' +
    '            </g>\n' +
    '            <use id="_a4" width="69.689" height="44.543" xlink:href="#Internet Cloud" transform="translate(130.611,-26.0847) translate(0,0) translate(-34.521,-18.4583)"/>\n' +
    '            <g id="Right Server" transform="translate(296.791,90.8221) translate(0,0) scale(0.323432,0.325955) translate(-43.1811,-78.3709)">\n' +
    '                <g transform="translate(-81.25,-2.2185)">\n' +
    '                    <path d="M0,0L60,-23L100,-14L97,92L48.9349,131C29.3012,129.656,14,126,0,116Z" stroke="#000000" fill="#ffffff" fill-opacity="0.993671" stroke-width="1.5" transform="translate(82,26)"/>\n' +
    '                    <path d="M0,0L-47,27L-97,14" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" transform="translate(179,12)"/>\n' +
    '                    <path d="M0,0L-1.06513,118" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" transform="translate(132,39)"/>\n' +
    '                    <path d="M0,0L-1,54L33,63L34,8Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(90,36)"/>\n' +
    '                    <path d="M0,0L34,8" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(90,48)"/>\n' +
    '                    <path d="M0,0L33,9" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(90,59)"/>\n' +
    '                    <path d="M0,0L33,9" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(90,69)"/>\n' +
    '                    <path d="M0,0L34,9" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(89,79)"/>\n' +
    '                    <path d="M0,0L24,6" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(94,98)"/>\n' +
    '                    <path d="M0,0L0,4L-6.4,2.46667C-11.7997,2.68891,-15.9109,1.66676,-18.7333,-0.6L-24.0667,-1.93333L-23.9333,-5.93333" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" stroke-linecap="round" transform="translate(118,104)"/>\n' +
    '                </g>\n' +
    '            </g>\n' +
    '            <use id="Left Server" width="101.517" height="155.55" xlink:href="#Symbol-1" transform="translate(-19.8111,84.5902) translate(0,0) scale(-0.307363,0.325955) translate(-43.1811,-78.3709)"/>\n' +
    '            <g id="leftComputer" filter="drop-shadow(3px 3px 2px rgba(0,0,0,0.50))" transform="translate(-20.1255,87.1059) translate(0,0) scale(-0.219191,0.231235) translate(-86.3513,-77.9409)">\n' +
    '                <g transform="translate(-26.9147,-3.09176)">\n' +
    '                    <path d="M3.8,0.4L0.65,0.45L8.21501,109.4L141.2,97.6485" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(26.8,3.2)"/>\n' +
    '                    <path d="M0,0L131.4,2L138.4,94.8L7.6,106.6Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(30.6,3.6)"/>\n' +
    '                    <path d="M0,0L110.891,0.630063L114.041,76.8676L5.0405,84.1134Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(43.1593,12.2862)"/>\n' +
    '                    <path d="M0,0L-5.9856,19.0819" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(74.0324,109.001)"/>\n' +
    '                    <path d="M0,0L-5.35553,17.8218" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(107.426,106.796)"/>\n' +
    '                    <path d="M0,0L-7.84081,18.747" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(82.5382,108.686)"/>\n' +
    '                    <path d="M0,0L112.781,-11.6562L160.036,4.41044L159.721,11.0261L38.4338,27.0927L1.26013,12.2862Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(39.0639,131.368)"/>\n' +
    '                    <path d="M0.8,1.4L39.669,20.162L160.351,6.67681" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(38.6456,130.253)"/>\n' +
    '                    <path d="M0,0L0.9,-2.2" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" stroke-linejoin="round" transform="translate(168.2,100.7)"/>\n' +
    '                </g>\n' +
    '            </g>\n' +
    '            <g id="rightComputer" filter="drop-shadow(3px 3px 2px rgba(0,0,0,0.50))" transform="translate(286.789,87.322) translate(0,0) scale(0.21445,0.231235) translate(-86.3513,-77.9409)">\n' +
    '                <g transform="translate(-26.9147,-3.09176)">\n' +
    '                    <path d="M3.8,0.4L0.65,0.45L8.21501,109.4L141.2,97.6485" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(26.8,3.2)"/>\n' +
    '                    <path d="M0,0L131.4,2L138.4,94.8L7.6,106.6Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(30.6,3.6)"/>\n' +
    '                    <path d="M0,0L110.891,0.630063L114.041,76.8676L5.0405,84.1134Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(43.1593,12.2862)"/>\n' +
    '                    <path d="M0,0L-5.9856,19.0819" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(74.0324,109.001)"/>\n' +
    '                    <path d="M0,0L-5.35553,17.8218" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(107.426,106.796)"/>\n' +
    '                    <path d="M0,0L-7.84081,18.747" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(82.5382,108.686)"/>\n' +
    '                    <path d="M0,0L112.781,-11.6562L160.036,4.41044L159.721,11.0261L38.4338,27.0927L1.26013,12.2862Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(39.0639,131.368)"/>\n' +
    '                    <path d="M0.8,1.4L39.669,20.162L160.351,6.67681" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="square" transform="translate(38.6456,130.253)"/>\n' +
    '                    <path d="M0,0L0.9,-2.2" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" stroke-linejoin="round" transform="translate(168.2,100.7)"/>\n' +
    '                </g>\n' +
    '            </g>\n' +
    '            <path id="leftConnector" d="M-7.98105,-0.67452L21.2085,0" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" visibility="hidden" transform="translate(79.8733,80.8166) translate(-2.08172,0.0455969)"/>\n' +
    '            <path id="rightConnector" d="M0,0L-30.4819,0" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1.5" visibility="hidden" transform="translate(190.482,80.8622)"/>\n' +
    '            <g id="girl" visibility="hidden" transform="translate(243.529,83.2793) scale(0.378738,0.332431) translate(-38.6652,-49.9754)">\n' +
    '                <g transform="translate(-58.0103,-41.1654)">\n' +
    '                    <path d="M-10.5,87.6667C-16.8144,82.8494,-19.2165,78.1503,-20,73.5L-20.3333,66.8333C-20.4566,63.2845,-19.1973,58.2687,-18.6667,53.3333C-18.3217,50.1245,-18.6161,47.1149,-18.6667,44C-18.7314,40.0174,-20.2853,36.6524,-20.5,33.8333C-21.2614,23.8346,-22.8304,21.8945,-21.3333,16.6667C-18.1667,8.16667,-12.3954,1.77198,0.766667,-0.166667L18.1,0.433333C20.4288,0.755954,23.0534,1.78344,24.9,3.5C30.1682,6.85754,32.2859,22.4676,36.1667,32.1667C38.4702,36.1539,42.2967,39.7525,45.1667,43.6667C47.7494,47.1891,49.4487,51.1054,52.1667,54.8333C54.6843,58.2863,53.7447,62.0146,54.3333,65.5C53.117,72.4259,50.1527,77.6911,45.3,82.5667" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-width="1" stroke-linecap="round" transform="translate(80.5,41.8333)"/>\n' +
    '                    <path d="M-0.0666667,-0.199967C9.12134,-1.06404,17.0318,-4.4014,23.5333,-10.4667C25.0325,-4.19893,26.7782,0.81498,32.4,4.8C35.2276,6.80436,36.8344,8.22882,39.077,10.7042C38.0098,14.3127,36.6066,17.1718,35.0667,19.5333C33.9581,21.2335,32.9624,22.9721,31.4667,24.0667C29.8592,25.2431,27.728,25.7389,25.8667,26.5333C24.2628,26.0541,22.6428,26.1793,21.0667,25.9333C18.6426,25.555,16.3231,24.8078,14.3333,23.6C10.5555,21.3071,7.81861,16.6179,5.4,13.2667C4.03701,11.3781,3.2395,9.03487,2.4,6.8C1.5401,4.51084,0.646442,2.32302,-0.0666667,-0.199967Z" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(66.7333,76.5333)"/>\n' +
    '                    <path d="M0,0L0.266667,6.33333C-9.78649,9.67819,-14.1091,18.4164,-18.6667,26.9333" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(88.7333,102.8)"/>\n' +
    '                    <path d="M0,0C2.29137,2.68159,5.12557,5.02453,7.46667,7.46667C7.74924,7.76144,8.00309,8.01989,8.33333,8.26667C8.87444,8.67101,9.5178,9.03401,10.0667,9.4C11.6938,10.485,13.2932,11.4841,14.5333,12.8667C16.2658,14.7982,18.3234,16.6321,19.6,18.8667C21.1986,21.665,21.9931,24.8988,24.2,27.5333" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(101.467,96.6)"/>\n' +
    '                    <path d="M0,0L-4.6,10.1333" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(70.0667,129.733)"/>\n' +
    '                    <path d="M0.0666667,3.33333e-05C2.13333,4.8,3,10,4.26667,15.5333" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(125.933,124.533)"/>\n' +
    '                    <path d="M0,0C-1.91315,11.1741,-2.58718,19.2559,-2.625,25.75" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(80,114.5)"/>\n' +
    '                    <path d="M0,0C2.625,-9.375,9.5,-25.875,16,-23.625C27.5,-19.75,23.2784,-9.94826,19.25,-0.25" stroke="#000000" fill="none" fill-opacity="0.993671" stroke-linecap="round" transform="translate(99.375,140.5)"/>\n' +
    '                </g>\n' +
    '            </g>\n' +
    '        </g>\n' +
    '    </g>\n' +
    '    <script xlink:href="keyshapejs-1.2.1.min.js"/>\n' +
    '    <script><![CDATA[if(KeyshapeJS.version.indexOf(\'1.\')!=0)throw Error(\'Expected KeyshapeJS v1.*.*\');window.ks=document.ks=KeyshapeJS;(function(ks){\n' +
    'var tl=ks.animate("#_a0",[{p:\'visibility\',t:[0,6000,8000],v:[\'hidden\',\'visible\',\'hidden\'],e:[[3,1],[3,1],[3,1]],fill:[2,\'hidden\']}],\n' +
    '"#_a1",[{p:\'visibility\',t:[0,3000,4000],v:[\'hidden\',\'visible\',\'hidden\'],e:[[3,1],[3,1],[3,1]],fill:[2,\'hidden\']}],\n' +
    '"#_a2",[{p:\'visibility\',t:[0,1000,2000],v:[\'hidden\',\'visible\',\'hidden\'],e:[[3,1],[3,1],[3,1]],fill:[2,\'hidden\']}],\n' +
    '"#topServer",[{p:\'visibility\',t:[0,6000],v:[\'hidden\',\'visible\'],e:[[3,1],[3,1]],fill:[2,\'hidden\']}],\n' +
    '"#boy",[{p:\'visibility\',t:[0,6000],v:[\'hidden\',\'visible\'],e:[[3,1],[3,1]],fill:[2,\'hidden\']}],\n' +
    '"#_a3",[{p:\'visibility\',t:[0,9500,10000],v:[\'hidden\',\'visible\',\'hidden\'],e:[[3,1],[3,1],[3,1]],fill:[2,\'hidden\']}],\n' +
    '"#data",[{p:\'mpath\',t:[1000,2000,3000,4000,6000,6900,7000,8000,8900,9000,9500],v:[\'0%\',\'13.666631%\',\'27.347432%\',\'41.07897%\',\'55.323999%\',\'63.286329%\',\'70.884362%\',\'78.333742%\',\'86.940535%\',\'95.573017%\',\'100%\'],e:[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],mp:"M63.5185,70.022C105.367,31.3271,151.325,31.305,201.567,71.5943C152.705,31.083,106.82,31.2451,63.833,70.9654C106.259,31.2152,152.536,31.9611,202.511,71.5943C154.709,30.7847,106.91,30.6869,59.116,73.481C109.788,39.5257,102.829,21.3834,127.983,18.7647L62.2607,73.1666C84.6066,51.4433,91.5083,42.7668,126.096,19.3936C151.148,37.9885,178.21,55.3374,207.542,71.2798L125.467,19.7081L175.152,21.2804"},{p:\'visibility\',t:[1000,2000,2998,4000,6000,6900,7000,8900,9000,10000],v:[\'visible\',\'hidden\',\'visible\',\'hidden\',\'visible\',\'hidden\',\'visible\',\'hidden\',\'visible\',\'hidden\'],e:[[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1]],fill:[2,\'hidden\']}],\n' +
    '"#_a4",[{p:\'mpath\',t:[0,500],v:[\'0%\',\'100%\'],e:[[1,0,0,0.58,1],[0]],mp:"M130.611,-26.0847C132.939,36.6095,131,81,130.935,80.8622"}],\n' +
    '"#Right Server",[{p:\'mpath\',t:[200,1000,2000,3000],v:[\'0%\',\'56.035063%\',\'56.385989%\',\'100%\'],e:[[0],[0],[1,0,0,1,1],[0]],mp:"M296.791,90.8221L204.274,85.282L204.715,84.9046L276.6,90.9423"}],\n' +
    '"#Left Server",[{p:\'mpath\',t:[0,1000,4000,5000],v:[\'0%\',\'51.779933%\',\'51.779933%\',\'100%\'],e:[[0],[0],[0],[0]],mp:"M-19.8111,84.5902L56.5046,84.7135L56.5046,84.7135L-14.5638,84.399"}],\n' +
    '"#leftComputer",[{p:\'mpath\',t:[5000,6000],v:[\'0%\',\'100%\'],e:[[0],[0]],mp:"M-20.1255,87.1059L51.5717,88.3637"}],\n' +
    '"#rightComputer",[{p:\'mpath\',t:[2000,3000],v:[\'0%\',\'100%\'],e:[[0],[0]],mp:"M286.789,87.322L207.428,86.3786"}],\n' +
    '"#girl",[{p:\'visibility\',t:[0,3000],v:[\'hidden\',\'visible\'],e:[[3,1],[3,1]],fill:[2,\'hidden\']}],\n' +
    '{autoremove:false,markers:{"serverToServerStart":{time: 0},"serverToServerData":{time: 1000},"serverToComputerStart":{time: 2000},"serverToComputerData":{time: 3000},"serverToComputerEnd":{time: 4000},"computerToComputerData":{time: 6000}}}).range(0,10000);\n' +
    'if(document.location.search.substr(1).split(\'&\').indexOf(\'global=paused\')>=0)ks.globalPause();})(KeyshapeJS);\n' +
    ']]></script>\n' +
    '</svg>\n'