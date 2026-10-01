export function renderInventory(list, items) {
    const values = [...items];

    list.innerHTML = values.length
        ? values.map((item) => `<li style="background-color:${item.color}">${item.name}</li>`).join("")
        : '<li style="color:black;font-weight:normal">Vazio</li>';
}
