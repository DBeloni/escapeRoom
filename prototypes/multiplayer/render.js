export function renderViewport(ctx, x, y, width, height, targetX, targetY, world, obstacle, players) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    let cameraX = targetX - width / 2;
    let cameraY = targetY - height / 2;

    cameraX = Math.max(0, Math.min(cameraX, world.width - width));
    cameraY = Math.max(0, Math.min(cameraY, world.height - height));

    ctx.translate(x - cameraX, y - cameraY);
    drawWorld(ctx, world, obstacle, players);
    ctx.restore();
}

function drawWorld(ctx, world, obstacle, players) {
    ctx.fillStyle = "#e5e5e5";
    ctx.fillRect(0, 0, world.width, world.height);

    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x <= world.width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, world.height);
    }

    for (let y = 0; y <= world.height; y += 40) {
        ctx.moveTo(0, y);
        ctx.lineTo(world.width, y);
    }

    ctx.stroke();

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, world.width, world.height);

    ctx.fillStyle = "red";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);

    for (const player of players) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.w, player.h);
    }
}
