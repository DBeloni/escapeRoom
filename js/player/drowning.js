import { GAME_CONFIG } from "../config/gameConfig.js";

const PHASES = ["waist", "neck", "bubbles"];

export function startDrowningAnimation(state) {
    const drowning = state.player.drowning;

    if (drowning.active) return;

    drowning.active = true;
    drowning.phase = PHASES[0];
    drowning.elapsed = 0;
    drowning.bubbleFrame = 0;
    state.player.frame = 0;
    state.player.animationTime = 0;
}

export function updateDrowningAnimation(state, deltaSeconds, onComplete) {
    const drowning = state.player.drowning;
    if (!drowning.active) return false;

    const { waistDuration, neckDuration, bubblesDuration } =
        GAME_CONFIG.drowningAnimation;
    const totalDuration = waistDuration + neckDuration + bubblesDuration;

    drowning.elapsed += deltaSeconds;

    if (drowning.elapsed >= totalDuration) {
        drowning.active = false;
        drowning.phase = null;
        drowning.elapsed = 0;
        drowning.bubbleFrame = 0;
        state.player.frame = 0;
        state.player.animationTime = 0;
        onComplete?.();
        return true;
    }

    if (drowning.elapsed < waistDuration) {
        drowning.phase = "waist";
        state.player.frame = frameFor(drowning.elapsed, waistDuration, 3);
        return false;
    }

    if (drowning.elapsed < waistDuration + neckDuration) {
        drowning.phase = "neck";
        state.player.frame = frameFor(
            drowning.elapsed - waistDuration,
            neckDuration,
            3
        );
        return false;
    }

    drowning.phase = "bubbles";
    drowning.bubbleFrame = frameFor(
        drowning.elapsed - waistDuration - neckDuration,
        bubblesDuration,
        9
    );
    return false;
}

function frameFor(elapsed, duration, totalFrames) {
    return Math.min(totalFrames - 1, Math.floor((elapsed / duration) * totalFrames));
}
