export class LocalStorage {
    static readonly #KEY = "musubigami"

    static #createDefaultData() {
        return {
            stageDataList: Array.from({ length: 3 * 7 }, () => ({ cleared: false })),
            flags: [],
            bgmVolume: 9,
            seVolume: 9,
        }
    }

    static #getData(): Data {
        const json = localStorage.getItem(this.#KEY)
        return json ? JSON.parse(json) : this.#createDefaultData()
    }

    static #setData(data: Data) {
        localStorage.setItem(this.#KEY, JSON.stringify(data))
    }

    static getStageData(): StageData[] {
        const data = this.#getData()
        return data.stageDataList
    }

    static setStageData(stageId: number, stageData: StageData) {
        const data = this.#getData()
        data.stageDataList[stageId] = stageData
        this.#setData(data)
    }

    static getFlags(): Flag[] {
        const data = this.#getData()
        return data.flags
    }

    static addFlag(flag: Flag) {
        const data = this.#getData()

        if (data.flags.includes(flag)) return

        data.flags.push(flag)

        this.#setData(data)
    }

    static getBGMVolume() {
        const data = this.#getData()
        return data.bgmVolume
    }

    static getSEVolume() {
        const data = this.#getData()
        return data.seVolume
    }

    static setBGMVolume(volume: number) {
        const data = this.#getData()
        data.bgmVolume = volume
        this.#setData(data)
    }

    static setSEVolume(volume: number) {
        const data = this.#getData()
        data.seVolume = volume
        this.#setData(data)
    }

    static clear() {
        localStorage.removeItem(this.#KEY)
    }

    static allWin() {
        for (let i = 0; i < 21; i++) {
            this.setStageData(i, { cleared: true })
        }
    }
}

type Data = {
    stageDataList: StageData[]
    flags: Flag[]
    bgmVolume: number
    seVolume: number
}

type StageData = {
    cleared: boolean
}

type Flag = "始まり"
;(window as any).LocalStorage = LocalStorage
