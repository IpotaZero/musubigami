import { vec } from "./Vec"

export class MusicVisualizer {
    private ctx: CanvasRenderingContext2D
    private analyser: AnalyserNode
    private dataArray: Uint8Array<ArrayBuffer>
    private bufferLength: number

    constructor(private canvas: HTMLCanvasElement, private gainNode: GainNode, audioContext: AudioContext) {
        this.ctx = canvas.getContext("2d")!

        this.analyser = audioContext.createAnalyser()
        this.analyser.fftSize = 64

        this.bufferLength = this.analyser.fftSize
        this.dataArray = new Uint8Array(this.bufferLength)

        // Connect gainNode to analyser, then to destination
        this.gainNode.connect(this.analyser)
        // this.analyser.connect(audioContext.destination)
    }

    update() {
        this.analyser.getByteTimeDomainData(this.dataArray)

        const { width, height } = this.canvas
        this.ctx.clearRect(0, 0, width, height)

        this.ctx.lineWidth = 2
        this.ctx.strokeStyle = "#8882"
        this.ctx.beginPath()

        const sliceWidth = width / this.bufferLength
        let x = 0

        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0
            const y = (v * height) / 2

            if (i === 0) {
                this.ctx.moveTo(x, y)
            } else {
                this.ctx.lineTo(x, y)
            }
            x += sliceWidth
        }

        this.ctx.lineTo(width, height / 2)
        this.ctx.stroke()
    }

    // 周波数データを描画するメソッド
    drawFrequency(color: string, x: number, y: number, radius_in: number, radius_ex: number) {
        const buffer_length = this.analyser.frequencyBinCount
        const data_array = new Uint8Array(buffer_length)
        this.analyser.getByteFrequencyData(data_array)

        // 円の中心と半径を設定
        const center = vec(x, y)
        const bar_width = (Math.PI * 2) / buffer_length // 1本のバーが占める角度

        const { width, height } = this.canvas

        this.ctx.clearRect(0, 0, width, height)

        this.ctx.save()

        this.ctx.strokeStyle = color // 色を変更
        this.ctx.lineWidth = 2

        const d = 16
        const lv = 1.5
        const bar_height = (radius_ex - radius_in) / lv / d

        for (let i = 0; i < buffer_length; i++) {
            const num = Math.floor(data_array[i] / (256 / d)) // 高さを周波数データに基づいて決定

            // 各バーの角度を計算
            const angle = i * bar_width

            const direction = vec(1, 0).rotated(angle)
            const direction2 = vec(1, 0).rotated(angle + (bar_width * 3) / 4)

            for (let i = 0; i < num; i++) {
                const start = center.plus(direction.scaled(radius_in + bar_height * i * lv))
                const end = center.plus(direction.scaled(radius_in + bar_height * (i * lv + 1)))
                const start2 = center.plus(direction2.scaled(radius_in + bar_height * i * lv))
                const end2 = center.plus(direction2.scaled(radius_in + bar_height * (i * lv + 1)))

                // 描画
                this.ctx.beginPath()
                this.ctx.moveTo(start.x, start.y)
                this.ctx.lineTo(end.x, end.y)
                this.ctx.lineTo(end2.x, end2.y)
                this.ctx.lineTo(start2.x, start2.y)
                this.ctx.closePath()

                this.ctx.stroke()
            }
        }

        this.ctx.restore()
    }
}
