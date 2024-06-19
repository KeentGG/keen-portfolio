import type { Point } from "../types/trig.ts"


export function degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

export function radToPoint(rad: number, radius: number): Point {
    const x: number = Math.ceil(radius * Math.cos(rad));
    const y: number = Math.ceil(radius * Math.sin(rad) * -1);

    return {x, y}
}