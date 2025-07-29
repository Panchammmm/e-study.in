"use client";

import { useAuth } from "@/hooks/useApiServices";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useState } from "react";
import { LoadingSpinner } from "./dashboard/components";

type AdminAuthGuardProps = {
  children: React.ReactNode;
};

type userType = {
  bio: string | null;
  createdAt: string;
  email: string;
  id: string;
  isEmailVerified: boolean;
  name: string;
  phoneNumber: string | null;
  profileImage: string | null;
  role: "ADMIN";
  updatedAt: string;
};

export default function AdminAuthGuard({
  children,
}: AdminAuthGuardProps): React.JSX.Element {
  const { getCurrentUser } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<userType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser() as userType | null;
      setUser(currentUser);
      setLoading(false);
      console.log("Current user in AdminAuthGuard:", currentUser);
        if (!currentUser || currentUser?.role !== "ADMIN") {
          router.push("/student/dashboard");
        }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <LoadingSpinner />; // or a loading spinner
  }

  return <>{children}</>;
}
