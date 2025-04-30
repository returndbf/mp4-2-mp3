import {createEffect, createSignal} from 'solid-js'

import './App.css'
import {fetchFile, toBlobURL} from "@ffmpeg/util";
import {FFmpeg} from "@ffmpeg/ffmpeg";
import {ProgressEvent} from "@ffmpeg/ffmpeg";

function App() {
    const [file, setFile] = createSignal<File>();
    // const [loaded,setLoaded] = createSignal(false)
    const [ffmpeg] = createSignal(new FFmpeg())
    const [progress, setProgress] = createSignal<number>(1)

    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.9/dist/esm'

    createEffect(async () => {
        ffmpeg().on('progress', (message: ProgressEvent) => {
            console.log(message)
            setProgress(Number(message.progress.toFixed(2)))
        })
         await ffmpeg().load({
             coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
             wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
             workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
             // coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
             // wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
             // workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
         })
    }, [])

    const handleFileChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files!;
        console.log(files[0])
        setFile(files[0])
    };

    const click = async () => {
        if (!file()) {
            return
        }
        await ffmpeg().writeFile("video.mp4", await fetchFile(file()));
        await ffmpeg().exec(["-i", "video.mp4", `${file()?.name}.mp3`]);
        const fileData = await ffmpeg().readFile(`${file()?.name}.mp3`);
        const data = new Uint8Array(fileData as ArrayBuffer);
        console.log(data);
        // const uint8Array = new Uint8Array(data); // 示例数据
        const blob = new Blob([data], {type: 'application/octet-stream'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file()?.name}.mp3`; // 自定义文件名
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

    }
    return (
        <>
            <div style={{display:'flex',"justify-content":'space-around',"align-items":'end'}}>
                <div>
            <legend class="fieldset-legend">上传mp4文件</legend>
            <input type="file" class="file-input file-input-secondary" onInput={handleFileChange}
                   accept={'video/mp4'}/>
                </div>
            <button class="btn" onClick={click} disabled={progress() !== 1 || !file()}>
                {progress() === 1 ? '转换' : progress()! * 100 + '%'}
            </button>
            </div>
        </>
    )
}

export default App
