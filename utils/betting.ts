export const  cartesianProduct = <T>(...arrays: T[][]): T[][] => {
    return arrays.reduce<T[][]>(
      (acc, curr) =>
        acc.flatMap(a => curr.map(c => [...a, c])),
      [[]]
    );
  };
