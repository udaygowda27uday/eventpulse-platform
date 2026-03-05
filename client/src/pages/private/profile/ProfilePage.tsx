import { useState, useEffect } from "react";
import { message, Button, Input, Tabs } from "antd";
import { useUser } from "../../../hooks/useUser";
import { getCurrentUser, updateProfile } from "../../../apiservices/userService";
import { getUserBookings } from "../../../apiservices/bookingService";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit2,
  Save,
  X,
  Ticket,
  CheckCircle,
  XCircle,
} from "lucide-react";

// ── Validation (mirrors backend) ──────────────────────────────────────────────
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ─────────────────────────────────────────────────────────────────────────────

function ProfilePage() {
  const { currentUser, setCurrentUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    upcomingEvents: 0,
    cancelledBookings: 0,
  });

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
  });

  // Field-level error state
  const [errors, setErrors] = useState({ name: "", email: "" });

  useEffect(() => {
    if (currentUser) {
      setFormData({ name: currentUser.name, email: currentUser.email });
    }
    fetchUserBookings();
  }, [currentUser]);

  const fetchUserBookings = async () => {
    try {
      const response = await getUserBookings();
      const bookingsData = response.data || [];
      setBookings(bookingsData);

      const totalSpent = bookingsData.reduce((sum: number, booking: any) => {
        return booking.status === "confirmed" ? sum + booking.totalAmount : sum;
      }, 0);

      const now = new Date();
      const upcoming = bookingsData.filter((booking: any) => {
        if (booking.status !== "confirmed") return false;
        return new Date(booking.event?.date) > now;
      }).length;

      const cancelled = bookingsData.filter(
        (booking: any) => booking.status === "cancelled"
      ).length;

      setStats({
        totalBookings: bookingsData.length,
        totalSpent,
        upcomingEvents: upcoming,
        cancelledBookings: cancelled,
      });
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  // ── Validate form before submitting ────────────────────────────────────────
  const validateForm = (): boolean => {
    const newErrors = { name: "", email: "" };
    let valid = true;

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = "Name cannot be empty";
      valid = false;
    } else if (trimmedName.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      valid = false;
    } else if (trimmedName.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
      valid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      newErrors.name = "Name can only contain letters and spaces";
      valid = false;
    }

    // Email is read-only in the UI but validate anyway in case it's ever enabled
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Only send name — email is not editable from profile page
      await updateProfile({ name: formData.name.trim() });

      // Refresh user data in store
      const response = await getCurrentUser();
      setCurrentUser(response.data);

      setIsEditing(false);
      setErrors({ name: "", email: "" });
      message.success("Profile updated successfully");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    });
    setErrors({ name: "", email: "" });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const tabItems = [
    {
      key: "1",
      label: "Personal Information",
      children: (
        <div>
          {/* Profile Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "12px",
              padding: "40px",
              marginBottom: "24px",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "36px",
                    fontWeight: "bold",
                    border: "4px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  {getInitials(currentUser?.name || "U")}
                </div>
                <div>
                  <h2
                    style={{ fontSize: "28px", fontWeight: "700", margin: 0 }}
                  >
                    {currentUser?.name}
                  </h2>
                  <p
                    style={{
                      fontSize: "16px",
                      opacity: 0.9,
                      margin: "4px 0 0 0",
                    }}
                  >
                    {currentUser?.email}
                  </p>
                  <div
                    style={{
                      display: "inline-block",
                      marginTop: "12px",
                      padding: "6px 16px",
                      background: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "20px",
                      fontSize: "14px",
                    }}
                  >
                    {currentUser?.isAdmin ? "Admin Account" : "Customer Account"}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "16px",
                  marginTop: "24px",
                }}
              >
                {[
                  { label: "Total Bookings", value: stats.totalBookings },
                  { label: "Total Spent", value: `$${stats.totalSpent.toFixed(2)}` },
                  { label: "Upcoming Events", value: stats.upcomingEvents },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      padding: "16px",
                      borderRadius: "8px",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div style={{ fontSize: "14px", opacity: 0.9 }}>
                      {stat.label}
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        marginTop: "4px",
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "32px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                Account Details
              </h3>
              {!isEditing && (
                <Button
                  type="primary"
                  icon={<Edit2 size={16} />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Full Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  <User
                    size={16}
                    style={{ display: "inline", marginRight: "8px" }}
                  />
                  Full Name
                </label>
                {isEditing ? (
                  <>
                    <Input
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      placeholder="Enter your name"
                      size="large"
                      status={errors.name ? "error" : ""}
                      maxLength={50}
                    />
                    {errors.name && (
                      <p
                        style={{
                          color: "#ef4444",
                          fontSize: "13px",
                          marginTop: "4px",
                          marginBottom: 0,
                        }}
                      >
                        {errors.name}
                      </p>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      fontSize: "16px",
                    }}
                  >
                    {currentUser?.name}
                  </div>
                )}
              </div>

              {/* Email — always read-only */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  <Mail
                    size={16}
                    style={{ display: "inline", marginRight: "8px" }}
                  />
                  Email Address
                </label>
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    fontSize: "16px",
                    color: "#6b7280",
                  }}
                >
                  {currentUser?.email}
                  <span
                    style={{
                      fontSize: "12px",
                      marginLeft: "12px",
                      color: "#9ca3af",
                    }}
                  >
                    (Contact support to change your email)
                  </span>
                </div>
              </div>

              {/* Member Since */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  <Calendar
                    size={16}
                    style={{ display: "inline", marginRight: "8px" }}
                  />
                  Member Since
                </label>
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                >
                  {new Date(currentUser?.createdAt || "").toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <Button
                    type="primary"
                    icon={<Save size={16} />}
                    onClick={handleUpdate}
                    loading={loading}
                    size="large"
                  >
                    Save Changes
                  </Button>
                  <Button
                    icon={<X size={16} />}
                    onClick={handleCancel}
                    size="large"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Booking History",
      children: (
        <div>
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "600" }}
            >
              Recent Bookings ({bookings.length})
            </h3>

            {bookings.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#9ca3af",
                }}
              >
                <Ticket size={48} style={{ margin: "0 auto 16px" }} />
                <p>No bookings yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {bookings.map((booking: any) => (
                  <div
                    key={booking._id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "16px",
                          fontWeight: "600",
                        }}
                      >
                        {booking.event?.name || "Event"}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          gap: "20px",
                          fontSize: "14px",
                          color: "#6b7280",
                        }}
                      >
                        <span>
                          <Ticket
                            size={14}
                            style={{ display: "inline", marginRight: "4px" }}
                          />
                          {booking.ticketsCount} × {booking.ticketType}
                        </span>
                        <span>
                          <Calendar
                            size={14}
                            style={{ display: "inline", marginRight: "4px" }}
                          />
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#16a34a",
                          marginBottom: "8px",
                        }}
                      >
                        ${booking.totalAmount.toFixed(2)}
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          background:
                            booking.status === "confirmed"
                              ? "#dcfce7"
                              : "#fee2e2",
                          color:
                            booking.status === "confirmed"
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {booking.status === "confirmed" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {booking.status === "confirmed"
                          ? "Confirmed"
                          : "Cancelled"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Security",
      children: (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "32px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h3
            style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "600" }}
          >
            Security Settings
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Password Section */}
            <div
              style={{
                padding: "20px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h4
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    <Shield
                      size={16}
                      style={{ display: "inline", marginRight: "8px" }}
                    />
                    Password
                  </h4>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                    Last changed: Never
                  </p>
                </div>
                <Button type="default">Change Password</Button>
              </div>
            </div>

            {/* Account Status */}
            <div
              style={{
                padding: "20px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Account Status
              </h4>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "#dcfce7",
                  borderRadius: "8px",
                  color: "#16a34a",
                  fontWeight: "500",
                }}
              >
                <CheckCircle size={16} />
                Active
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "0 0 40px 0" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 8px 0" }}>
          My Profile
        </h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Manage your account settings and view your booking history
        </p>
      </div>

      <Tabs items={tabItems} size="large" />
    </div>
  );
}

export default ProfilePage;