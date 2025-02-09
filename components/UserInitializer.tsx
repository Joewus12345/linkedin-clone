"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { IUserExtended } from "@/types/user";

const updateOrRegisterUser = async (user: IUserExtended) => {
  try {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      console.error("User registration/update failed");
    }
  } catch (error) {
    console.error("Error registering/updating user:", error);
  }
};

export default function UserInitializer() {
  const { user, isLoaded } = useUser();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (isLoaded && user && !hasProcessed) {
      const updatedUser: IUserExtended = {
        userId: user.id,
        userImage: user.imageUrl || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      };

      updateOrRegisterUser(updatedUser); // Check & register the user if they don't exist
      setHasProcessed(true);
    }
  }, [user, isLoaded, hasProcessed]);

  return null; // This component does not render anything
}
