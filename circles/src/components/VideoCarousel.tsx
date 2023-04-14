import {Button, Carousel, Switch} from 'antd'
import {useRef, useState} from "react";
import {CarouselRef} from "antd/lib/carousel/index.js";
import {
    FastBackwardFilled,
    StepBackwardFilled,
    CaretRightFilled,
    FastForwardFilled,
    StepForwardFilled
} from '@ant-design/icons'

export type VideoCarouselFiles = {
    vid: any
    aud: any
}[];

export const VideoCarousel: React.FC<{ files: VideoCarouselFiles }> = ({files}) => {
    const [playing, setPlaying] = useState(false);
    const [autoplay, setAutoplay] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0)

    const cRef = useRef<CarouselRef>(null);
    const aRefs = useRef(new Array(files.length));

    const stopAudio = () => Promise.all(
        aRefs.current.map(ref => {
            const r = ref?.pause();
            ref && (ref.currentTime = 0);
            return r;
        })
    );

    const audioEnded = () => {
        if(autoplay && currentSlide < (files.length - 1)) {
            cRef.current?.next();
        } else {
            setPlaying(false);
        }
    }

    stopAudio().then(() => playing && aRefs.current[currentSlide]?.play())

    const onCarouselChange = (slideNo: number) => setCurrentSlide(slideNo);

    return (
        <div style={{width: 500}}>
            {files.map((file, idx) => <audio src={files[idx].aud} onEnded={audioEnded} key={idx} ref={r => aRefs.current[idx] = r}/>)}
            <Carousel ref={cRef} afterChange={onCarouselChange} dots={false}>
                {files.map((file, idx) => (
                    <div key={idx}>
                        <img alt="slide" src={file.vid} style={{width: '100%'}}/>
                    </div>
                ))}
            </Carousel>
            <div style={{display: 'flex'}}>
                <Button icon={<FastBackwardFilled />} onClick={() => cRef.current?.goTo(0)}/>
                <Button icon={<StepBackwardFilled/>}  onClick={() => cRef.current?.prev()}/>
                <PlayBtn playing={playing} onToggle={() => setPlaying(!playing)}/>
                <Button icon={<StepForwardFilled/>}  onClick={() => cRef.current?.next()}/>
                <Button icon={<FastForwardFilled/>}  onClick={() => cRef.current?.goTo(files.length - 1)}/>
                <div style={{flex: 1}}></div>
                <label style={{paddingRight: 5}}>Auto-play:</label><Switch checked={autoplay}
                                                                           onClick={() => setAutoplay(!autoplay)}/>
            </div>
        </div>
    )
}

type PlayBtnProps = {
    playing: boolean,
    onToggle: () => void
}
const PlayBtn: React.FC<PlayBtnProps> = ({playing, onToggle}) => {
    return playing ? (
        <Button icon={<span style={{height: 8, width: 8, backgroundColor: 'black'}} ></span>} onClick={onToggle}/>
    ) : (
        <Button icon={<CaretRightFilled/>}  onClick={onToggle}/>
    )
}