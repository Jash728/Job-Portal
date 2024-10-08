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

export async function fetchJobsFromJobId(id) {
  await connectToDB();
  const result = await Job.find({ _id: id });
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

    if (data instanceof Object && !(data instanceof Date) && !(data instanceof Array)) {
       const application = await Application.create({
        recruiterUserID: data.recruiterUserID,
        name: data.name,
        email: data.email,
        candidateUserID: data.candidateUserID,
        status: data.status,
        jobID: data.jobID,
        jobAppliedDate: data.jobAppliedDate,
      });

      await Notification.create({
        userId: data.recruiterUserID,
        message: `Candidate ${data.name} has applied for ${data.role}.`,
        date: new Date(),
        read: false,
      });

      revalidatePath(pathToRevalidate);

      return { success: true };
    } else {
      throw new Error('Invalid data format');
    }
  } catch (error) {
    console.error('Error creating job application:', error);
    return { success: false, error: error.message };
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
    company,
    title
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
  let notificationMessage = "";
  if (status.includes("selected")) {
    notificationMessage = `Congratulations! Your application for the position of ${title} at ${company} has been accepted!`;
  } else if (status.includes("rejected")) {
    notificationMessage = `We regret to inform you that your application for the position of ${title} at ${company} has been unsuccessful.
`;
  }

  await Notification.create({
    userId: candidateUserID,
    message: notificationMessage,
    date: new Date(),
    read: false, 
  });

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


export async function createFeedPostAction(data, pathToRevalidate) {
  await connectToDB();
  await Feed.create(data);
  revalidatePath(pathToRevalidate);
}


export async function fetchAllFeedPostsAction() {
  await connectToDB();
  const result = await Feed.find({});

  return JSON.parse(JSON.stringify(result));
}


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
  const notifications = await Notification.find({ userId }).sort({ date: -1 }); 
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