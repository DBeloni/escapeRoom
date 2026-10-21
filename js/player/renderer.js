export function renderPlayer(state, context, assets) {
    const drowning = state.player.drowning;

    if (drowning.active && drowning.phase === "bubbles") {
        renderBubbles(state, context, assets.drowningBubbles);
        return;
    }

    const image = drowning.active
        ? drowning.phase === "waist"
            ? assets.waterWaist
            : assets.waterNeck
        : assets.player;

    renderCharacter(state, context, image);
}

function renderCharacter(state, context, image) {
    let row = 1;
    if (state.player.direction === "baixo") row = 0;
    else if (state.player.direction === "cima") row = 2;

    const frameWidth = Math.floor(image.naturalWidth / 3);
    const top = Math.floor(row * image.naturalHeight / 3);
    const bottom = Math.floor((row + 1) * image.naturalHeight / 3);

    const sourceX = state.player.frame * frameWidth + 1;
    const sourceY = top + 1;
    const sourceWidth = frameWidth - 2;
    const sourceHeight = bottom - top - 2;

    const x = state.player.x - state.player.width / 2 - state.camera.x;
    const y = state.player.y - state.player.height / 2 - state.camera.y;

    context.save();

    if (state.player.direction === "direita") {
        context.translate(x + state.player.width, y);
        context.scale(-1, 1);
    } else {
        context.translate(x, y);
    }

    context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        state.player.width,
        state.player.height
    );

    context.restore();
}

function renderBubbles(state, context, image) {
    const frame = state.player.drowning.bubbleFrame;
    const column = frame % 3;
    const row = Math.floor(frame / 3);
    const frameWidth = Math.floor(image.naturalWidth / 3);
    const top = Math.floor((row * image.naturalHeight) / 3);
    const bottom = Math.floor(((row + 1) * image.naturalHeight) / 3);
    const sourceX = column * frameWidth + 1;
    const sourceY = top + 1;
    const sourceWidth = frameWidth - 2;
    const sourceHeight = bottom - top - 2;
    const x = state.player.x - state.player.width / 2 - state.camera.x;
    const y = state.player.y - state.player.height / 2 - state.camera.y;

    context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        x,
        y,
        state.player.width,
        state.player.height
    );
}
