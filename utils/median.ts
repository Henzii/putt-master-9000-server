export function median(numbersArray: number[]) {

    if (numbersArray.length === 0) return 0;

    // Järjestetty kopio numbersArray:sta sekä null & undefined arvot poistettuna
    const sortedValues = [...numbersArray].sort((a, b) => a - b).filter(n => n);

    const half = Math.floor(sortedValues.length / 2);

    if (sortedValues.length % 2)
        return sortedValues[half];

    return (sortedValues[half - 1] + sortedValues[half]) / 2.0;
}