export const ITEM_CATALOG = Object.freeze([
    Object.freeze({
        id: "ITM_001",
        name: "Chave de Fenda",
        description: "Uma chave de fenda robusta com cabo de acrílico amarelo transparente. Apresenta marcas de uso na ponta de fenda simples.",
        uses: Object.freeze([
            "Remover parafusos de painéis elétricos",
            "Abrir grades de ventilação aparafusadas",
            "Forçar trincos de armários frágeis"
        ]),
        consumption: "reusable"
    }),
    Object.freeze({
        id: "ITM_002",
        name: "Chave Inglesa",
        description: "Uma chave ajustável de metal pesado com marcas de graxa. O mecanismo de rosca manual funciona perfeitamente.",
        uses: Object.freeze([
            "Girar válvulas emperradas de tubulações de gás, água ou vapor",
            "Desatarraxar porcas grandes de trincos mecânicos e portões"
        ]),
        consumption: "reusable"
    }),
    Object.freeze({
        id: "ITM_003",
        name: "Fita Isolante",
        description: "Um rolo de fita adesiva preta emborrachada, essencial para reparos rápidos na fiação dos anos 80.",
        uses: Object.freeze([
            "Remendar fiação desencapada para restabelecer energia",
            "Isolar circuitos curtos-circuitados em painéis de fusíveis"
        ]),
        consumption: "single-use"
    }),
    Object.freeze({
        id: "ITM_004",
        name: "Fusível de Cartucho",
        description: "Um fusível cilíndrico de cerâmica com pontas de metal, usado em caixas de luz e quadros elétricos antigos.",
        uses: Object.freeze([
            "Substituir peças queimadas em painéis elétricos para reativar elevadores, portões automáticos, iluminação ou maquinários industriais"
        ]),
        consumption: "single-use"
    }),
    Object.freeze({
        id: "ITM_005",
        name: "Galão de Gasolina",
        description: "Um galão plástico vermelho de 5 litros com um bico flexível. O líquido chacoalha pesadamente lá dentro.",
        uses: Object.freeze([
            "Abastecer motores de geradores de energia secos",
            "Abastecer motores de veículos para movê-los",
            "Queimar obstáculos biológicos ou inflamáveis no mapa"
        ]),
        consumption: "single-use"
    })
]);

export const INVENTORY_CAPACITY = 5;

const itemsById = new Map(ITEM_CATALOG.map(item => [item.id, item]));

export function getItemDefinition(itemId) {
    return itemsById.get(itemId) ?? null;
}
