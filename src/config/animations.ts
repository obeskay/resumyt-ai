export const LOADING_ANIMATION_CONFIG = {
  STEP_THRESHOLDS: {
    ANALYZING: 25,
    EXTRACTING: 50,
    GENERATING: 75,
    FINISHING: 100,
  },
  DURATION: {
    MIN_STEP: 2000, // Duración mínima de cada paso en ms
    MAX_STEP: 5000, // Duración máxima de cada paso en ms
    TRANSITION: 500, // Duración de las transiciones en ms
  },
  STATES: {
    IDLE: "idle",
    ANALYZING: "analyzing",
    EXTRACTING: "extracting",
    GENERATING: "generating",
    FINISHING: "finishing",
  },
};

export const RIVE_ANIMATION_CONFIG = {
  FPS: 60,
  ARTBOARD: "Loading",
  STATE_MACHINE: "State Machine",
  INPUTS: {
    PROGRESS: "progress",
    STATE: "state",
  },
};
