"use client";
import { Fragment, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import CommonCard from "../common-card";
import JobIcon from "../job-icon";
import { Button } from "../ui/button";
import { createJobApplicationAction } from "@/actions";

import { useToast } from "@/components/hooks/use-toast";

function CandidateJobCard({ jobItem, profileInfo, jobApplications }) {
  const [showJobDetailsDrawer, setShowJobDetailsDrawer] = useState(false);
  // console.log(profileInfo?.isPremiumUser)
  const { toast } = useToast();
  async function handlejobApply() {
    if (!profileInfo?.isPremiumUser && jobApplications.length >= 2) {
      setShowJobDetailsDrawer(false);
      toast({
        variant: "destructive",
        title: "You can apply max 2 jobs.",
        description: "Please opt for membership to apply for more jobs",
      });
      return;
    }
    await createJobApplicationAction(
      {
        recruiterUserID: jobItem?.recruiterId,
        name: profileInfo?.candidateInfo?.name,
        email: profileInfo?.email,
        candidateUserID: profileInfo?.userId,
        status: ["Applied"],
        jobID: jobItem?._id,
        jobAppliedDate: new Date().toLocaleDateString(),
      },
      "/jobs"
    );
    setShowJobDetailsDrawer(false);
  }
  return (
    <Fragment>
      <Drawer
        open={showJobDetailsDrawer}
        onOpenChange={setShowJobDetailsDrawer}
      >
        <CommonCard
          icon={<JobIcon />}
          title={jobItem?.title}
          description={jobItem?.companyName}
          footerContent={
            <Button
              onClick={() => setShowJobDetailsDrawer(true)}
              className=" dark:bg-[#fffa27] flex h-11 items-center justify-center px-5"
            >
              View Details
            </Button>
          }
        />
        <DrawerContent className="p-8 rounded-lg shadow-lg bg-white dark:bg-gray-900">
          <DrawerHeader className="px-0">
            <div className="flex justify-between items-center">
              <DrawerTitle className="text-4xl dark:text-white font-extrabold text-gray-800">
                {jobItem?.title}
              </DrawerTitle>
              <div className="flex gap-3">
                <Button
                  onClick={handlejobApply}
                  disabled={
                    jobApplications.findIndex(
                      (item) => item.jobID === jobItem?._id
                    ) > -1
                  }
                  className="disabled:opacity-50 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-300 ease-in-out"
                >
                  {jobApplications.findIndex(
                    (item) => item.jobID === jobItem?._id
                  ) > -1
                    ? "Applied"
                    : "Apply"}
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-300 ease-in-out"
                  onClick={() => setShowJobDetailsDrawer(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DrawerHeader>

          <DrawerDescription className="mt-6 text-lg dark:text-gray-300 text-gray-700">
            <p className="leading-relaxed mb-4">{jobItem?.description}</p>
            <span className="inline-block text-base dark:text-gray-400 font-normal text-gray-500">
              Location: {jobItem?.location}
            </span>
          </DrawerDescription>

          <div className="mt-6 flex justify-center">
            <div className="w-[180px] h-[45px] flex items-center justify-center dark:bg-gray-800 bg-gray-100 rounded-lg shadow">
              <h2 className="text-xl font-bold dark:text-white text-gray-800">
                {jobItem?.type} Time
              </h2>
            </div>
          </div>

          <h3 className="text-2xl font-semibold dark:text-white text-gray-800 mt-6">
            Experience: {jobItem?.experience} year(s)
          </h3>

          <div className="flex flex-wrap gap-3 mt-6">
            {jobItem?.skills.split(",").map((skillItem, index) => (
              <div
                key={index}
                className="w-[120px] flex items-center justify-center h-[40px] dark:bg-gray-800 bg-gray-200 rounded-lg shadow text-center"
              >
                <h2 className="text-sm font-semibold dark:text-white text-gray-800">
                  {skillItem}
                </h2>
              </div>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </Fragment>
  );
}

export default CandidateJobCard;
