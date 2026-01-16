export const MapConfig = {
    STAGE_OFFSETS: [0, 7, 13],
    UNLOCK_ARROW_TRIGGERS: {
        TO_CH1: 6,
        TO_CH2: 12,
    },
    TUTORIAL_STAGES: [0, 2, 5, 7, 17],

    BOSSES: [6, 12, 16, 17],

    getGlobalStageId(chapterIndex: number, localStageIndex: number): number {
        return localStageIndex + (this.STAGE_OFFSETS[chapterIndex] || 0)
    },
}
