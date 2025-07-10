// @ts-ignore
import React, { ReactNode } from "react";
import { useAuthData, AUTH_RETURN_PATH_KEY } from "./provider";

// Opening the Popup Window

export const openLogin = ({ loginPageUrl }: { loginPageUrl: string }) => {
  const width = 500; // Popup width
  const height = 700; // Popup height

  const left = window.screenX + (window.innerWidth - width) / 2;
  const top = window.screenY + (window.innerHeight - height) / 2;

  const redirectUrl = window.location.origin;

  const loginUrl = `${loginPageUrl}?redirectUrl=${encodeURIComponent(
    redirectUrl
  )}&tokenType=bearer_token`;

  window.open(
    loginUrl,
    "_blank",
    `width=${width},height=${height},left=${left},top=${top}`
  );
};

export type AuthButtonProps = {
  Component?: ({ onClick }: { onClick: () => void }) => ReactNode;
};

export const LoginButton = ({ Component }: AuthButtonProps) => {
  const { loginPageUrl } = useAuthData();

  const onClick = () => {
    if (!loginPageUrl) {
      alert("Dev:Provide loginPageUrl in Auth Context");
      return;
    }

    // Capture current path before login
    const currentPath = window.location.pathname + window.location.search;
    console.log("makeReturnUrl", currentPath);
    sessionStorage.setItem(AUTH_RETURN_PATH_KEY, currentPath);

    openLogin({ loginPageUrl });
  };

  return (
    <>
      {Component && <Component onClick={onClick} />}
      {!Component && (
        <div
          style={{
            display: "flex",
            flexDirection: "column", // Stack the text and button vertically
            justifyContent: "center", // Center vertically
            alignItems: "center", // Center horizontally
            height: "220px", // Take up the full viewport height
            textAlign: "center", // Center the text inside the container
          }}
        >
          <p style={{ fontSize: "18px", marginBottom: "20px", color: "#333" }}>
            Login to continue.
          </p>

          <button
            onClick={onClick}
            style={{
              backgroundColor: "#3B77CB", // Green background
              color: "white", // White text
              padding: "12px 20px", // Padding for the button
              fontSize: "16px", // Font size for button text
              border: "none", // Remove button borders
              borderRadius: "8px", // Rounded corners
              cursor: "pointer", // Pointer cursor on hover
              transition: "background-color 0.3s ease", // Smooth transition for hover effect
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Add shadow for depth
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "darkblue")
            } // Darker green on hover
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#3B77CB")
            } // Revert back to the original color
          >
            Login
          </button>
        </div>
      )}
    </>
  );
};
