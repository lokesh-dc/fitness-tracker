export const EXERCISE_LIST = {
  "Chest": ["Bench Press (Barbell)", "Incline Bench Press (Barbell)", "Dumbbell Flyes", "Push-ups", "Chest Press (Machine)"],
  "Back": ["Pull-ups", "Lat Pulldown", "Bent Over Row (Barbell)", "Seated Cable Row", "Deadlift", "Single Arm Dumbbell Row"],
  "Shoulders": ["Overhead Press (Barbell)", "Dumbbell Lateral Raise", "Front Raise", "Face Pulls", "Shoulder Press (Machine)"],
  "Legs": ["Squat (Barbell)", "Leg Press", "Leg Extension", "Leg Curl", "Lunges", "Calf Raise"],
  "Biceps": [
    "Bicep Curl (Dumbbell)",
    "Preacher Curl",
    "Barbell Curl",
    "Incline Dumbbell Curl",
    "Cable Curl",
    "EZ-Bar Curl",
    "Concentration Curl"
  ],
  "Triceps": [
    "Tricep Pushdown",
    "Skullcrushers",
    "Rope Triceps Pushdown",
    "Dumbbell Overhead Triceps Extension",
    "Lying Triceps Extension",
    "Close-Grip Bench Press",
    "Triceps Dip"
  ],
  "Forearms": [
    "Hammer Curl",
    "Wrist Curl",
    "Reverse Wrist Curl",
    "Farmer's Walk",
    "Barbell Reverse Curl",
    "Plate Pinch Hold"
  ],
  "Core": ["Plank", "Crunches", "Leg Raise", "Russian Twist"],
  "Cardio": ["Running", "Cycling", "Swimming", "Jump Rope"]
};

export type MuscleGroup = keyof typeof EXERCISE_LIST;
