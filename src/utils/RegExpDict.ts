export class RegExpDict<T> {
    readonly #dict: Record<string, T>

    constructor(dict: Record<string, T>) {
        this.#dict = dict
    }

    get(key: string): T | undefined {
        for (const [reg, value] of Object.entries(this.#dict)) {
            if (new RegExp(`^${reg}$`).test(key)) {
                return value
            }
        }
    }

    *getAll(key: string) {
        for (const [reg, value] of Object.entries(this.#dict)) {
            if (new RegExp(`^${reg}$`).test(key)) {
                yield value
            }
        }
    }

    getKeys(): string[] {
        return Object.keys(this.#dict)
    }

    getValues(): T[] {
        return Object.values(this.#dict)
    }

    add(reg: string, value: T) {
        this.#dict[reg] = value
    }
}
