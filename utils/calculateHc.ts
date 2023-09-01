import { median } from "./median";

const SCORES_REQUIRED_FOR_HC = 5;

/**
 * ### Funktio ratakohtaisen tasoituksen laskemiseen
 *
 * @param pars Lista radan väylien par-tuloksista
 * @param scores Lista pelaajan kokonaistuloksista radalta
 * @example
 * ```js
 * const hc = calculateHc([3,3,3,4,3,4], [21, 20, 22]) // 21
 * ```
 */
export const calculateHc = (pars: number[], scores: number[]): number => {
    if (pars.length === 0 || scores.length < SCORES_REQUIRED_FOR_HC) return 0;
    const par = pars.reduce((p,c) => p+c, 0);
    const median10 = median(scores);
    return median10-par;
};