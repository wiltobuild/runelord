import { realmOrder, type State } from "../../../packages/engine/index";

export const realmNames = {infernal: "Infernal", forest: "Thornroot Forest", "frozen-wastes": "Frozen Wastes"} as const;
export const routeDescription = (state: State) => realmOrder(state).map(realm => realmNames[realm]).join(" → ");
