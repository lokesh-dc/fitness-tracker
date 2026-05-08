import { ObjectId } from "mongodb";

export interface UserProfile {
  _id?: ObjectId | string;
  userId: ObjectId | string;
  unit: 'kg' | 'lbs';
  currentWeight: number;     // always stored in kg
  height: number;            // always stored in cm
  targetWeight: number;      // always stored in kg
  targetTimeline: '1m' | '3m' | '1y';
  preferredTrainingDays: number[];  // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  onboardingComplete: boolean;
  bannerDismissed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
