export const EXERCISE_LIST = {
  "Chest": ["Bench Press (Barbell)", "Incline Bench Press (Barbell)", "Dumbbell Flyes", "Push-ups", "Chest Press (Machine)"],
  "Back": ["Pull-ups", "Lat Pulldown", "Bent Over Row (Barbell)", "Seated Cable Row", "Deadlift", "Single Arm Dumbbell Row"],
  "Shoulders": ["Overhead Press (Barbell)", "Dumbbell Lateral Raise", "Front Raise", "Face Pulls", "Shoulder Press (Machine)"],
  "Legs": ["Squat (Barbell)", "Leg Press", "Leg Extension", "Leg Curl", "Lunges", "Calf Raise"],
  "Arms": ["Bicep Curl (Dumbbell)", "Hammer Curl", "Tricep Pushdown", "Skullcrushers", "Preacher Curl"],
  "Core": ["Plank", "Crunches", "Leg Raise", "Russian Twist"],
  "Cardio": ["Running", "Cycling", "Swimming", "Jump Rope"]
};

export type MuscleGroup = keyof typeof EXERCISE_LIST;
