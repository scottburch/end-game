// @ts-ignore
import * as KeyshapeJS from 'keyshapejs'

(global.window as any).ks = KeyshapeJS;
const window = global.window as any;
const document = global.document as any;


export const svgJS = () => {
if(KeyshapeJS.version.indexOf('1.')!=0)throw Error('Expected KeyshapeJS v1.*.*');window.ks=document.ks=KeyshapeJS;(function(ks){var tl=ks.animate("#_a0",[{p:'visibility',t:[0,9700,10000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],"#data-2",[{p:'mpath',t:[10000,11000,13000],v:['0%','36.508656%','100%'],e:[[0],[0],[0]],mp:"M60.7185,73.422C78.2165,109.779,103.208,117.106,126.052,132.755C193.82,107.572,197.136,70.0342,135.719,20.0887"},{p:'visibility',t:[0,10000,11000,11100,13000],v:['hidden','visible','hidden','visible','hidden'],e:[[3,1],[3,1],[3,1],[3,1],[3,1]],fill:[2,'hidden']}],"#data",[{p:'mpath',t:[1000,1900,3000,3900,6000,6900,7000,8000,8900,9000,9700,9900,10000,11000,13000],v:['0%','10.678568%','21.368209%','32.097493%','43.227999%','49.449451%','55.386255%','61.206908%','67.931918%','74.677%','78.132792%','78.133021%','80.96303%','86.957553%','100%'],e:[[0],[0],[0],[0],[0],[0],[0],[0],[0],[1,0,0,1,1],[0],[0],[0],[0],[0]],mp:"M63.5185,70.022C105.367,31.3271,151.325,31.305,201.567,71.5943C152.705,31.083,106.82,31.2451,63.833,70.9654C106.259,31.2152,152.536,31.9611,202.511,71.5943C154.709,30.7847,106.91,30.6869,59.116,73.481C109.788,39.5257,102.829,21.3834,127.983,18.7647L62.2607,73.1666C84.6066,51.4433,91.5083,42.7668,126.096,19.3936C151.148,37.9885,178.21,55.3374,207.542,71.2798L125.467,19.7081L175.121,20.627L175.118,20.6272L134.45,20.2939L204.121,70.9604C154.898,154.219,105.676,128.254,56.4546,73.627"},{p:'visibility',t:[1000,1900,2998,3900,6000,6900,7000,8900,9000,10000,10100,11000,11100,12000],v:['visible','hidden','visible','hidden','visible','hidden','visible','hidden','visible','hidden','visible','hidden','visible','hidden'],e:[[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1]],fill:[2,'hidden']}],"#_a1",[{p:'mpath',t:[0,500],v:['0%','100%'],e:[[1,0,0,0.58,1],[0]],mp:"M130.611,-26.0847C132.939,36.6095,131,81,130.935,80.8622"}],"#Right Server",[{p:'mpath',t:[200,1000,2000,3000],v:['0%','56.092647%','56.095076%','100%'],e:[[0],[0],[1,0,0,1,1],[0]],mp:"M296.791,90.8221L204.274,85.282L204.276,85.2854L276.6,90.9423"}],"#Left Server",[{p:'mpath',t:[0,1000,4000,5000],v:['0%','51.779933%','51.779933%','100%'],e:[[0],[0],[0],[0]],mp:"M-19.8111,84.5902L56.5046,84.7135L56.5046,84.7135L-14.5638,84.399"}],"#leftComputer",[{p:'mpath',t:[5000,6000],v:['0%','100%'],e:[[0],[0]],mp:"M-20.1255,87.1059L51.5717,88.3637"}],"#rightComputer",[{p:'mpath',t:[2000,3000],v:['0%','100%'],e:[[0],[0]],mp:"M286.789,87.322L207.428,86.3786"}],"#leftConnector",[{p:'visibility',t:[0,1000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],"#rightConnector",[{p:'visibility',t:[0,1000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],"#girl",[{p:'visibility',t:[0,3000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],"#boy",[{p:'visibility',t:[0,6000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],"#topServer",[{p:'visibility',t:[0,6000,10000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],"#_a2",[{p:'visibility',t:[0,1000,2000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],"#_a3",[{p:'visibility',t:[0,3000,4000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],"#_a4",[{p:'visibility',t:[0,6000,10000],v:['hidden','visible','hidden'],e:[[3,1],[3,1],[3,1]],fill:[2,'hidden']}],"# cellPhone",[{p:'visibility',t:[0,10000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],"#topConnector",[{p:'visibility',t:[0,10000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],"#bottomConnector",[{p:'visibility',t:[0,10000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],"# cellPhone-2",[{p:'visibility',t:[0,10000],v:['hidden','visible'],e:[[3,1],[3,1]],fill:[2,'hidden']}],{autoremove:false,autoplay:false,markers:{"serverToServerStart":{time: 0},"serverToServerData":{time: 1000},"serverToServerDataEnd":{time: 1900},"serverToComputerStart":{time: 2000},"serverToComputerData":{time: 3000},"serverToComputerDataEnd":{time: 3900},"socialNetworkStart":{time: 5000},"socialNetworkDataStart":{time: 6000},"socialNetworkDataEnd":{time: 9900},"endgame":{time: 10000},"endgameEnd":{time: 13000}}}).range(0,13000);if(document.location.search.substr(1).split('&').indexOf('global=paused')>=0)ks.globalPause();})(KeyshapeJS);}