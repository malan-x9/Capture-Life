import mongoose, { Schema, Document } from "mongoose";

export interface IReservation extends Document {
  customerId: mongoose.Types.ObjectId;
  photographerId: mongoose.Types.ObjectId;
  eventDate: Date;
  eventType: string;
  eventLocation: string;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "completed";
}

const reservationSchema = new Schema<IReservation>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    photographerId: {
      type: Schema.Types.ObjectId,
      ref: "Photographer",
      required: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    eventType: {
      type: String,
      required: true,
      trim: true,
    },

    eventLocation: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Reservation =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>("Reservation", reservationSchema);

export default Reservation;