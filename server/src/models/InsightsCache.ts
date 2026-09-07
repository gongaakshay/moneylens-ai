import mongoose, { Schema, Document } from "mongoose";

export interface IInsightsCache extends Document {
  userId: string;
  cacheKey: string;
  insightType: "overview" | "monthly";
  monthId?: string;
  insights: Record<string, any>;
  generatedAt: Date;
  dataSnapshot: string;
  expiresAt: Date;
}

const InsightsCacheSchema = new Schema<IInsightsCache>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    cacheKey: {
      type: String,
      required: true,
      index: true,
    },
    insightType: {
      type: String,
      enum: ["overview", "monthly"],
      required: true,
    },
    monthId: {
      type: String,
      required: false,
    },
    insights: {
      type: Schema.Types.Mixed,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    dataSnapshot: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for userId + cacheKey
InsightsCacheSchema.index({ userId: 1, cacheKey: 1 }, { unique: true });

// TTL index - automatically delete documents when expiresAt is reached
InsightsCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const InsightsCache = mongoose.model<IInsightsCache>(
  "InsightsCache",
  InsightsCacheSchema
);

export default InsightsCache;

