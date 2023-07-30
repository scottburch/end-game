// @ts-ignore
import * as KeyshapeJS from 'keyshapejs'

(global.window as any).ks = KeyshapeJS;
const window = global.window as any;
const document = global.document as any;



export const svgJS = () => {
    if(KeyshapeJS.version.indexOf('1.')!=0)throw Error('Expected KeyshapeJS v1.*.*');window.ks=document.ks=KeyshapeJS;(function(ks){
        var tl=ks.animate("#_a0",[{p:'visibility',t:[0,6000,8000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],
            "#_a1",[{p:'visibility',t:[0,3000,4000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],
            "#_a2",[{p:'visibility',t:[0,1000,2000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],
            "#topServer",[{p:'visibility',t:[0,6000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],
            "#boy",[{p:'visibility',t:[0,6000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],
            "#_a3",[{p:'visibility',t:[0,9500,10000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],
            "#data",[{p:'mpath',t:[1000,2000,3000,4000,6000,6900,7000,8000,8900,9000,9500],v:['0%','13.666631%','27.347432%','41.07897%','55.323999%','63.286329%','70.884362%','78.333742%','86.940535%','95.573017%','100%'],e:[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],mp:"M63.5185,70.022C105.367,31.3271,151.325,31.305,201.567,71.5943C152.705,31.083,106.82,31.2451,63.833,70.9654C106.259,31.2152,152.536,31.9611,202.511,71.5943C154.709,30.7847,106.91,30.6869,59.116,73.481C109.788,39.5257,102.829,21.3834,127.983,18.7647L62.2607,73.1666C84.6066,51.4433,91.5083,42.7668,126.096,19.3936C151.148,37.9885,178.21,55.3374,207.542,71.2798L125.467,19.7081L175.152,21.2804"},{p:'visibility',t:[1000,2000,2998,4000,6000,6900,7000,8900,9000,10000],v:['visible','hidden','visible','hidden','visible','hidden','visible','hidden','visible','hidden'],e:[[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1]],fill:[2,'hidden']}],
            "#internetCloud",[{p:'mpath',t:[0,500],v:['0%','100%'],e:[[1,0,0,0.58,1],[0]],mp:"M130.611,-26.0847C132.939,36.6095,131,81,130.935,80.8622"}],
            "#Right Server",[{p:'mpath',t:[200,1000,2000,3000],v:['0%','56.035063%','56.385989%','100%'],e:[[0],[0],[1,0,0,1,1],[0]],mp:"M296.791,90.8221L204.274,85.282L204.715,84.9046L276.6,90.9423"}],
            "#Left Server",[{p:'mpath',t:[0,1000,4000,5000],v:['0%','51.779933%','51.779933%','100%'],e:[[0],[0],[0],[0]],mp:"M-19.8111,84.5902L56.5046,84.7135L56.5046,84.7135L-14.5638,84.399"}],
            "#leftComputer",[{p:'mpath',t:[5000,6000],v:['0%','100%'],e:[[0],[0]],mp:"M-20.1255,87.1059L51.5717,88.3637"}],
            "#rightComputer",[{p:'mpath',t:[2000,3000],v:['0%','100%'],e:[[0],[0]],mp:"M286.789,87.322L207.428,86.3786"}],
            "#leftConnector",[{p:'visibility',t:[1000,10000],v:['visible','hidden'],e:[[3,1],[3,1]],fill:[2,'hidden']}],
            "#rightConnector",[{p:'visibility',t:[1000,10000],v:['visible','hidden'],e:[[3,1],[3,1]],fill:[2,'hidden']}],
            "#girl",[{p:'visibility',t:[0,3000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],
            {autoremove:false,autoplay:false,markers:{"serverToServerStart":{time: 0},"serverToServerData":{time: 1000},"serverToComputerStart":{time: 2000},"serverToComputerData":{time: 3000},"serverToComputerEnd":{time: 4000},"computerToComputerData":{time: 6000}}}).range(0,10000);
        if(document.location.search.substr(1).split('&').indexOf('global=paused')>=0)ks.globalPause();})(KeyshapeJS);

}
