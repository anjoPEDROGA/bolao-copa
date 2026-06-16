import type { Group } from "@/types";

// Grupos temporários para fallback visual enquanto a origem remota não entrega dados.
export const staticGroups: Group[] = [
  {
    id: "group-a",
    name: "Grupo A",
    teamIds: ["brazil", "mexico", "canada", "usa"]
  },
  {
    id: "group-b",
    name: "Grupo B",
    teamIds: ["argentina", "japan", "morocco", "croatia"]
  },
  {
    id: "group-c",
    name: "Grupo C",
    teamIds: ["france", "germany", "spain", "portugal"]
  },
  {
    id: "group-d",
    name: "Grupo D",
    teamIds: ["england", "netherlands", "italy", "south-korea"]
  }
];
