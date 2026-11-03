export interface UserSettings {
  defaultRestDuration: number; // in seconds (e.g. 60, 90, 120, 180)
  logWeightBeforeWorkout: boolean; // whether to prompt for body weight before workout starts
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultRestDuration: 90,
  logWeightBeforeWorkout: true,
};

