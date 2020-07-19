"use strict";
var vec2_1 = require("./lib/vec2");
var beatmap_1 = require("./beatmap");
var DifficultyType;
(function (DifficultyType) {
    DifficultyType[DifficultyType["SPEED"] = 0] = "SPEED";
    DifficultyType[DifficultyType["AIM"] = 1] = "AIM";
})(DifficultyType || (DifficultyType = {}));
;
// how much strains decay per interval (if the previous interval's peak
// strains after applying decay are still higher than the current one's, 
// they will be used as the peak strains).
var DECAY_BASE = [0.3, 0.15];
// almost the normalized circle diameter (104px)
var DIAMETER_APPROX = 90;
// arbitrary tresholds to determine when a stream is spaced enough that is 
// becomes hard to alternate.
var STREAM_INTERVAL = 110;
var SINGLETAP_INTERVAL = 125;
// used to keep speed and aim balanced between eachother
var WEIGHT_SCALING = [1400, 26.25];
// non-normalized diameter where the circlesize buff starts
var CS_BUFF_TRESHOLD = 30;
// diffcalc hit object
var DiffCalcHitObject = (function () {
    function DiffCalcHitObject(hitObject, radius) {
        this.hitObject = hitObject;
        // strains start at 1
        this.strains = [1.0, 1.0];
        // this.hitObject = baseObject;
        // strains start at 1
        this.strains = [1, 1];
        // positions are normalized on circle radius so that we can calc as
        // if everything was the same circlesize
        var scalingFactor = 52.0 / radius;
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
        this.normStart = new vec2_1.default(this.hitObject.position);
        this.normStart.multiply(scalingFactor);
        // ignoring slider lengths doesn't seem to affect star rating too
        // much and speeds up the calculation exponentially
        // actually, I believe this is how diff calc works now and slider
        // lengths were dropped since osu!tp
        this.normEnd = this.normStart.clone();
    }
    DiffCalcHitObject.prototype.calculateStrains = function (prev) {
        this.calculateStrain(prev, DifficultyType.SPEED);
        this.calculateStrain(prev, DifficultyType.AIM);
    };
    DiffCalcHitObject.prototype.calculateStrain = function (prev, diffType) {
        var res = 0;
        var timeElapsed = this.hitObject.startTime - prev.hitObject.startTime;
        var decay = Math.pow(DECAY_BASE[diffType], timeElapsed / 1000.0);
        var scaling = WEIGHT_SCALING[diffType];
        if (this.hitObject.type === beatmap_1.HitObjectType.Circle ||
            this.hitObject.type === beatmap_1.HitObjectType.Slider)
            res = this.spacingWeight(this.normStart.distance(prev.normEnd), diffType) * scaling;
        res /= Math.max(timeElapsed, 50);
        this.strains[diffType] = prev.strains[diffType] * decay + res;
    };
    DiffCalcHitObject.prototype.spacingWeight = function (distance, diffType) {
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
    };
    return DiffCalcHitObject;
}());
;
var STAR_SCALING_FACTOR = 0.0675;
var EXTREME_SCALING_FACTOR = 0.5;
var PLAYFIELD_WIDTH = 512; // in osu!pixels
// strains are calculated by analyzing the map in chunks and then taking the
// peak strains in each chunk.
// this is the length of a strain interval in milliseconds.
var STRAIN_STEP = 400;
// max strains are weighted from highest to lowest, and this is how much the
// weight decays.
var DECAY_WEIGHT = 0.9;
var calculateDifficulty = function (objects, type) {
    var highestStrains = [];
    var intervalEnd = STRAIN_STEP;
    var maxStrain = 0.0;
    var prev;
    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        // make previous peak strain decay until the current object
        while (obj.hitObject.startTime > intervalEnd) {
            highestStrains.push(maxStrain);
            if (!prev) {
                maxStrain = 0.0;
            }
            else {
                var decay = Math.pow(DECAY_BASE[type], (intervalEnd - prev.hitObject.startTime) / 1000.0);
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
    highestStrains.sort(function (a, b) { return b - a; });
    return highestStrains.reduce(function (prev, curr, idx) { return prev + curr * Math.pow(DECAY_WEIGHT, idx); }, 0);
};
var DifficultyCalculator;
(function (DifficultyCalculator) {
    function calculate(beatmap) {
        if (beatmap.mode !== 0)
            throw new Error("This gamemode is not supported");
        var circleRadius = (PLAYFIELD_WIDTH / 16) * (1 - 0.7 *
            (beatmap.circleSize - 5) / 5);
        var objects = [];
        for (var i = 0; i < beatmap.hitObjects.length; i++) {
            objects[i] = new DiffCalcHitObject(beatmap.hitObjects[i], circleRadius);
        }
        var prev = objects[0];
        for (var i = 1; i < objects.length; i++) {
            var o = objects[i];
            o.calculateStrains(prev);
            prev = o;
        }
        var aim = calculateDifficulty(objects, DifficultyType.AIM);
        var speed = calculateDifficulty(objects, DifficultyType.SPEED);
        aim = Math.round(Math.sqrt(aim) * STAR_SCALING_FACTOR * 100) / 100;
        speed = Math.round(Math.sqrt(speed) * STAR_SCALING_FACTOR * 100) / 100;
        var stars = aim + speed +
            Math.abs(speed - aim) * EXTREME_SCALING_FACTOR;
        stars = Math.round(stars * 100) / 100;
        return {
            aim: aim, speed: speed, stars: stars
        };
    }
    DifficultyCalculator.calculate = calculate;
})(DifficultyCalculator || (DifficultyCalculator = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DifficultyCalculator;
