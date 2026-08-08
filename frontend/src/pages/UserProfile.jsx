import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import { ChevronUp, ChevronDown, ChevronRight, Dumbbell } from "lucide-react";

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
    <div className="px-4 pt-10 animate-fade-in-up">
      <h1 className="text-white text-2xl font-extrabold tracking-tight">Profile</h1>
      <p className="text-[#9BA1A6] mt-1">Manage your account</p>

      <div className="h-px bg-[#2C2C31] my-6" />

      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-full bg-[#D3131B] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(211,19,27,0.2)]">
          <span className="text-white font-extrabold text-lg">{initials}</span>
        </div>
        <div>
          <p className="text-white font-bold">{user?.displayName || user?.username}</p>
          <p className="text-[#9BA1A6] text-sm">@{user?.username}</p>
          {memberSince && (
            <p className="text-[#9BA1A6] text-xs mt-0.5">Member since {memberSince}</p>
          )}
        </div>
      </div>

      {/* Display name */}
      <div className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4 mb-4 hover:border-[#D3131B] transition-colors">
        <div className="flex items-center justify-between mb-1">
          <p className="font-mono text-[10px] text-[#9BA1A6] uppercase">Display Name</p>
          {!editingName && (
            <button
              onClick={() => { setEditingName(true); setDisplayNameInput(user?.displayName ?? ""); setNameError(""); }}
              className="font-mono text-[10px] uppercase text-[#9BA1A6] hover:text-[#D3131B] cursor-pointer transition active:scale-[0.98]"
            >
              Edit
            </button>
          )}
        </div>

        {editingName ? (
          <div className="mt-2 animate-fade-in-up">
            <input
              type="text"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              maxLength={50}
              className="bg-[#1C1C21] border border-[#2C2C31] text-white text-sm rounded px-3 py-2 w-full outline-none focus:border-[#D3131B] transition-all mb-2"
            />
            {nameError && <p className="text-red-400 text-xs mb-2">{nameError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSaveName}
                disabled={nameSaving}
                className="bg-[#D3131B] hover:bg-[#b01016] text-white text-sm font-bold px-4 py-2 rounded cursor-pointer transition active:scale-[0.98] disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="text-[#9BA1A6] text-sm px-4 py-2 cursor-pointer"
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
      <div className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4 mb-4">
        <p className="font-mono text-[10px] text-[#9BA1A6] uppercase mb-1">Username</p>
        <p className="text-white text-sm">@{user?.username}</p>
      </div>

      {/* Exercise library */}
      <button
        onClick={() => navigate("/exercises")}
        className="w-full bg-[#141417] border border-[#2C2C31] rounded-lg p-4 mb-4 flex items-center justify-between cursor-pointer hover:border-[#D3131B] transition active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <Dumbbell className="w-4 h-4 text-[#9BA1A6]" />
          <div className="text-left">
            <p className="text-white text-sm">Manage Exercises</p>
            <p className="text-[#9BA1A6] text-xs mt-0.5">Browse, edit, and create exercises</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#9BA1A6]" />
      </button>

      {/* Change password */}
      <div className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4 mb-4 hover:border-[#D3131B] transition-colors">
        <button
          onClick={() => { setShowPasswordForm((v) => !v); setPasswordError(""); setPasswordSuccess(""); }}
          className="w-full flex justify-between items-center cursor-pointer"
        >
          <p className="text-white text-sm">Change Password</p>
          <span className="text-[#9BA1A6]">
            {showPasswordForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {passwordSuccess && !showPasswordForm && (
          <p className="text-green-400 text-xs mt-2">{passwordSuccess}</p>
        )}

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-2 animate-fade-in-up">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-[#1C1C21] border border-[#2C2C31] text-white text-sm rounded px-3 py-2 w-full outline-none focus:border-[#D3131B] transition-all"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-[#1C1C21] border border-[#2C2C31] text-white text-sm rounded px-3 py-2 w-full outline-none focus:border-[#D3131B] transition-all"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-[#1C1C21] border border-[#2C2C31] text-white text-sm rounded px-3 py-2 w-full outline-none focus:border-[#D3131B] transition-all"
            />
            {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-400 text-xs">{passwordSuccess}</p>}
            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-[#D3131B] hover:bg-[#b01016] text-white text-sm font-bold px-4 py-2 rounded cursor-pointer transition active:scale-[0.98] disabled:opacity-50 w-full mt-2"
            >
              {passwordSaving ? "Saving…" : "Update Password"}
            </button>
          </form>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full text-[#D3131B] border border-[#D3131B]/60 hover:bg-[#D3131B] hover:text-white rounded-lg py-3 text-sm font-bold cursor-pointer transition-all mb-6"
      >
        Log Out
      </button>
    </div>
  );
};

export default UserProfile;
