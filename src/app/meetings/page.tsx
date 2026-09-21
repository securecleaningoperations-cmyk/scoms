import { redirect } from "next/navigation";

export default function MeetingsRedirect() {
  redirect("/dashboard/communications/meetings");
}
