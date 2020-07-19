import Vec2 from "./lib/vec2";
import Beatmap, {HitObject, HitObjectType} from "./beatmap";

enum DifficultyType {
  SPEED = 0,
  AIM = 1
};

// how much strains decay per interval (if the previous interval's peak
// strains after applying decay are still higher than the current one's, 
// they will be used as the peak strains).
const DECAY_BASE = [0.3, 0.15];

// almost the normalized circle diameter (104px)
const DIAMETER_APPROX = 90;

// arbitrary tresholds to determine when a stream is spaced enough that is 
// becomes hard to alternate.
const STREAM_INTERVAL = 110;
const SINGLETAP_INTERVAL = 125;

// used to keep speed and aim balanced between eachother
const WEIGHT_SCALING = [1400, 26.25];

// non-normalized diameter where the circlesize buff starts
const CS_BUFF_TRESHOLD = 30;

// diffcalc hit object
class DiffCalcHitObject {
  // strains start at 1
  public strains: number[] = [1.0, 1.0];

  // start/end positions normalized on radius
  public normStart: Vec2;
  public normEnd: Vec2;

  constructor(public hitObject: HitObject, radius: any) {
    // this.hitObject = baseObject;
    // strains start at 1
    this.strains = [1, 1];
    // positions are normalized on circle radius so that we can calc as
    // if everything was the same circlesize

    let scalingFactor = 52.0 / radius;
    // cs buff (based on osuElements, pretty accurate but not 100% sure)
    //
    // some high cs data I've collected:
    //
    // cs5.85 on RoR:
    // 1.822916667% aim stars increase
    // 2.752293578% speed stars increase
    // 4.799627961% pp increase
    //
    // cd6.5 on defenders
    // 18.143683959% pp increase
    // 4.62962963% aim stars increase
    // 9.039548023% speed stars increase
    if (radius < CS_BUFF_TRESHOLD) {
      scalingFactor *= 1 +
        Math.min(CS_BUFF_TRESHOLD - radius, 5) / 50;
    }

    this.normStart = new Vec2(this.hitObject.position);
    this.normStart.multiply(scalingFactor);

    // ignoring slider lengths doesn't seem to affect star rating too
    // much and speeds up the calculation exponentially
    // actually, I believe this is how diff calc works now and slider
    // lengths were dropped since osu!tp
    this.normEnd = this.normStart.clone();
  }

  calculateStrains (prev: DiffCalcHitObject) {
    this.calculateStrain(prev, DifficultyType.SPEED);
    this.calculateStrain(prev, DifficultyType.AIM);
  }

  calculateStrain (prev: DiffCalcHitObject,  diffType: DifficultyType) {
    let res: number = 0;
    let timeElapsed: number = this.hitObject.startTime - prev.hitObject.startTime;
    let decay: number = Math.pow(DECAY_BASE[diffType], timeElapsed / 1000.0);
    let scaling: number = WEIGHT_SCALING[diffType];

    if (this.hitObject.type === HitObjectType.Circle ||
      this.hitObject.type === HitObjectType.Slider)
      res = this.spacingWeight(this.normStart.distance(prev.normEnd), diffType) * scaling;

    res /= Math.max(timeElapsed, 50);
    this.strains[diffType] = prev.strains[diffType] * decay + res;
  }

  spacingWeight (distance,  diffType: DifficultyType) {
    if (diffType === DifficultyType.AIM)
      return Math.pow(distance, 0.99);

    if (distance > SINGLETAP_INTERVAL) {
      return 2.5;
    }
    if (distance > STREAM_INTERVAL) {
      return 1.6 + 0.9 *
        (distance - STREAM_INTERVAL) /
        (SINGLETAP_INTERVAL - STREAM_INTERVAL);
    }
    if (distance > DIAMETER_APPROX) {
      return 1.2 + 0.4 * (distance - DIAMETER_APPROX) /
        (STREAM_INTERVAL - DIAMETER_APPROX);
    }
    if (distance > DIAMETER_APPROX / 2.0) {
      return 0.95 + 0.25 *
        (distance - DIAMETER_APPROX / 2.0) /
        (DIAMETER_APPROX / 2.0);
    }
    return 0.95;
  }
};


const STAR_SCALING_FACTOR = 0.0675;
const EXTREME_SCALING_FACTOR = 0.5;
const PLAYFIELD_WIDTH = 512; // in osu!pixels

// strains are calculated by analyzing the map in chunks and then taking the
// peak strains in each chunk.
// this is the length of a strain interval in milliseconds.
const  STRAIN_STEP = 400;

// max strains are weighted from highest to lowest, and this is how much the
// weight decays.
const  DECAY_WEIGHT = 0.9;

const calculateDifficulty = (objects: DiffCalcHitObject[], type: DifficultyType): number => {
  let highestStrains: number[] = [];
  let intervalEnd: number = STRAIN_STEP;
  let maxStrain: number = 0.0;
  let prev: DiffCalcHitObject;

  for (let i = 0; i < objects.length; i++) {
    let obj: DiffCalcHitObject = objects[i];

    // make previous peak strain decay until the current object
    while (obj.hitObject.startTime > intervalEnd) {
      highestStrains.push(maxStrain);

      if (!prev) {
        maxStrain = 0.0;
      } else {
        let decay = Math.pow(DECAY_BASE[type],
          (intervalEnd - prev.hitObject.startTime) / 1000.0);
        maxStrain = prev.strains[type] * decay;
      }

      intervalEnd += STRAIN_STEP;
    }

    // calculate max strain for this interval
    maxStrain = Math.max(maxStrain, obj.strains[type]);
    prev = obj;
  }

  highestStrains.push(maxStrain);

  // sort strains from greatest to lowest
  highestStrains.sort((a, b) => b - a);

  return highestStrains.reduce((prev, curr, idx) => prev + curr * Math.pow(DECAY_WEIGHT, idx), 0);
};

export interface BeatmapDifficulty {
  aim: number;
  speed: number;
  stars: number;
}

namespace DifficultyCalculator {
  export function calculate(beatmap: Beatmap): BeatmapDifficulty {

    if (beatmap.mode !== 0)
      throw new Error("This gamemode is not supported");

    const circleRadius: number = (PLAYFIELD_WIDTH / 16) * (1 - 0.7 *
      (beatmap.circleSize - 5) / 5);

    let objects: DiffCalcHitObject[] = [];

    for (let i = 0; i < beatmap.hitObjects.length; i++) {
      objects[i] = new DiffCalcHitObject(beatmap.hitObjects[i], circleRadius);
    }

    let prev: DiffCalcHitObject = objects[0];
    for (let i = 1; i < objects.length; i++) {
      let o = objects[i];
      o.calculateStrains(prev);

      prev = o;
    }

    let aim: number = calculateDifficulty(objects, DifficultyType.AIM);
    let speed: number = calculateDifficulty(objects, DifficultyType.SPEED);

    aim = Math.round(Math.sqrt(aim) * STAR_SCALING_FACTOR * 100) / 100;
    speed = Math.round(Math.sqrt(speed) * STAR_SCALING_FACTOR * 100) / 100;

    let stars = aim + speed +
      Math.abs(speed - aim) * EXTREME_SCALING_FACTOR;

    stars = Math.round(stars * 100) / 100;

    return {
      aim, speed, stars
    };
  }
}

export default DifficultyCalculator;