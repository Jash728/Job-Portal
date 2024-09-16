"use client";

import { Fragment } from "react";
import { Button } from "../ui/button";
import {
  getCandidateDetailsByIDAction,
  updateJobApplicationAction,
} from "@/actions";
import { Dialog, DialogContent } from "../ui/dialog";
import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  "https://qfzdkbqerfyvelbaioei.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmemRrYnFlcmZ5dmVsYmFpb2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0NjY1MTgsImV4cCI6MjA0MTA0MjUxOH0.UENjsmDG6YUPxmWt1Qv7WHF01lOHujDBwhFtiMNMdQk"
);

function CandidateList({
  showApplicantsDrawer,
  jobApplications,
  currentCandidateDetails,
  setCurrentCandidateDetails,
  showCurrentCandidateDetailsModal,
  setShowCurrentCandidateDetailsModal,
}) {
  function handlePreviewResume() {
    const { data } = supabaseClient.storage
      .from("job-portal-public")
      .getPublicUrl(currentCandidateDetails?.candidateInfo?.resume);

    const a = document.createElement("a");
    a.href = data?.publicUrl;
    a.setAttribute("download", "Resume.pdf");
    a.setAttribute("target", "_blank");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleFetchCandidateDetails(currentCandidateId) {
    const data = await getCandidateDetailsByIDAction(currentCandidateId);
    if (data) {
      setCurrentCandidateDetails(data);
      setShowCurrentCandidateDetailsModal(true);
    }
  }

  async function handleUpdateJobStatus(currentStatus) {
    let cpyJobApplicants = [...jobApplications];
    let idxofCurrentJobApplicants = cpyJobApplicants.findIndex(
      (item) => item.candidateUserID == currentCandidateDetails?.userId
    );
    const jobApplicantsToUpdate = {
      ...cpyJobApplicants[idxofCurrentJobApplicants],
      status:
        cpyJobApplicants[idxofCurrentJobApplicants].status.concat(
          currentStatus
        ),
    };
    await updateJobApplicationAction(jobApplicantsToUpdate, "/jobs");
  }

  return (
    <Fragment>
      {" "}
      <div className="grid grid-cols-1 gap-3 p-10 md:grid-cols-2 lg:grid-cols-3">
        {jobApplications && jobApplications.length > 0
          ? jobApplications.map((jobApplicantItem) => (
              <div className="bg-white shadow-lg w-full max-w-sm rounded-lg overflow-hidden mx-auto mt-4">
                <div className="px-4 my-6 flex justify-between items-center">
                  <h3 className="text-lg font-bold dark:text-black">
                    {jobApplicantItem?.name}
                  </h3>
                  <Button
                    onClick={() =>
                      handleFetchCandidateDetails(
                        jobApplicantItem?.candidateUserID
                      )
                    }
                    className="dark:bg-[#fffa27]  flex h-11 items-center justify-center px-5"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))
          : null}
      </div>
      <Dialog
        open={showCurrentCandidateDetailsModal}
        onOpenChange={() => {
          setCurrentCandidateDetails(null);
          setShowCurrentCandidateDetailsModal(false);
        }}
      >
        <DialogContent className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl mx-auto">
          <div className="space-y-4">
            {/* Candidate Details */}
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {currentCandidateDetails?.candidateInfo?.name},{" "}
              <span className="text-lg font-medium text-gray-500 dark:text-gray-300">
                {currentCandidateDetails?.email}
              </span>
            </h1>
            <p className="text-xl font-medium text-gray-600 dark:text-gray-400">
              {currentCandidateDetails?.candidateInfo?.currentCompany}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentCandidateDetails?.candidateInfo?.currentJobLocation}
            </p>

            {/* Experience and Salary */}
            <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-gray-300">
              <p>
                <span className="font-semibold">Total Experience:</span>{" "}
                {currentCandidateDetails?.candidateInfo?.totalExperience} Years
              </p>
              <p>
                <span className="font-semibold">Salary:</span>{" "}
                {currentCandidateDetails?.candidateInfo?.currentSalary} LPA
              </p>
              <p>
                <span className="font-semibold">Notice Period:</span>{" "}
                {currentCandidateDetails?.candidateInfo?.noticePeriod} Days
              </p>
            </div>

            {/* Previous Companies */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Previous Companies
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentCandidateDetails?.candidateInfo?.previousCompanies
                  .split(",")
                  .map((company) => (
                    <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-4 py-2 text-sm font-medium">
                      {company}
                    </div>
                  ))}
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentCandidateDetails?.candidateInfo?.skills
                  .split(",")
                  .map((skill) => (
                    <div className="bg-indigo-500 text-white rounded-full px-4 py-1 text-sm font-medium">
                      {skill}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-4 mt-6">
            <Button
              onClick={handlePreviewResume}
              className="h-11 w-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors rounded-lg shadow-lg"
            >
              View Resume
            </Button>
            <Button
              onClick={() => handleUpdateJobStatus("selected")}
              className={`h-11 w-full ${
                jobApplications
                  .find(
                    (item) =>
                      item.candidateUserID === currentCandidateDetails?.userId
                  )
                  ?.status.includes("selected")
                  ? "bg-green-500"
                  : "bg-gray-500 hover:bg-green-600"
              } text-white font-semibold transition-colors rounded-lg shadow-lg`}
              disabled={
                jobApplications
                  .find(
                    (item) =>
                      item.candidateUserID === currentCandidateDetails?.userId
                  )
                  ?.status.includes("selected") ||
                jobApplications
                  .find(
                    (item) =>
                      item.candidateUserID === currentCandidateDetails?.userId
                  )
                  ?.status.includes("rejected")
                  ? true
                  : false
              }
            >
              {jobApplications
                .find(
                  (item) =>
                    item.candidateUserID === currentCandidateDetails?.userId
                )
                ?.status.includes("selected")
                ? "Selected"
                : "Select"}
            </Button>
            <Button
              onClick={() => handleUpdateJobStatus("rejected")}
              className={`h-11 w-full ${
                jobApplications
                  .find(
                    (item) =>
                      item.candidateUserID === currentCandidateDetails?.userId
                  )
                  ?.status.includes("rejected")
                  ? "bg-red-500"
                  : "bg-gray-500 hover:bg-red-600"
              } text-white font-semibold transition-colors rounded-lg shadow-lg`}
              disabled={
                jobApplications
                  .find(
                    (item) =>
                      item.candidateUserID === currentCandidateDetails?.userId
                  )
                  ?.status.includes("selected") ||
                jobApplications
                  .find(
                    (item) =>
                      item.candidateUserID === currentCandidateDetails?.userId
                  )
                  ?.status.includes("rejected")
                  ? true
                  : false
              }
            >
              {jobApplications
                .find(
                  (item) =>
                    item.candidateUserID === currentCandidateDetails?.userId
                )
                ?.status.includes("rejected")
                ? "Rejected"
                : "Reject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

export default CandidateList;
