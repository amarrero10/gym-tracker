import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";

const UserProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Display name edit
  const [editingName, setEditingName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(user?.displayName ?? "");
  const [nameError, setNameError] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const initials = (user?.displayName || user?.username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const handleSaveName = async () => {
    setNameError("");
    if (!displayNameInput.trim()) {
      setNameError("Display name cannot be empty.");
      return;
    }
    try {
      setNameSaving(true);
      const res = await api.patch("/auth/me", { displayName: displayNameInput.trim() });
      updateUser({ displayName: res.data.user.displayName });
      setEditingName(false);
    } catch (err) {
      setNameError(err.response?.data?.message ?? "Failed to update name.");
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    try {
      setPasswordSaving(true);
      await api.patch("/auth/me/password", { currentPassword, newPassword });
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err.response?.data?.message ?? "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="px-3">
      <h1 className="text-[#F5F6F7] text-lg pt-10">Profile</h1>
      <p className="text-[#9AA0AA]">Manage your account</p>

      <hr className="h-px border-0 my-6 bg-[#2A2A33]" />

      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-14 w-14 rounded-full bg-[#7A1218] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-lg">{initials}</span>
        </div>
        <div>
          <p className="text-white font-medium">{user?.displayName || user?.username}</p>
          <p className="text-[#9AA0AA] text-sm">@{user?.username}</p>
          {memberSince && (
            <p className="text-[#9AA0AA] text-xs mt-0.5">Member since {memberSince}</p>
          )}
        </div>
      </div>

      {/* Display name */}
      <div className="bg-[#14141A] rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[#9AA0AA] text-xs">Display Name</p>
          {!editingName && (
            <button
              onClick={() => { setEditingName(true); setDisplayNameInput(user?.displayName ?? ""); setNameError(""); }}
              className="text-xs text-[#9AA0AA] hover:text-white cursor-pointer"
            >
              Edit
            </button>
          )}
        </div>

        {editingName ? (
          <div className="mt-2">
            <input
              type="text"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              maxLength={50}
              className="bg-[#1E1E28] text-white text-sm rounded-xl px-3 py-2 w-full outline-none mb-2"
            />
            {nameError && <p className="text-red-400 text-xs mb-2">{nameError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSaveName}
                disabled={nameSaving}
                className="bg-[#7A1218] text-white text-sm px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="text-[#9AA0AA] text-sm px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-white text-sm mt-1">{user?.displayName || "—"}</p>
        )}
      </div>

      {/* Username (read-only) */}
      <div className="bg-[#14141A] rounded-2xl p-4 mb-4">
        <p className="text-[#9AA0AA] text-xs mb-1">Username</p>
        <p className="text-white text-sm">@{user?.username}</p>
      </div>

      {/* Change password */}
      <div className="bg-[#14141A] rounded-2xl p-4 mb-4">
        <button
          onClick={() => { setShowPasswordForm((v) => !v); setPasswordError(""); setPasswordSuccess(""); }}
          className="w-full flex justify-between items-center cursor-pointer"
        >
          <p className="text-white text-sm">Change Password</p>
          <span className="text-[#9AA0AA] text-xs">{showPasswordForm ? "▲" : "▼"}</span>
        </button>

        {passwordSuccess && !showPasswordForm && (
          <p className="text-green-400 text-xs mt-2">{passwordSuccess}</p>
        )}

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-2">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-[#1E1E28] text-white text-sm rounded-xl px-3 py-2 w-full outline-none"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-[#1E1E28] text-white text-sm rounded-xl px-3 py-2 w-full outline-none"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-[#1E1E28] text-white text-sm rounded-xl px-3 py-2 w-full outline-none"
            />
            {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-400 text-xs">{passwordSuccess}</p>}
            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-[#7A1218] text-white text-sm px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 w-full mt-2"
            >
              {passwordSaving ? "Saving…" : "Update Password"}
            </button>
          </form>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full text-red-400 border border-red-400 rounded-2xl py-3 text-sm cursor-pointer mb-6"
      >
        Log Out
      </button>
    </div>
  );
};

export default UserProfile;
