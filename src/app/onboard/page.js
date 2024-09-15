import { fetchProfileAction } from "@/actions";
import OnBoard from "@/components/on-board";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function OnBoardPage() {
  const user = await currentUser();

  const profileInfo = await fetchProfileAction(user?.id);

  if (profileInfo?._id) {
    if (profileInfo?.role === "recruiter" && !profileInfo.isPremiumUser)
      redirect("/membership");
    else redirect("/");
  } else return <OnBoard />;
}

export default OnBoardPage;
