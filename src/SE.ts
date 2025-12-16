export class Sound {
    #audio: HTMLAudioElement

    constructor(path: string, volume: number = 0.5) {
        this.#audio = new Audio(path)
        this.#audio.volume = volume
    }

    get duration() {
        return this.#audio.duration
    }

    play() {
        this.#audio.currentTime = 0
        this.#audio.play()
    }

    setVolume(volume: number) {
        this.#audio.volume = volume
    }
}

export class SE {
    static clear = new Sound("assets/sounds/se/clear.mp3", 1)
    static move = new Sound("assets/sounds/se/マウススプレー・口内.mp3", 0.3)
    static reset = new Sound("assets/sounds/se/窓を開ける.mp3", 1)

    static setVolume(volume: number) {
        Object.values(this).forEach((se) => {
            se.setVolume(volume)
        })
    }
}
