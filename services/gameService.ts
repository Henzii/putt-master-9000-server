import { Game, ID } from "../types";

export const getGame = (id: ID): Game | null => {
    return games.find(g => g.id === id) || null;
}
export const getGames = (): Game[] => {
    return games;
}

export const createGame = (layoutId: ID): ID => {
    const id = Math.floor(Math.random() * 9999);
    games.push({
        id,
        date: new Date(),
        layout: layoutId,
        scorecards: []
    })
    return id;
}


const games: Game[] = []