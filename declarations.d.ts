declare module '@mapbox/polyline' {
  const polyline: {
    encode(coords: [number, number][]): string;
    decode(str: string, precision?: number): [number, number][];
  };
  export = polyline;
}
