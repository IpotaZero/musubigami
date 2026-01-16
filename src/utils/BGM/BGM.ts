import { Awaits } from "../Awaits"
import { Player } from "./Player"

export type BGMOptions = Partial<{
    loopStartS: number
    loopEndS: number
    loop: boolean
    volume: number
}>

export class BGM {
    static context: AudioContext
    static gain: GainNode

    private static cache = new Map<string, AudioBuffer>()
    private static bgmList: Player[] = []

    static async init() {
        if (this.context) throw new Error("BGM has already been initialized.")

        this.context = new AudioContext()
        this.gain = this.context.createGain()
        this.gain.connect(this.context.destination)

        await this.context.resume()
    }

    /**
     * audioBufferをcacheする
     * @param url 読み込む音声のurl
     * @returns
     */
    static async load(url: string) {
        if (this.cache.has(url)) return

        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        const buffer = await BGM.context.decodeAudioData(arrayBuffer)

        this.cache.set(url, buffer)
    }

    /**
     * 特定のBGMをキャッシュから削除し、メモリを解放します。
     * @param url 削除したいBGMのURL
     */
    static unload(url: string) {
        if (this.cache.has(url)) {
            this.cache.delete(url)
            // JavaScriptのガベージコレクションによって、
            // どこからも参照されなくなったAudioBufferは自動的にメモリから解放されます。
        }
    }

    /**
     * すべてのキャッシュをクリアします。
     * 大きなシーン切り替え（例：タイトルからゲーム本編へ）の際に有効です。
     */
    static clearCache() {
        this.cache.clear()
    }

    static async change(url: string, options: BGMOptions = {}) {
        await Promise.all([this.load(url), this.fadeOutAndStop()])

        this.bgmList = [new Player(this.cache.get(url)!, options)]
        this.play()
    }

    static async glance(url: string, options: BGMOptions = {}) {
        await Promise.all([this.load(url), this.fadeOutAndPause()])

        this.bgmList.push(new Player(this.cache.get(url)!, options))
        this.play()
    }

    static async back() {
        await this.fadeOutAndStop()
        this.bgmList.pop()
        this.play()
    }

    static stop() {
        this.bgmList.at(-1)?.stop()
    }

    private static async play() {
        if (this.bgmList.length === 0) return
        const current = this.bgmList.at(-1)!

        await current.setFadeVolume(0.1)
        current.play()
        current.fade(1000, 1)
    }

    static setVolume(volume: number) {
        if (this.gain) this.gain.gain.value = volume
    }

    static async fadeOutAndPause() {
        this.bgmList.at(-1)?.fadeOutAndPause(2000)
        await Awaits.sleep(1000)
    }

    static async fadeOutAndStop() {
        this.bgmList.at(-1)?.fadeOutAndStop(2000)
        await Awaits.sleep(1000)
    }
}

;(window as any).BGM = BGM
