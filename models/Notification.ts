import mongoose, { Schema, Document } from "mongoose";

export type NotificationType =
  | "reservation_created"
  | "reservation_accepted"
  | "reservation_rejected"
  | "reservation_completed";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  reservationId?: mongoose.Types.ObjectId;
  read: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "reservation_created",
        "reservation_accepted",
        "reservation_rejected",
        "reservation_completed",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
      required: false,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Helps quickly find unread notifications for a user.
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
