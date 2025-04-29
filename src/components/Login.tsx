import React, { useState } from "react";
import { createUser, getForm } from "../services/api";
import { UserData } from "../types/form";

interface LoginProps {
  onLoginSuccess: (formData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [userData, setUserData] = useState<UserData>({
    rollNumber: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isRegistering, setIsRegistering] = useState(false);

  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {};

    // Roll Number validation
    if (!userData.rollNumber.trim()) {
      newErrors.rollNumber = "Roll Number is required";
    } else if (!/^\d+$/.test(userData.rollNumber)) {
      newErrors.rollNumber = "Roll Number should contain only numbers";
    } else if (userData.rollNumber.length < 3) {
      newErrors.rollNumber = "Roll Number should be at least 3 digits";
    }

    // Name validation (only for registration)
    if (isRegistering) {
      if (!userData.name.trim()) {
        newErrors.name = "Name is required";
      } else if (userData.name.length < 2) {
        newErrors.name = "Name should be at least 2 characters";
      } else if (!/^[a-zA-Z\s]+$/.test(userData.name)) {
        newErrors.name = "Name should contain only letters and spaces";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(false);

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      const formData = await getForm(userData.rollNumber);
      onLoginSuccess(formData);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit:
          "Login failed. Please check your roll number or register first.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      await createUser(userData);
      const formData = await getForm(userData.rollNumber);
      onLoginSuccess(formData);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: "Registration failed. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Student Portal</h2>
      <p className="login-description">
        Welcome to the Student Portal. Please enter your details to access your account.
      </p>
      <form>
        <div className="form-group">
          <label htmlFor="rollNumber" className="form-label">
            Roll Number <span style={{ color: "#e74c3c" }}>*</span>
          </label>
          <input
            type="text"
            id="rollNumber"
            name="rollNumber"
            value={userData.rollNumber}
            onChange={handleChange}
            className={`login-input ${errors.rollNumber ? "error" : ""}`}
            placeholder="Enter your roll number (without RA)"
          />
          {errors.rollNumber && (
            <div className="login-error">{errors.rollNumber}</div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name <span style={{ color: "#e74c3c" }}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className={`login-input ${errors.name ? "error" : ""}`}
            placeholder="Enter your full name"
          />
          {errors.name && <div className="login-error">{errors.name}</div>}
        </div>
        {errors.submit && (
          <div className="login-error" style={{ marginBottom: "1.5rem" }}>
            {errors.submit}
          </div>
        )}
        <button
          type="button"
          onClick={handleLogin}
          disabled={isLoading}
          className="login-button login-button-primary"
        >
          {isLoading && !isRegistering ? "Logging in..." : "Login"}
        </button>
        <div className="login-divider">
          <span>or</span>
        </div>
        <button
          type="button"
          onClick={handleRegister}
          disabled={isLoading}
          className="login-button login-button-secondary"
        >
          {isLoading && isRegistering ? "Registering..." : "Register New Account"}
        </button>
      </form>
    </div>
  );
};

export default Login;
