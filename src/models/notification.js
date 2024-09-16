import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  date: Date,
  read: Boolean,
});

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);

export default Notification;
