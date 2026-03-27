import { ObjectId } from "mongodb";

export interface PushSubscriptionMetadata {
  _id?: ObjectId;
  userId: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  createdAt: Date;
}
