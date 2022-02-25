import { median } from "./median";
/**
 * Funktio väyläkohtaisen tasoituksen laskemiseen
 *
 * @param pars Lista väylien par-tuloksista
 * @param scores Lista pelaajan kokonaistuloksista radalta
 * @returns handicap
 */
export const calculateHc = (pars: number[], scores: number[]): number => {
    console.log(pars, scores);
    if (pars.length === 0 || scores.length === 0) return 0;
    const par = pars.reduce((p,c) => p+c, 0);
    const median10 = median(scores);
    return median10-par;
};