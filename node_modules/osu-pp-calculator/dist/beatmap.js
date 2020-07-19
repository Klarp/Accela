"use strict";
var vec2_1 = require('./lib/vec2');
var mods_1 = require('./mods');
var OD_0_MS = 79.5, OD_10_MS = 19.5, AR_0_MS = 1800, AR_5_MS = 1200, AR_10_MS = 450;
var OD_MS_STEP = 6, AR_MS_STEP1 = 120, // ar0-5
AR_MS_STEP2 = 150; // ar5-10
(function (HitObjectType) {
    HitObjectType[HitObjectType["Circle"] = 0] = "Circle";
    HitObjectType[HitObjectType["Spinner"] = 1] = "Spinner";
    HitObjectType[HitObjectType["Slider"] = 2] = "Slider";
})(exports.HitObjectType || (exports.HitObjectType = {}));
var HitObjectType = exports.HitObjectType;
;
;
var Beatmap = (function () {
    function Beatmap() {
    }
    Beatmap.prototype.applyMods = function (mods) {
        if (!mods)
            return;
        // od
        var overallDifficultyMultiplier = 1;
        if (mods & mods_1.default.HardRock) {
            overallDifficultyMultiplier *= 1.4;
        }
        if (mods & mods_1.default.Easy) {
            overallDifficultyMultiplier *= 0.5;
        }
        this.overallDifficulty *= overallDifficultyMultiplier;
        var overallDifficultyMillis = OD_0_MS - Math.ceil(OD_MS_STEP * this.overallDifficulty);
        // ar
        var approachRateMultiplier = 1;
        if (mods & mods_1.default.HardRock) {
            approachRateMultiplier = 1.4;
        }
        if (mods & mods_1.default.Easy) {
            approachRateMultiplier = 0.5;
        }
        this.approachRate *= approachRateMultiplier;
        // convert AR into its milliseconds value
        var approachRateMillis = this.approachRate <= 5
            ? (AR_0_MS - AR_MS_STEP1 * this.approachRate)
            : (AR_5_MS - AR_MS_STEP2 * (this.approachRate - 5));
        // cs
        var circleSizeMultiplier = 1;
        if (mods & mods_1.default.HardRock) {
            circleSizeMultiplier = 1.3;
        }
        if (mods & mods_1.default.Easy) {
            circleSizeMultiplier = 0.5;
        }
        // stats must be capped to 0-10 before HT/DT which bring them to a range
        // of -4.42 to 11.08 for OD and -5 to 11 for AR
        overallDifficultyMillis = Math.min(OD_0_MS, Math.max(OD_10_MS, overallDifficultyMillis));
        approachRateMillis = Math.min(AR_0_MS, Math.max(AR_10_MS, approachRateMillis));
        // playback speed
        var speed = 1;
        if (mods & mods_1.default.DoubleTime) {
            speed *= 1.5;
        }
        if (mods & mods_1.default.HalfTime) {
            speed *= 0.75;
        }
        var invSpeed = 1 / speed;
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
        if (!(mods & mods_1.default.DoubleTime || mods & mods_1.default.HalfTime)) {
            // not speed-modifying
            return;
        }
        // apply speed-changing mods
        this.hitObjects.forEach(function (obj) {
            obj.startTime *= invSpeed;
            obj.endTime *= invSpeed;
        });
    };
    Beatmap.fromOsuParserObject = function (obj) {
        var beatmap = new Beatmap;
        var types = {
            'slider': HitObjectType.Slider,
            'circle': HitObjectType.Circle,
            'spinner': HitObjectType.Spinner,
        };
        beatmap.hitObjects = obj.hitObjects.map(function (ho) { return ({
            position: new vec2_1.default(ho.position),
            startTime: ho.startTime,
            endTime: ho.endTime,
            type: types[ho.objectName],
        }); });
        beatmap.mode = obj.Mode;
        beatmap.circleCount = obj.nbCircles;
        beatmap.sliderCount = obj.nbSliders;
        beatmap.spinnerCount = obj.nbSpinners;
        beatmap.hpDrainRate = obj.HPDrainRate;
        beatmap.circleSize = obj.CircleSize;
        beatmap.overallDifficulty = obj.OverallDifficulty;
        beatmap.approachRate = obj.ApproachRate;
        beatmap.combo = obj.maxCombo;
        beatmap.tickRate = obj.SliderTickRate;
        return beatmap;
    };
    return Beatmap;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Beatmap;
;
