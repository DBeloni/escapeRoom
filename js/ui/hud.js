export function updateHud(view, state, scene) {
    const debugText = state.flags.debug ? "Esconder debug" : "Mostrar debug";

    if (scene.id === "casa") {
        view.controls.innerHTML = `
            <strong>${scene.name}</strong><br>
            WASD / Setas → Mover<br>
            F3 → ${debugText}<br>
            Esc → Sair`;
        return;
    }

    view.controls.innerHTML = `
        <strong>Controles</strong><br>
        WASD / Setas → Mover<br>
        F3 → ${debugText}<br>
        <span style="color:#ff6666">Vermelho = barreira</span> |
        <span style="color:#4ca8ff">Azul = água</span>`;
}

export function hideLoading(view) {
    view.loading.style.display = "none";
}
