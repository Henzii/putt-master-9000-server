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