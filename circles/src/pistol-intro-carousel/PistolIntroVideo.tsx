import {VideoCarousel} from "../components/VideoCarousel";
import p1Vid from 'url:./media/pistol-1.png'
import p1Aud from 'url:./media/pistol-1.mp3'
import p2Vid from 'url:./media/pistol-2.png'
import p2Aud from 'url:./media/pistol-2.mp3'
import p3Vid from 'url:./media/pistol-3.png'
import p3Aud from 'url:./media/pistol-3.mp3'
import p4Vid from 'url:./media/pistol-4.png'
import p4Aud from 'url:./media/pistol-4.mp3'
import p5Vid from 'url:./media/pistol-5.png'
import p5Aud from 'url:./media/pistol-5.mp3'
import p6Vid from 'url:./media/pistol-6.png'
import p6Aud from 'url:./media/pistol-6.mp3'
import p7Vid from 'url:./media/pistol-7.png'
import p7Aud from 'url:./media/pistol-7.mp3'
import p8Vid from 'url:./media/pistol-8.png'
import p8Aud from 'url:./media/pistol-8.mp3'
import p9Vid from 'url:./media/pistol-9.png'
import p9Aud from 'url:./media/pistol-9.mp3'
import p10Vid from 'url:./media/pistol-10.png'
import p10Aud from 'url:./media/pistol-10.mp3'
import p11Vid from 'url:./media/pistol-11.png'
import p11Aud from 'url:./media/pistol-11.mp3'
import p12Vid from 'url:./media/pistol-12.png'
import p12Aud from 'url:./media/pistol-12.mp3'
import p13Vid from 'url:./media/pistol-13.png'
import p13Aud from 'url:./media/pistol-13.mp3'
import p14Vid from 'url:./media/pistol-14.png'
import p14Aud from 'url:./media/pistol-14.mp3'
import p15Vid from 'url:./media/pistol-15.png'
import p15Aud from 'url:./media/pistol-15.mp3'



export const PistolIntroVideo: React.FC = () => (<VideoCarousel files={getFiles()}/>);


const getFiles = () => ([
    {vid: p1Vid, aud: p1Aud},
    {vid: p2Vid, aud: p2Aud},
    {vid: p3Vid, aud: p3Aud},
    {vid: p4Vid, aud: p4Aud},
    {vid: p5Vid, aud: p5Aud},
    {vid: p6Vid, aud: p6Aud},
    {vid: p7Vid, aud: p7Aud},
    {vid: p8Vid, aud: p8Aud},
    {vid: p9Vid, aud: p9Aud},
    {vid: p10Vid, aud: p10Aud},
    {vid: p11Vid, aud: p11Aud},
    {vid: p12Vid, aud: p12Aud},
    {vid: p13Vid, aud: p13Aud},
    {vid: p14Vid, aud: p14Aud},
    {vid: p15Vid, aud: p15Aud}
])