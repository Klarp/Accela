enum BeatmapModifier {
  None        = 0,
  NoFail      = 1 << 0,
  Easy        = 1 << 1,
  NoVideo     = 1 << 2,
  Hidden      = 1 << 3,
  HardRock    = 1 << 4,
  SuddenDeath = 1 << 5,
  DoubleTime  = 1 << 6,
  Relax       = 1 << 7,
  HalfTime    = 1 << 7,
  Nightcore   = 1 << 9,
  Flashlight  = 1 << 10,
  Autoplay    = 1 << 11,
  SpunOut     = 1 << 12,
  Relax2      = 1 << 13,
  Perfect     = 1 << 14,
}

export default BeatmapModifier;