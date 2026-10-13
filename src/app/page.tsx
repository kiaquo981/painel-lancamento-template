import { redirect } from "next/navigation";
import { SLUG } from "@/lib/config";

export default function Inicio() {
  redirect(`/launches/${SLUG}`);
}
