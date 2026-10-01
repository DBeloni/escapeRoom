export function configureMap(state, mapImage) {
    state.map.width = mapImage.naturalWidth;
    state.map.height = mapImage.naturalHeight;
}
