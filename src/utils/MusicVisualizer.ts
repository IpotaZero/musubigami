export class MusicVisualizer {
    private ctx: CanvasRenderingContext2D
    private analyser: AnalyserNode
    private dataArray: Uint8Array<ArrayBuffer>
    private bufferLength: number

    constructor(private canvas: HTMLCanvasElement, private gainNode: GainNode, audioContext: AudioContext) {
        this.ctx = canvas.getContext("2d")!
        this.analyser = audioContext.createAnalyser()
        this.analyser.fftSize = 2048
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
}
