export function parseToNumber(str: string | undefined | null, defaultValue: number) {
    if (!str) return defaultValue

    if (Number.isNaN(Number(str))) return defaultValue

    return Number(str)
}

export function maxIndex(numbers: number[]) {
    return numbers.indexOf(Math.max(...numbers))
}
