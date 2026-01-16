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
    private elapsedTime = 0

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

    async setFadeVolume(volume: number) {
        this.fadeGain.gain.cancelScheduledValues(BGM.context.currentTime)
        this.fadeGain.gain.setValueAtTime(this.fadeGain.gain.value, BGM.context.currentTime)
        this.fadeGain.gain.linearRampToValueAtTime(volume, BGM.context.currentTime + 0.1)
        await Awaits.sleep(100)
    }

    play() {
        if (this.state === "running") return

        this.state = "running"
        this.resetSource()

        this.fadeGain.gain.value = 1

        // 再生位置を計算
        const offset = this.elapsedTime % this.buffer.duration
        this.source.start(0, offset)
        this.startTime = BGM.context.currentTime - offset
    }

    stop() {
        this.state = "yet"
        this.elapsedTime = 0
        this.source.stop()
    }

    pause() {
        if (this.state !== "running") return

        this.state = "paused"
        // 停止した瞬間の再生位置を記録
        this.elapsedTime = BGM.context.currentTime - this.startTime
        this.source.stop()
    }

    async fadeOutAndPause(ms: number) {
        if (this.state !== "running") return
        await this.fade(ms, 0.001)
        this.pause()
    }

    async fadeOutAndStop(ms: number) {
        if (this.state !== "running") return
        await this.fade(ms, 0.001)
        this.stop()
    }

    async fade(ms: number, volume: number) {
        const now = BGM.context.currentTime
        this.fadeGain.gain.cancelScheduledValues(now)
        this.fadeGain.gain.setValueAtTime(this.fadeGain.gain.value, now)
        this.fadeGain.gain.exponentialRampToValueAtTime(volume, now + ms / 1000)
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
