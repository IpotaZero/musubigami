// src/audio/BGM.ts
type BGMOptions = {
    loopStartS?: number
    loopEndS?: number
    loop?: boolean
    volume?: number
    when?: number
}

export class BGM {
    static readonly #context: AudioContext = new AudioContext()
    static readonly #wholeGain: GainNode = this.#context.createGain()
    static #volume = 1
    static #currentBGM: BGM | null = null

    static {
        this.#wholeGain.connect(this.#context.destination)
    }

    // instance

    #path: string
    #gain: GainNode
    #localVolume: number = 1
    #ready: Promise<void>
    #source: AudioBufferSourceNode | null = null
    #isStarted = false

    private constructor(path: string, options: BGMOptions) {
        this.#path = path
        this.#localVolume = options.volume ?? 1

        this.#gain = BGM.#context.createGain()
        this.#gain.gain.value = this.#localVolume
        this.#gain.connect(BGM.#wholeGain)

        this.#ready = this.#localFetch(options)
    }

    async #localFetch(options: BGMOptions) {
        const response = await fetch(this.#path)
        const arrayBuffer = await response.arrayBuffer()
        const buffer = await BGM.#context.decodeAudioData(arrayBuffer)

        this.#source = BGM.#context.createBufferSource()
        this.#source.buffer = buffer
        this.#source.loopStart = options.loopStartS ?? 0
        this.#source.loopEnd = options.loopEndS ?? buffer.duration
        this.#source.loop = options.loop ?? true
        this.#source.connect(this.#gain)
    }

    async #localFadeOut(durationMS: number) {
        this.#gain.gain.setValueAtTime(this.#localVolume, BGM.#context.currentTime)
        this.#gain.gain.linearRampToValueAtTime(0, BGM.#context.currentTime + durationMS / 1000)

        await new Promise((resolve) => setTimeout(resolve, durationMS))
        this.#gain.disconnect()

        if (this.#isStarted) this.#source?.stop()
        this.#source?.disconnect()
    }

    // class

    static getPath() {
        return this.#currentBGM ? this.#currentBGM.#path : ""
    }

    static async ffp(path: string, options: BGMOptions = {}) {
        await Promise.all([this.#fadeOut(1000), this.#fetch(path, options)])
        if (this.getPath() === path) {
            this.#play(options.when ?? 0)
        }
    }

    static async #fetch(path: string, options: BGMOptions) {
        this.#currentBGM = new BGM(path, options)
        await this.#currentBGM.#ready
    }

    static #play(when: number) {
        if (!this.#currentBGM) return
        this.#currentBGM.#source?.start(this.#context.currentTime + when)
        this.#currentBGM.#isStarted = true
    }

    static setVolume(volume: number) {
        this.#volume = volume
        this.#wholeGain.gain.value = this.#volume
    }

    static async #fadeOut(durationMS: number) {
        if (!this.#currentBGM) return
        await this.#currentBGM.#localFadeOut(durationMS)
    }
}

;(window as any).BGM = BGM
