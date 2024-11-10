import React, { useState, useRef, useEffect, ReactNode } from "react";

interface NavbarProps {
  children?: ReactNode;
  userImage?: string;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

type Styles = {
  [key: string]: React.CSSProperties;
};

export const NavbarWithProfile: React.FC<NavbarProps> = ({
  children,
  userImage = "https://via.placeholder.com/40",
  userName = "John Doe",
  userEmail = "john@example.com",
  onLogout = () => console.log("Logout clicked"),
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const styles: Styles = {
    navbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "4px 1rem",
      backgroundColor: "#ffffff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      position: "relative",
      height: "50px",
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    },
    profileSection: {
      position: "relative",
      marginLeft: "auto",
    },
    profileImage: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      cursor: "pointer",
      border: "2px solid #e5e5e5",
      transition: "border-color 0.2s ease",
    },
    profileImageHover: {
      borderColor: "#007bff",
    },
    popover: {
      position: "absolute",
      top: "100%",
      right: "0",
      marginTop: "0.5rem",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)",
      width: "250px",
      zIndex: 1000,
      opacity: 0,
      transform: "translateY(-10px)",
      visibility: "hidden",
      transition: "all 0.2s ease",
    },
    popoverVisible: {
      opacity: 1,
      transform: "translateY(0)",
      visibility: "visible",
    },
    userInfo: {
      padding: "1rem",
      borderBottom: "1px solid #e5e5e5",
    },
    userName: {
      margin: "0",
      fontSize: "1rem",
      fontWeight: "600",
      color: "#333",
    },
    userEmail: {
      margin: "0.25rem 0 0 0",
      fontSize: "0.875rem",
      color: "#666",
    },
    logoutButton: {
      display: "block",
      width: "100%",
      padding: "0.75rem 1rem",
      border: "none",
      backgroundColor: "transparent",
      color: "#dc3545",
      fontSize: "0.875rem",
      textAlign: "left",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
    logoutButtonHover: {
      backgroundColor: "#f8f9fa",
    },
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.leftSection}>{children}</div>

      <div style={styles.profileSection} ref={popoverRef}>
        <img
          src={userImage}
          alt="Profile"
          style={{
            ...styles.profileImage,
            ...(isOpen && styles.profileImageHover),
          }}
          onClick={() => setIsOpen(!isOpen)}
        />

        <div
          style={{
            ...styles.popover,
            ...(isOpen && styles.popoverVisible),
          }}
        >
          <div style={styles.userInfo}>
            <h4 style={styles.userName}>{userName}</h4>
            <p style={styles.userEmail}>{userEmail}</p>
          </div>

          <button
            style={styles.logoutButton}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              // @ts-ignore
              e.currentTarget.style.backgroundColor =
                styles.logoutButtonHover.backgroundColor;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
