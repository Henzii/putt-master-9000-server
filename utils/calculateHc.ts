import { median } from "./median";
import config from "./config";

export const calculateHc = (pars: number[], scores: number[]): number => {
    if (pars.length === 0 || scores.length < config.scoresRequiredForHC) return 0;
    const par = pars.reduce((p,c) => p+c, 0);
    const median10 = median(scores);
    return median10-par;
};