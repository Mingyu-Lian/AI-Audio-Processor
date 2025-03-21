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
};

export default function Header() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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
const handlePasswordChange = () => {
  if (newPassword !== confirmPassword) {
    setPasswordError("Passwords do not match.");
    return;
  }
  setPasswordError("");
  alert("Password change requested! (Backend not implemented yet)");
  setIsChangingPassword(false);
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
            <DialogContent 
              className="p-6 w-[300px] rounded-lg shadow-lg bg-white"
              aria-describedby="profile-dialog-description"
            >
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Profile</DialogTitle>
              </DialogHeader>

              {/* Hidden description for accessibility */}
              <p id="profile-dialog-description" className="sr-only">
                User profile details, including email, available credits, and time left.
              </p>

              <div className="mt-4 space-y-2">
                <p className="text-gray-600"><strong>Email:</strong> {user.email}</p>
                <p className="text-gray-600"><strong>Credits:</strong> {user.credits}</p>
                <p className="text-gray-600"><strong>Time Left:</strong> {formatCreditTime(user.credits)}</p>
              </div>

              {/* Add Credit & Change Password Buttons (Side by Side) */}
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

                    <p>Enter a new password for your account.</p>
                    <div className="flex flex-col gap-3 mt-3">
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
              <Button 
                className="bg-red-500 text-white w-full mt-3" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <LoginSignupModal />
      )}
    </nav>
  </header>
);
}