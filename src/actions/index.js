"use server";

import connectToDB from "@/database";
import Application from "@/models/application";
import Feed from "@/models/feed";
import Job from "@/models/job";
import Profile from "@/models/profile";
import Notification from "@/models/notification";
import { revalidatePath } from "next/cache";

export async function createProfileAction(formData, pathToRevalidate) {
  await connectToDB();
  await Profile.create(formData);
  revalidatePath(pathToRevalidate);
}

export async function fetchProfileAction(id) {
  await connectToDB();
  const result = await Profile.findOne({ userId: id });

  return JSON.parse(JSON.stringify(result));
}

export async function postNewJobAction(formData, pathToRevalidate) {
  await connectToDB();
  await Job.create(formData);
  revalidatePath(pathToRevalidate);
}

export async function fetchJobsForRecruiterAction(id) {
  await connectToDB();
  const result = await Job.find({ recruiterId: id });
  return JSON.parse(JSON.stringify(result));
}

export async function fetchJobsForCandidateAction(filterParams = {}) {
  await connectToDB();
  let updatedParams = {};
  Object.keys(filterParams).forEach((filterKey) => {
    updatedParams[filterKey] = { $in: filterParams[filterKey].split(",") };
  });

  const result = await Job.find(
    filterParams && Object.keys(filterParams).length > 0 ? updatedParams : {}
  );
  return JSON.parse(JSON.stringify(result));
}

export async function createJobApplicationAction(data, pathToRevalidate) {
  try {
    await connectToDB();

    // Create the job application
    const application = await Application.create({
      recruiterUserID: data.recruiterUserID,
      name: data.name,
      email: data.email,
      candidateUserID: data.candidateUserID,
      status: data.status,
      jobID: data.jobID,
      jobAppliedDate: data.jobAppliedDate,
    });

    // Create the notification
    await Notification.create({
      userId: data.recruiterUserID,
      message: `Candidate ${data.name} has applied for ${data.role}.`,
      date: new Date(),
      read: false,
    });

    
    revalidatePath(pathToRevalidate);

    return application; // Return the created application
  } catch (error) {
    console.error("Error creating job application and notification:", error);
    throw new Error("Failed to apply for the job or send notification.");
  }
}

export async function fetchJobApplicationsForCandidate(candidateID) {
  await connectToDB();
  const result = await Application.find({ candidateUserID: candidateID });

  return JSON.parse(JSON.stringify(result));
}

export async function fetchJobApplicationsForRecruiter(recruiterID) {
  await connectToDB();
  const result = await Application.find({ recruiterUserID: recruiterID });

  return JSON.parse(JSON.stringify(result));
}

export async function getCandidateDetailsByIDAction(currentCandidateID) {
  await connectToDB();
  const result = await Profile.findOne({ userId: currentCandidateID });

  return JSON.parse(JSON.stringify(result));
}

export async function updateJobApplicationAction(data, pathToRevalidate) {
  await connectToDB();
  const {
    recruiterUserID,
    name,
    email,
    candidateUserID,
    status,
    jobID,
    _id,
    jobAppliedDate,
  } = data;
  await Application.findOneAndUpdate(
    {
      _id: _id,
    },
    {
      recruiterUserID,
      name,
      email,
      candidateUserID,
      status,
      jobID,
      jobAppliedDate,
    },
    { new: true }
  );
  revalidatePath(pathToRevalidate);
}

export async function createFilterCategoryAction() {
  await connectToDB();
  const result = await Job.find({});

  return JSON.parse(JSON.stringify(result));
}

export async function updateProfileAction(data, pathToRevalidate) {
  await connectToDB();
  const {
    userId,
    role,
    email,
    isPremiumUser,
    memberShipType,
    memberShipStartDate,
    memberShipEndDate,
    recruiterInfo,
    candidateInfo,
    _id,
  } = data;

  await Profile.findOneAndUpdate(
    {
      _id: _id,
    },
    {
      userId,
      role,
      email,
      isPremiumUser,
      memberShipType,
      memberShipStartDate,
      memberShipEndDate,
      recruiterInfo,
      candidateInfo,
    },
    { new: true }
  );

  revalidatePath(pathToRevalidate);
}

//create post action
export async function createFeedPostAction(data, pathToRevalidate) {
  await connectToDB();
  await Feed.create(data);
  revalidatePath(pathToRevalidate);
}

//fetch all posts action
export async function fetchAllFeedPostsAction() {
  await connectToDB();
  const result = await Feed.find({});

  return JSON.parse(JSON.stringify(result));
}

//update post action
export async function updateFeedPostAction(data, pathToRevalidate) {
  await connectToDB();
  const { userId, userName, message, image, likes, _id } = data;
  await Feed.findOneAndUpdate(
    {
      _id: _id,
    },
    {
      userId,
      userName,
      image,
      message,
      likes,
    },
    { new: true }
  );

  revalidatePath(pathToRevalidate);
}


export async function fetchNotificationsForUser(userId) {
  await connectToDB();
  const notifications = await Notification.find({ userId }).sort({ date: -1 }); // Sort notifications by date, most recent first
  return JSON.parse(JSON.stringify(notifications));
}

export async function markNotificationsAsRead(userId) {
  try {
    await connectToDB();
    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
  } catch (error) {
    console.error("Error updating notifications:", error);
    throw new Error("Failed to update notifications");
  }
}