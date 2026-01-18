import { Awaits } from "../Awaits"
import { BGMOptions, BGM } from "./BGM"

export class Player {
    private readonly buffer: AudioBuffer
    private readonly options: BGMOptions
    private readonly gain: GainNode
    private readonly fadeGain: GainNode
    private source: AudioBufferSourceNode

    private state: "yet" | "running" | "paused" = "yet"
    private startTime = 0
    private offset = 0

    constructor(buffer: AudioBuffer, options: BGMOptions = {}) {
        this.buffer = buffer
        this.options = options

        this.gain = BGM.context.createGain()
        this.gain.connect(BGM.gain)
        this.gain.gain.value = options.volume ?? 1

        this.fadeGain = BGM.context.createGain()
        this.fadeGain.connect(this.gain)

        this.source = Player.createSource(this.buffer, this.options)
        this.source.connect(this.fadeGain)
    }

    play() {
        if (this.state === "running") {
            console.warn("既に再生中!")
            return
        }

        this.resetSource()
        this.state = "running"

        // 再生位置を計算
        this.source.start(0, this.offset)
        this.startTime = BGM.context.currentTime - this.offset
    }

    pause() {
        if (this.state == "yet") {
            console.warn("まだ再生されていない!")
            return
        }

        this.state = "paused"
        this.source.stop()

        // 停止した瞬間の再生位置を記録
        this.offset = BGM.context.currentTime - this.startTime
    }

    stop() {
        if (this.state == "yet") {
            console.warn("まだ再生されていない!")
            return
        }

        this.state = "yet"
        this.source.stop()

        this.offset = 0
    }

    async fade(ms: number, from: number, to: number) {
        const now = BGM.context.currentTime
        this.fadeGain.gain.cancelScheduledValues(now)
        this.fadeGain.gain.setValueAtTime(from, now)
        this.fadeGain.gain.exponentialRampToValueAtTime(to, now + ms / 1000)
        await Awaits.sleep(ms)
    }

    private resetSource() {
        // AudioBufferSourceNodeは使い捨てなので、再生のたびに作成する
        try {
            this.source.stop()
        } catch (e) {}

        this.source.disconnect()

        this.source = Player.createSource(this.buffer, this.options)
        this.source.connect(this.fadeGain)
    }

    private static createSource(buffer: AudioBuffer, options: BGMOptions) {
        const source = BGM.context.createBufferSource()
        source.buffer = buffer
        source.loopStart = options.loopStartS ?? 0
        source.loopEnd = options.loopEndS ?? buffer.duration
        source.loop = options.loop ?? true

        return source
    }
}
