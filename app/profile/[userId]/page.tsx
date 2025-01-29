import ProfileContent from "@/components/ProfileContent";
import { IUser } from "@/types/user";
import { toast } from "sonner";

async function ProfilePage({ params }: { params: Promise<{ userId: IUser["userId"] }> }) {

  const { userId } = await params;

  if (!userId) {
    toast.error("User ID is required 1");
  }

  return <ProfileContent userId={userId} />;
}

export default ProfilePage;