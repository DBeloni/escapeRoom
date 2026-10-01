export function createCanvasView() {
    const canvas = document.getElementById("gameCanvas");

    if (!canvas) {
        throw new Error("Elemento #gameCanvas não encontrado.");
    }

    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Não foi possível criar o contexto 2D do canvas.");
    }

    return {
        canvas,
        context,
        loading: document.getElementById("loading"),
        controls: document.getElementById("controls"),
        width: 0,
        height: 0,
        pixelRatio: 1
    };
}

export function resizeCanvas(view) {
    const rect = view.canvas.getBoundingClientRect();

    view.width = rect.width;
    view.height = rect.height;
    view.pixelRatio = window.devicePixelRatio || 1;

    view.canvas.width = Math.floor(view.width * view.pixelRatio);
    view.canvas.height = Math.floor(view.height * view.pixelRatio);

    view.context.imageSmoothingEnabled = false;
}
