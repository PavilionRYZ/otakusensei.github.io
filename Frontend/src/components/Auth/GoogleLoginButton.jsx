import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const GoogleLoginButton = ({ onSuccess, onFailure }) => {
    return (
        <GoogleOAuthProvider clientId="your-client-id">
            <GoogleLogin
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={"single_host_origin"}
            />
        </GoogleOAuthProvider>
    );
};

export default GoogleLoginButton;
