"use client";

import { useEffect, useState } from "react";
import LoginSignupModal from "./LoginSignupModal";
import AddPointModal from "./AddPointModal";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define user type
type UserType = {
  email: string;
  credits: number;
  token?: string;
};

export default function Header() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  };

  // Convert credits to Hours & Minutes
  const formatCreditTime = (credits: number) => {
    const hours = Math.floor(credits / 60);
    const minutes = credits % 60;
  
    const hoursText = hours === 1 ? "1 Hour" : `${hours} Hours`;
    const minutesText = minutes === 1 ? "1 Min" : `${minutes} Mins`;
  
    if (hours > 0 && minutes > 0) {
      return `${hoursText} ${minutesText}`;
    } else if (hours > 0) {
      return hoursText;
    } else {
      return minutesText;
    }
  };

  // formatCreditTime(125) → "2 Hours 5 Mins"
  // formatCreditTime(61) → "1 Hour 1 Min"
  // formatCreditTime(60) → "1 Hour"
  // formatCreditTime(1) → "1 Min"
  // formatCreditTime(0) → "0 Mins"

  // Password Change Handlers
  const handlePasswordChange = async () => {
    setPasswordError("");

    if (!oldPassword) {
      setPasswordError("Old password is required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const token = user?.token;

      if (!token) {
        setPasswordError("User not authenticated. Please log in again.");
        return;
      }

      const response = await fetch("http://localhost:8000/api/users/change-password/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Include the JWT token
        },
        body: JSON.stringify({
          old_password: oldPassword,  // Sending old password
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.old_password) {
          setPasswordError("Old password is incorrect.");
        } else if (data.confirm_password) {
          setPasswordError("New passwords do not match.");
        } else {
          setPasswordError(data.detail || "Failed to change password.");
        }
        return;
      }

      // Show password changed success modal
      setIsPasswordChanged(true);
      setTimeout(() => {
        handleLogout(); // Redirect to login after 2 seconds
      }, 2000);
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordError("Something went wrong. Please try again.");
    }
  };



  return (
    <header className="w-full p-4 bg-gray-100 shadow-md flex items-center justify-between">
      <h1 className="text-xl md:text-2xl font-bold">SentriScribe</h1>
      <nav className="flex items-center space-x-4">
        {user ? (
          <>
            {/* Credit Time Display */}
            <span className="text-sm md:text-base font-semibold text-gray-700">
              ⏳ {formatCreditTime(user.credits)}
            </span>

            {/* Profile Dropdown */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <button className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm md:text-base">
                  My Profile
                </button>
              </DialogTrigger>
              <DialogContent className="p-6 w-[300px] rounded-lg shadow-lg bg-white">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Profile</DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-2">
                  <p className="text-gray-600"><strong>Email:</strong> {user.email}</p>
                  <p className="text-gray-600"><strong>Credits:</strong> {user.credits}</p>
                  <p className="text-gray-600"><strong>Time Left:</strong> {formatCreditTime(user.credits)}</p>
                </div>

                {/* Add Credit & Change Password Buttons */}
                <div className="mt-4 flex space-x-2">
                  <AddPointModal />
                  <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Change Password</Button>
                    </DialogTrigger>
                    <DialogContent className="p-6 w-[400px]">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                      </DialogHeader>

                      <p>Enter your old password and set a new password.</p>

                      <div className="flex flex-col gap-3 mt-3">
                        <Input
                          type="password"
                          placeholder="Old Password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <Input
                          type="password"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Input
                          type="password"
                          placeholder="Confirm New Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                      </div>

                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handlePasswordChange}>Submit</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Logout Button */}
                <Button className="bg-red-500 text-white w-full mt-3" onClick={handleLogout}>
                  Logout
                </Button>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <LoginSignupModal />
        )}
      </nav>

      {/* Success Modal for Password Change */}
      <Dialog open={isPasswordChanged} onOpenChange={setIsPasswordChanged}>
        <DialogContent className="p-6 w-[400px]">
          <DialogHeader>
            <DialogTitle>Password Changed Successfully</DialogTitle>
          </DialogHeader>
          <p>You will be redirected to the home page.</p>
        </DialogContent>
      </Dialog>
    </header>
  );
}