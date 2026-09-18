import mongoose, { Schema, Document } from "mongoose";

export interface IPortfolioImage {
  url: string;
  publicId: string;
}

export interface IPhotographer extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  bio: string;
  location: string;
  specialties: string[];
  experience: number;
  startingPrice: number;
  portfolio: IPortfolioImage[];
  isAvailable: boolean;
}

const photographerSchema = new Schema<IPhotographer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    specialties: {
      type: [String],
      default: [],
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    portfolio: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          publicId: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Photographer =
  mongoose.models.Photographer ||
  mongoose.model<IPhotographer>("Photographer", photographerSchema);

export default Photographer;