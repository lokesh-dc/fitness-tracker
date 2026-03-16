import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Header } from "@/components/Header";
import { EditProfileClient } from "./EditProfileClient";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection("users").findOne({
    _id: new ObjectId((session.user as any).id),
  });

  if (!user) redirect("/profile");

  return (
    <div className="flex flex-col">
      <Header title="Edit Profile" />

      <main className="flex-1 px-6 space-y-6 max-w-2xl mx-auto w-full pb-12 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        <EditProfileClient 
          initialName={user.name || session.user.name || ""}
          initialEmail={user.email || session.user.email || ""}
          initialGender={user.gender}
          initialWeight={user.weight}
        />
      </main>
    </div>
  );
}
