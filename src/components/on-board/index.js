"use client";

import {
  candidateOnboardFormControls,
  initialCandidateFormData,
  initialRecruiterFormData,
  recruiterOnboardFormControls,
} from "@/utils";
import { useEffect, useState } from "react";
import CommonForm from "../common-form";
import { useUser } from "@clerk/nextjs";
import { createProfileAction } from "@/actions";
import { createClient } from "@supabase/supabase-js";

const { Tabs, TabsList, TabsTrigger, TabsContent } = require("../ui/tabs");

const supabaseClient = createClient(
  "https://qfzdkbqerfyvelbaioei.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmemRrYnFlcmZ5dmVsYmFpb2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0NjY1MTgsImV4cCI6MjA0MTA0MjUxOH0.UENjsmDG6YUPxmWt1Qv7WHF01lOHujDBwhFtiMNMdQk"
);

function OnBoard() {
  const [currentTab, setCurrentTab] = useState("candidate");
  const [recruiterFormData, setRecruiterFormData] = useState(
    initialRecruiterFormData
  );

  const [file, setFile] = useState(null);

  const [candidateFormData, setCandidateFormData] = useState(
    initialCandidateFormData
  );
  function handleTabChange(value) {
    setCurrentTab(value);
  }

  const currentAuthUser = useUser();
  const { user } = currentAuthUser;

  function handleFileChange(e) {
    e.preventDefault();
    setFile(event.target.files[0]);
  }

  async function handleUploadPdfToSupabase() {
    const { data, error } = await supabaseClient.storage
      .from("job-portal-public")
      .upload(`/public/${file.name}`, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (data) {
      setCandidateFormData({
        ...candidateFormData,
        resume: data.path,
      });
    }
  }

  useEffect(() => {
    if (file) handleUploadPdfToSupabase();
  }, [file]);

  function handleRecuiterFormValid() {
    return (
      recruiterFormData &&
      recruiterFormData.name.trim() !== "" &&
      recruiterFormData.companyName.trim() !== "" &&
      recruiterFormData.companyRole.trim() !== ""
    );
  }

  function handleCandidateFormValid(){
    return Object.keys(candidateFormData).every(
      (key) => candidateFormData[key].trim() !== ""
    );
  }


  async function createProfile() {
    const data =
      currentTab === "candidate"
        ? {
            candidateInfo: candidateFormData,
            role: "candidate",
            isPremiumUser: false,
            userId: user?.id,
            email: user?.primaryEmailAddress?.emailAddress,
          }
        : {
            recruiterInfo: recruiterFormData,
            role: "recruiter",
            isPremiumUser: false,
            userId: user?.id,
            email: user?.primaryEmailAddress?.emailAddress,
          };

    await createProfileAction(data, "/onboard");
  }

  return (
    <div className="bg-white">
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <div className="w-full">
          <div className="flex items-baseline justify-between border-b pb-6 pt-24">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Welcome to onboarding
            </h1>
            <TabsList>
              <TabsTrigger value="candidate">Candidate</TabsTrigger>
              <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabsContent value="candidate">
          <CommonForm
            formData={candidateFormData}
            setFormData={setCandidateFormData}
            formControls={candidateOnboardFormControls}
            buttonText={"Onboard as candidate"}
            handleFileChange={handleFileChange}
            isBtnDisabled={!handleCandidateFormValid()}
            action={createProfile}
          />
        </TabsContent>
        <TabsContent value="recruiter">
          <CommonForm
            formControls={recruiterOnboardFormControls}
            buttonText={"Onboard as recruiter"}
            formData={recruiterFormData}
            setFormData={setRecruiterFormData}
            isBtnDisabled={!handleRecuiterFormValid()}
            action={createProfile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default OnBoard;
