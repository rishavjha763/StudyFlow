import { useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

// The backend serves uploaded images from /uploads, but axios's baseURL ends in /api,
// so we strip /api off to build the correct image URL
const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api$/, "");

export default function ProfilePage() {
  const { user, updateUserInStorage } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploadingImage(true);
    try {
      const { data } = await api.post("/user/upload-profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUserInStorage(data.user);
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put("/user/me", { fullName });
      updateUserInStorage(data.user);
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.put("/user/change-password", { currentPassword, newPassword });
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update password");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <AppLayout section="Workspace" title="Profile">
      <div className="max-w-2xl space-y-6">
        <div className="card flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-600 flex items-center justify-center text-xl font-semibold overflow-hidden shrink-0">
            {user?.profileImage ? (
              <img
                src={`${API_ORIGIN}${user.profileImage}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              (user?.fullName || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">
              {user?.fullName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Joined{" "}
              {user?.createdDate
                ? new Date(user.createdDate).toLocaleDateString()
                : ""}
            </p>
            <label className="inline-block mt-2 text-xs font-medium text-primary-600 cursor-pointer">
              {uploadingImage ? "Uploading..." : "Change photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="card space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Update profile
          </h2>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">
              Full name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="btn-primary"
          >
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </form>

        <form onSubmit={handlePasswordChange} className="card space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Change password
          </h2>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">
              Current password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">
              New password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="btn-primary"
          >
            {savingPassword ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
