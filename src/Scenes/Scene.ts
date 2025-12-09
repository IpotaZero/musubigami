export abstract class Scene {
    abstract readonly ready: Promise<void>
    async end() {}
}
