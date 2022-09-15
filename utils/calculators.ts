/**
 * ### Laskee plusminus tuloksen annettujen tulosten (scores) ja par (pars) arvojen avulla
 * @param scores
 * @param pars
 * @returns plusminus
 */
export const plusminus = (scores: number[], pars: number[]): number => {
    return scores.reduce((total: number, current: number, indeksi: number) => {
        if (!isNaN(current)) return total + current - pars[indeksi];
        return total;
    }, 0);
};

/**
 * ### Laskee yhteistuloksen annetuille tuloksille (scores) jättäen huomioitta ei-numeeriset solut.
 * @param scores
 * @returns
 */
export const total = (scores: number[]): number => {
    return scores.reduce((p, c) => {
        if (!isNaN(c)) return p + c;
        return p;
    }, 0);
};

export const holestats = (scores: string[][], parsStr: string[]) => {
    const pars = parsStr.map(par => Number.parseInt(par));
    let sumArray:Stat[] = [];
    for (const score of scores) {
        for (let i = 0; i < score.length; i++) {
            const scoreNum = Number.parseInt(score[i]);
            if (!sumArray[i]) sumArray[i] = { total: 0, count: 0, index: 0, best: 99999, par: 0, birdie: 0, bogey: 0, eagle: 0, doubleBogey: 0};
            sumArray[i].index = i;
            sumArray[i].total += scoreNum || 0;
            sumArray[i].count++;
            switch ((scoreNum - pars[i])) {
                case -2: sumArray[i].eagle++;
                break;
                case -1: sumArray[i].birdie++;
                break;
                case 0: sumArray[i].par++;
                break;
                case 1: sumArray[i].bogey++;
                break;
                case 2: sumArray[i].doubleBogey++;

            }
            if (sumArray[i].best > scoreNum) sumArray[i].best = scoreNum;
        }
    }
    sumArray = sumArray.map((stat:Stat) => {
        return {...stat, average: Math.round(stat.total/stat.count*100)/100};
    });
    return sumArray;
};

type Stat = {
    [key: string]: number
}