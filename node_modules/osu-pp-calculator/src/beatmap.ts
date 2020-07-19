import Vec2 from './lib/vec2';
import BeatmapModifier from './mods';

const OD_0_MS: number = 79.5,
  OD_10_MS: number = 19.5,
  AR_0_MS: number = 1800,
  AR_5_MS: number = 1200,
  AR_10_MS: number = 450;

const OD_MS_STEP: number = 6,
  AR_MS_STEP1: number = 120, // ar0-5
  AR_MS_STEP2: number = 150; // ar5-10

export enum HitObjectType {
  Circle,
  Spinner,
  Slider,
};

export interface HitObject {
  position: Vec2;
  startTime: number;
  endTime: number;
  type: HitObjectType;
};

export default class Beatmap {
  mode: number;
  hpDrainRate: number;
  circleSize: number;
  overallDifficulty: number;
  approachRate: number;
  sv: number;
  combo: number;
  tickRate: number;
  hitObjects: HitObject[];
  circleCount: number;
  sliderCount: number;
  spinnerCount: number;

  applyMods(mods: number) {
    if (!mods)
      return;

    // od
    let overallDifficultyMultiplier: number = 1;

    if (mods & BeatmapModifier.HardRock) {
      overallDifficultyMultiplier *= 1.4;
    }

    if (mods & BeatmapModifier.Easy) {
      overallDifficultyMultiplier *= 0.5;
    }

    this.overallDifficulty *= overallDifficultyMultiplier;
    let overallDifficultyMillis = OD_0_MS - Math.ceil(OD_MS_STEP * this.overallDifficulty);

    // ar
    let approachRateMultiplier: number = 1;

    if (mods & BeatmapModifier.HardRock) {
      approachRateMultiplier = 1.4;
    }

    if (mods & BeatmapModifier.Easy) {
      approachRateMultiplier = 0.5;
    }

    this.approachRate *= approachRateMultiplier;

    // convert AR into its milliseconds value
    let approachRateMillis = this.approachRate <= 5
      ? (AR_0_MS - AR_MS_STEP1 * this.approachRate)
      : (AR_5_MS - AR_MS_STEP2 * (this.approachRate - 5));

    // cs
    let circleSizeMultiplier = 1;

    if (mods & BeatmapModifier.HardRock) {
      circleSizeMultiplier = 1.3;
    }

    if (mods & BeatmapModifier.Easy) {
      circleSizeMultiplier = 0.5;
    }

    // stats must be capped to 0-10 before HT/DT which bring them to a range
    // of -4.42 to 11.08 for OD and -5 to 11 for AR
    overallDifficultyMillis = Math.min(OD_0_MS, Math.max(OD_10_MS, overallDifficultyMillis));
    approachRateMillis = Math.min(AR_0_MS, Math.max(AR_10_MS, approachRateMillis));

    // playback speed
    let speed: number = 1;

    if (mods & BeatmapModifier.DoubleTime) {
      speed *= 1.5;
    }

    if (mods & BeatmapModifier.HalfTime) {
      speed *= 0.75;
    }

    const invSpeed = 1 / speed;

    // apply speed-changing mods
    overallDifficultyMillis *= invSpeed;
    approachRateMillis *= invSpeed;

    // convert OD and AR back into their stat form
    this.overallDifficulty = (OD_0_MS - overallDifficultyMillis) / OD_MS_STEP;
    this.approachRate = this.approachRate <= 5.0
      ? ((AR_0_MS - approachRateMillis) / AR_MS_STEP1)
      : (5.0 + (AR_5_MS - approachRateMillis) / AR_MS_STEP2);

    this.circleSize *= circleSizeMultiplier;
    this.circleSize = Math.max(0.0, Math.min(10.0, this.circleSize));

    if (!(mods & BeatmapModifier.DoubleTime || mods & BeatmapModifier.HalfTime)) {
      // not speed-modifying
      return;
    }

    // apply speed-changing mods
    this.hitObjects.forEach(obj => {
      obj.startTime *= invSpeed;
      obj.endTime *= invSpeed;
    });
  }

  static fromOsuParserObject (obj: any): Beatmap {
    let beatmap = new Beatmap;

    const types = {
      'slider': HitObjectType.Slider,
      'circle': HitObjectType.Circle,
      'spinner': HitObjectType.Spinner,
    };

    beatmap.hitObjects = obj.hitObjects.map((ho: any) => ({
      position: new Vec2(ho.position),
      startTime: ho.startTime,
      endTime: ho.endTime,
      type: types[ho.objectName],
    }));

    beatmap.mode = obj.Mode;

    beatmap.circleCount = obj.nbCircles
    beatmap.sliderCount = obj.nbSliders;
    beatmap.spinnerCount = obj.nbSpinners;

    beatmap.hpDrainRate = obj.HPDrainRate;
    beatmap.circleSize = obj.CircleSize;
    beatmap.overallDifficulty = obj.OverallDifficulty;
    beatmap.approachRate = obj.ApproachRate;

    beatmap.combo = obj.maxCombo;
    beatmap.tickRate = obj.SliderTickRate;

    return beatmap;
  }
};