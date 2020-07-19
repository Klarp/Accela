import Beatmap from './beatmap';
declare namespace PPCalculator {
    function calculate(beatmap: Beatmap, accuracyPercent?: number, modifiers?: number, combo?: number, misses?: number, scoreVersion?: number): number;
    function calculateWithCounts(aim: number, speed: number, beatmap: Beatmap, modifiers?: number, combo?: number, misses?: number, c300?: number, c100?: number, c50?: number, scoreVersion?: number): number;
}
export { PPCalculator };
export { Beatmap };
