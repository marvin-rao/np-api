# Auth Context and API Integration README

## Overview

This project provides a React context and set of hooks to manage authentication in your React applications. It facilitates API requests with Bearer token authentication, session handling, and login redirection. The context also supports custom hooks for `GET`, `POST`, `PATCH`, and `DELETE` requests.

## Table of Contents

- [Auth Context and API Integration README](#auth-context-and-api-integration-readme)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [Install necessary packages:](#install-necessary-packages)
  - [Usage](#usage)
    - [1. `AuthProvider`](#1-authprovider)
      - [Example:](#example)
    - [2. `LoginButton`](#2-loginbutton)
      - [Example:](#example-1)
      - [a. `useAuthSession`](#a-useauthsession)
  - [3. API Hooks](#3-api-hooks)
    - [b. `useGet`](#b-useget)
    - [c. `usePost`](#c-usepost)
    - [d. `usePatch`](#d-usepatch)
    - [e. `useDelete`](#e-usedelete)
  - [Utility Functions](#utility-functions)
    - [1. `openLogin`](#1-openlogin)
    - [2. `getBToken`](#2-getbtoken)
    - [3. `isTokenExpired`](#3-istokenexpired)
  - [Error Handling](#error-handling)
  - [Examples](#examples)
    - [Using `useGet` to Fetch Data](#using-useget-to-fetch-data)
    - [Using `usePost` to Submit Data](#using-usepost-to-submit-data)
    - [Handling Login Session](#handling-login-session)
  - [License](#license)

## Installation

To integrate this into your React project, copy the provided code into your project and ensure the necessary dependencies are installed.

### Install necessary packages:

```bash
npm install newpaper-api
```

## Usage

### 1. `AuthProvider`

This provider manages authentication state and provides the `loginPageUrl` and `apiBaseUrl` to the components that consume this context.
Wrap your App Components with <AuthProvider>{children}</AuthProvider> like so :

#### Example:

```tsx
import { AuthProvider } from "newpaper-api";

<AuthProvider
  loginPageUrl="https://login.example.com"
  apiBaseUrl="https://api.example.com"
>
  <YourAppComponents />
</AuthProvider>;
```

### 2. `LoginButton`

The `LoginButton` component provides a pre-built button for redirecting users to the login page.

#### Example:

#### a. `useAuthSession`

This hook tells us if the user should log or not.

```tsx
import { LoginButton, useAuthSession } from "newpaper-api";

// Your Component
const { shouldLogin } = useAuthSession();

{
  shouldLogin && <LoginButton />;
}
{
  !shouldLogin && <AppContent />;
}
```

## 3. API Hooks

#### b. `useGet`

This hook makes a `GET` request with the Bearer token automatically included in the request header.

```tsx
const { data, loading, error, refetch } = useGet({
  path: "/data-endpoint",
  options: { queryString: "?param=value" },
});
```

#### c. `usePost`

The `usePost` hook is for sending `POST` requests. It returns a submit function to be called with the request body.

```tsx
const { loading, error, submit } = usePost({ path: "/submit-data" });

submit({ key: "value" }, (response) => {
  console.log("Success", response);
});
```

#### d. `usePatch`

Use this hook for making `PATCH` requests.

```tsx
const { loading, error, submit } = usePatch({ path: "/update-data" });

submit({ updateKey: "newValue" }, (response) => {
  console.log("Update Success", response);
});
```

#### e. `useDelete`

Use this hook for making `DELETE` requests.

```tsx
const { loading, error, submit } = useDelete({ path: "/delete-data" });

submit({}, (response) => {
  console.log("Deleted", response);
});
```

## Utility Functions

### 1. `openLogin`

This function opens a login popup to redirect users to the authentication page.

```tsx
openLogin({ loginPageUrl: "https://login.example.com" });
```

### 2. `getBToken`

Retrieves the Bearer token (`bearer_token`) from the URL query parameters.

```tsx
const token = getBToken();
```

### 3. `isTokenExpired`

Checks if a JWT token has expired.

```tsx
const expired = isTokenExpired(token);
if (expired) {
  // Redirect user to login
}
```

## Error Handling

Each hook (`useGet`, `usePost`, `usePatch`, and `useDelete`) returns an `error` state, which contains any errors encountered during the request. This should be handled in your UI, typically by showing an error message.

```tsx
if (error) {
  console.error(error.message);
}
```

## Examples

### Using `useGet` to Fetch Data

```tsx
const { data, loading, error, refetch } = useGet({ path: "/user/profile" });

if (loading) {
  return <p>Loading...</p>;
}

if (error) {
  return <p>Error: {error.message}</p>;
}

return <div>{data?.name}</div>;
```

### Using `usePost` to Submit Data

```tsx
const { submit, loading, error } = usePost({ path: "/user/register" });

const handleRegister = () => {
  submit({ username: "newUser" }, (data) => {
    console.log("Registration success:", data);
  });
};

return (
  <div>
    <button onClick={handleRegister} disabled={loading}>
      Register
    </button>
    {error && <p>Error: {error.message}</p>}
  </div>
);
```

### Handling Login Session

```tsx
const { shouldLogin } = useAuthSession();

if (shouldLogin) {
  openLogin({ loginPageUrl: "https://login.example.com" });
}
```

## License

This project is licensed under the MIT License.
