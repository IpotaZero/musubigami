export class Sound {
    #audio: HTMLAudioElement
    #baseVolume: number

    constructor(path: string, volume: number = 0.5) {
        this.#audio = new Audio(path)
        this.#baseVolume = volume
        this.#audio.volume = volume
    }

    get duration() {
        return this.#audio.duration
    }

    play() {
        this.#audio.currentTime = 0
        this.#audio.play()
    }

    setVolume(ratio: number) {
        this.#audio.volume = ratio * this.#baseVolume
    }
}

export class SE {
    static clear = new Sound("assets/sounds/se/clear.mp3", 1)
    static move = new Sound("assets/sounds/se/マウススプレー・口内.mp3", 0.5)
    static reset = new Sound("assets/sounds/se/窓を開ける.mp3", 1)
    static switch = new Sound("assets/sounds/se/引き戸を閉める.mp3", 1)
    static click = new Sound("assets/sounds/se/カーソル移動2.mp3", 1)
    static suzu = new Sound("assets/sounds/se/鈴が鳴る.mp3", 1)
    static kansei = new Sound("assets/sounds/se/歓声.mp3", 1)
    static voice = new Sound("assets/sounds/se/voice.mp3", 0.5)

    static setVolume(volume: number) {
        Object.values(this).forEach((se) => {
            se.setVolume(volume)
        })
    }
}
