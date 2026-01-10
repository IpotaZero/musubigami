import { Serif } from "../../utils/Serif"
import { LocalStorage } from "../../LocalStorage"
import { MapConfig } from "./MapConfig"
import { Flag } from "../../LocalStorage"

export class MapStoryHandler {
    async playStageIntro(stageId: number) {
        // @ts-ignore
        const commands = await import(`../../../assets/stories/story.js`)
        await Serif.say(...commands.default[stageId].start)
    }

    async playTutorial(stageId: number) {
        const tutorialIndex = MapConfig.TUTORIAL_STAGES.indexOf(stageId)
        if (tutorialIndex === -1) return

        // @ts-ignore
        const commands = await import("../../../assets/stories/tutorial.js")
        await Serif.say(...commands.default[tutorialIndex])
    }

    async playEvent(eventName: string, flagToSet?: Flag) {
        if (flagToSet && LocalStorage.getFlags().includes(flagToSet)) return

        // @ts-ignore
        const commands = await import("../../../assets/stories/event.js")
        await Serif.say(...commands.default[eventName])

        if (flagToSet) LocalStorage.addFlag(flagToSet)
    }
}
