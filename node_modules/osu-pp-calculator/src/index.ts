import BeatmapModifier from './mods';
import DifficultyCalculator, {BeatmapDifficulty} from './diff-calc';
import Beatmap from './beatmap';

namespace PPCalculator {
  // turns the beatmaps' strain attributes into a larger value, suitable 
  // for pp calc. not 100% sure what is going on here, but it probably makes
  // strain values scale a bit exponentially.
  const calculateBaseStrain = (strain: number): number =>
    Math.pow(5.0 * Math.max(1.0, strain * 14.8148148) - 4.0, 3.0) * 0.00001;

  const accuracyCalc = (c300: number, c100: number, c50: number, misses: number): number => {
    const totalHits: number = c300 + c100 + c50 + misses;
    let accuracy: number = 0.0;
    if (totalHits > 0) {
      accuracy = (
        c50 * 50.0 + c100 * 100.0 + c300 * 300.0) /
        (totalHits * 300.0);
    }
    return accuracy;
  };

  const calc100Count = (accuracy: number, totalHits: number, misses: number) =>
    Math.round(-3 / 2 * ((accuracy - 1) * totalHits + misses));

  export function calculate(beatmap: Beatmap, accuracyPercent: number = 100,
    modifiers: number = BeatmapModifier.None, combo: number = -1,
    misses: number = 0, scoreVersion: number = 1): number {

    beatmap.applyMods(modifiers);
    const diff: BeatmapDifficulty = DifficultyCalculator.calculate(beatmap);
    const hitObjectCount = beatmap.hitObjects.length;


    // cap misses to num objects
    misses = Math.min(hitObjectCount, misses);

    // cap acc to max acc with the given amount of misses
    const max300 = hitObjectCount - misses;

    accuracyPercent = Math.max(0.0,
        Math.min(accuracyCalc(max300, 0, 0, misses) * 100.0, accuracyPercent));

    // round acc to the closest amount of 100s or 50s
    let c50 = 0;
    let c100 = Math.round(-3.0 * ((accuracyPercent * 0.01 - 1.0) *
      hitObjectCount + misses) * 0.5);

    if (c100 > hitObjectCount - misses) {
      // acc lower than all 100s, use 50s
      c100 = 0;
      c50 = Math.round(-6.0 * ((accuracyPercent * 0.01 - 1.0) *
        hitObjectCount + misses) * 0.2);

      c50 = Math.min(max300, c50);
    } else {
      c100 = Math.min(max300, c100);
    }

    let c300 = hitObjectCount - c100 - c50 - misses;

    return calculateWithCounts(diff.aim, diff.speed, beatmap, modifiers, combo, misses, c300, c100, 0,
      scoreVersion);
  }

  export function calculateWithCounts(aim: number, speed: number, beatmap: Beatmap, modifiers: number = BeatmapModifier.None,
    combo: number = -1, misses: number = 0, c300: number = -1, c100: number = 0, c50: number = 0, scoreVersion: number = 1): number {

    if (!beatmap.combo)
      throw new Error("Max combo cannot be zero");

    if (scoreVersion !== 1 && scoreVersion !== 2)
      throw new Error("This score version does not exist or isn't supported");

    let overallDifficulty: number = beatmap.overallDifficulty;
    let approachRate: number = beatmap.approachRate;
    let circles: number = beatmap.circleCount;

    if (c300 <= 0)
      c300 = beatmap.hitObjects.length - c100 - c50 - misses;

    combo = combo <= 0 ? beatmap.combo : combo;

    const totalHits: number = c300 + c100 + c50 + misses;

    // accuracy (not in percentage, ranges between 0 and 1)
    const accuracy: number = accuracyCalc(c300, c100, c50, misses);

    // length bonus (reused in speed pp)
    const totalHitsOver2k: number = totalHits / 2000.0;
    const lengthBonus: number = 0.95 +
      0.4 * Math.min(1.0, totalHitsOver2k) +
      (totalHits > 2000 ? (Math.log(totalHitsOver2k) / Math.LN10) * 0.5 : 0.0);

    // miss penality (reused in speed pp)
    const missPenalty: number = Math.pow(0.97, misses);

    // combo break penality (reused in speed pp)
    const comboBreakPenalty: number =
      Math.pow(combo, 0.8) / Math.pow(beatmap.combo, 0.8);

    let approachRateBonus: number = 1.0;

    // high ar bonus
    if (approachRate > 10.33) {
      approachRateBonus += 0.45 * (approachRate - 10.33);
    }

    // low ar bonus
    else if (approachRate < 8.0) {
      let lowArBonus: number = 0.01 * (8.0 - approachRate);

      if (modifiers & BeatmapModifier.Hidden) {
        lowArBonus *= 2.0;
      }

      approachRateBonus += lowArBonus;
    }

    // accuracy bonus (bad aim can lead to bad accuracy, reused in speed for same reason)
    const accuracyBonus: number = 0.5 + accuracy / 2.0;

    // od bonus (low od is easy to accuracy even with shit aim, reused in speed ...)
    const overallDifficultyBonus: number = 0.98 + Math.pow(overallDifficulty, 2) / 2500.0;

    const aimValue: number = calculateBaseStrain(aim)
      * lengthBonus
      * approachRateBonus
      * accuracyBonus
      * overallDifficultyBonus
      * missPenalty
      * comboBreakPenalty
      * (modifiers & BeatmapModifier.Hidden ? 1.18 : 1)
      * (modifiers & BeatmapModifier.Flashlight ? 1.45 * lengthBonus : 1);


    const speedValue: number = calculateBaseStrain(speed) * lengthBonus
      * missPenalty * comboBreakPenalty * accuracyBonus * overallDifficultyBonus;

    let realAccuracy: number = 0.0; // accuracy calculation changes from scorev1 to scorev2

    if (scoreVersion === 2) {
      circles = totalHits;
      realAccuracy = accuracy;
    } else {
      // scorev1 ignores sliders since they are free 300s
      if (circles) {
        realAccuracy = (
          (c300 - (totalHits - circles)) * 300.0 +
          c100 * 100.0 +
          c50 * 50.0
        ) / (circles * 300);
      }

      // can go negative if we miss everything
      realAccuracy = Math.max(0.0, realAccuracy);
    }

    // arbitrary values tom crafted out of trial and error
    const accuracyValue: number = Math.pow(1.52163, overallDifficulty)
      * Math.pow(realAccuracy, 24.0) * 2.83
      * Math.min(1.15, Math.pow(circles / 1000.0, 0.3))
      * (modifiers & BeatmapModifier.Hidden ? 1.02 : 1)
      * (modifiers & BeatmapModifier.Flashlight ? 1.02 : 1);

    const finalMultiplier: number = 1.12
      * (modifiers & BeatmapModifier.NoFail ? 0.90 : 1)
      * (modifiers & BeatmapModifier.SpunOut ? 0.95 : 1);

    return Math.pow(
      Math.pow(aimValue, 1.1) +
      Math.pow(speedValue, 1.1) +
      Math.pow(accuracyValue, 1.1),
      1.0 / 1.1
    ) * finalMultiplier;
  }
};

export {PPCalculator};
export {Beatmap};