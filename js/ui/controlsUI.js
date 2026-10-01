export function updateControlsUI(view, state, scene) {
    if (!view.controls) return;

    if (scene.id === "casa") {
        view.controls.innerHTML = `<strong>Dentro da casa</strong><br>
            WASD / Setas → Mover<br>
            F3 → ${state.flags.debug ? "Esconder colisões" : "Mostrar colisões"}<br>
            Esc → Sair`;
        return;
    }

    view.controls.innerHTML = `<strong>Controles</strong><br>
        WASD / Setas → Mover<br>
        F3 → ${state.flags.debug ? "Esconder colisões" : "Mostrar colisões"}<br>
        <span style="color:#ff6666">Vermelho = barreira</span> |
        <span style="color:#4ca8ff">Azul = água</span>`;
}

export function hideLoading(view) {
    if (view.loading) view.loading.style.display = "none";
}
