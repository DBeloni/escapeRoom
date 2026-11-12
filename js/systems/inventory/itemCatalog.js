export const ITEM_CATALOG = Object.freeze([
    Object.freeze({
        id: "ITM_001",
        name: "Chave de Fenda",
        description: "Ferramenta simples, deixada sobre a bancada de apoio da casa 01. A ponta ainda está em boas condições.",
        uses: Object.freeze([
            "Soltar as tábuas presas no tronco rachado",
            "Retirar os parafusos da proteção do motor",
            "Ajudar a apertar as peças do barco"
        ]),
        consumption: "reusable"
    }),
    Object.freeze({
        id: "ITM_002",
        name: "Chave Inglesa",
        description: "Chave ajustável encontrada na bancada da oficina de Nilo, com marcas de graxa no cabo.",
        uses: Object.freeze([
            "Soltar as porcas que prendem o motor",
            "Apertar as fixações durante a montagem"
        ]),
        consumption: "reusable"
    }),
    Object.freeze({
        id: "ITM_003",
        name: "Fita Isolante",
        description: "Rolo de fita preta guardado no armário de manutenção da rádio. Ainda tem material suficiente para um reparo.",
        uses: Object.freeze([
            "Isolar o trecho danificado do cabo do guincho"
        ]),
        consumption: "single-use"
    }),
    Object.freeze({
        id: "ITM_004",
        name: "Fusível de Cartucho",
        description: "Fusível de cerâmica encontrado no armário de manutenção da clínica.",
        uses: Object.freeze([
            "Substituir o fusível queimado no painel do guincho"
        ]),
        consumption: "single-use"
    }),
    Object.freeze({
        id: "ITM_005",
        name: "Galão de Gasolina",
        description: "Galão de reserva guardado na oficina, ao lado dos materiais de manutenção do cais.",
        uses: Object.freeze([
            "Abastecer o motor de popa antes da partida"
        ]),
        consumption: "single-use"
    })
]);

export const INVENTORY_CAPACITY = 5;

const itemsById = new Map(ITEM_CATALOG.map(item => [item.id, item]));

export function getItemDefinition(itemId) {
    return itemsById.get(itemId) ?? null;
}
