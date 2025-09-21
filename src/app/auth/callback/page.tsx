"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/config/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!session) {
        console.error("No session or error:", error);
      } 
      router.push("/"); 
    };

    handleSession();
  }, [router]);

  return <p className="text-center mt-10">Spracováva sa prihlásenie...</p>;
}