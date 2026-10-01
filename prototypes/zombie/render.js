import { CONFIG } from "./config.js";

export function renderGame(ctx, canvas, game) {
    const { world, player, bots } = game.getState();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    let cameraX = player.x + player.w / 2 - canvas.width / 2;
    let cameraY = player.y + player.h / 2 - canvas.height / 2;

    cameraX = Math.max(0, Math.min(cameraX, world.width - canvas.width));
    cameraY = Math.max(0, Math.min(cameraY, world.height - canvas.height));

    ctx.translate(-cameraX, -cameraY);

    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, world.width, world.height);

    ctx.strokeStyle = "#282828";
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x <= world.width; x += CONFIG.gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, world.height);
    }

    for (let y = 0; y <= world.height; y += CONFIG.gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(world.width, y);
    }

    ctx.stroke();

    ctx.strokeStyle = "#ff5555";
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, world.width, world.height);

    ctx.fillStyle = "#444";
    world.obstacles.forEach((obstacle) => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    });

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);

    bots.forEach((bot) => drawBot(ctx, bot));
    ctx.restore();
}

function drawBot(ctx, bot) {
    ctx.fillStyle = bot.color;
    ctx.fillRect(bot.x, bot.y, bot.w, bot.h);

    const cx = bot.x + bot.w / 2;
    const cy = bot.y + bot.h / 2;
    const intensity = Math.min(1, Math.hypot(bot.vx, bot.vy) / CONFIG.botSpeed);

    let lookX = bot.vx;
    let lookY = bot.vy;
    const lookDistance = Math.hypot(lookX, lookY);

    if (lookDistance > 0.01) {
        lookX /= lookDistance;
        lookY /= lookDistance;
    }

    const offsetX = lookX * 3;
    const offsetY = lookY * 3;

    ctx.fillStyle = "#111";
    ctx.fillRect(cx - 11 + offsetX, cy - 7 + offsetY, 7, 7);
    ctx.fillRect(cx + 4 + offsetX, cy - 7 + offsetY, 7, 7);

    if (intensity > 0.15) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(cx - 9 + offsetX, cy - 5 + offsetY, 3, 3);
        ctx.fillRect(cx + 6 + offsetX, cy - 5 + offsetY, 3, 3);
    }
}
