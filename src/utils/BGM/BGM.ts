import { Awaits } from "../Awaits"
import { Tasks } from "../Task"
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
    private static bgmList: { bgm: Player; url: string }[] = []

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
        // 再生しようとしているものをキャンセルする。
        Tasks.cancel(url)

        if (this.cache.has(url)) {
            this.cache.delete(url)
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
        const task = Tasks.register(url)
        await Promise.all([this.load(url), this.fadeOut()])
        if (task.canceled) return
        this.pause()

        const bgm = new Player(this.cache.get(url)!, options)
        bgm.play()
        this.bgmList = [{ bgm, url }]
    }

    // キャンセル不可
    static async glance(url: string, options: BGMOptions = {}) {
        const task = Tasks.register(url)
        await Promise.all([this.load(url), this.fadeOut()])
        if (task.canceled) return
        this.pause()

        const bgm = new Player(this.cache.get(url)!, options)
        bgm.play()
        this.bgmList.push({ bgm, url })
    }

    static back() {
        if (this.bgmList.length <= 1) {
            console.warn("戻る場所が無いよ!")
            return
        }

        const current = this.bgmList.pop()!
        current.bgm.fade(2000, 1, 0.001).then(() => {
            current.bgm.stop()
        })

        const nei = this.bgmList.at(-1)!
        nei.bgm.fade(1000, 0.001, 1)
        nei.bgm.play()
    }

    static async fadeOut(ms = 1000) {
        const current = this.bgmList.at(-1)?.bgm
        if (!current) return

        await current.fade(ms, 1, 0.001)
        return current
    }

    static stop() {
        this.bgmList.at(-1)?.bgm.stop()
    }

    static pause() {
        this.bgmList.at(-1)?.bgm.pause()
    }

    static setVolume(volume: number) {
        if (this.gain) this.gain.gain.value = volume
    }
}

;(window as any).BGM = BGM
