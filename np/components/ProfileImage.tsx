import React from "react";

type ProfileImageProps = {
  avatarUrl?: string | null;
  name: string; // Full name (e.g., "John Doe")
  isOpen: boolean;
  onClick: () => void;
};

export const ProfileImage: React.FC<ProfileImageProps> = ({
  avatarUrl,
  name,
  isOpen,
  onClick,
}) => {
  const styles = {
    profileImage: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      cursor: "pointer",
      border: "2px solid #e5e5e5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f0f0f0",
      color: "#555",
      fontWeight: "bold",
      fontSize: "14px",
      textTransform: "uppercase",
      transition: "border-color 0.2s ease",
    } as React.CSSProperties,
    profileImageHover: {
      borderColor: "#007bff",
    },
  };

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(" ");
    const initials = names
      .map((n) => n.charAt(0))
      .slice(0, 2)
      .join(""); // Get up to 2 initials
    return initials.toUpperCase();
  };

  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt="Profile"
      style={{
        ...styles.profileImage,
        ...(isOpen && styles.profileImageHover),
      }}
      onClick={onClick}
    />
  ) : (
    <div
      style={{
        ...styles.profileImage,
        ...(isOpen && styles.profileImageHover),
      }}
      onClick={onClick}
    >
      {getInitials(name)}
    </div>
  );
};
