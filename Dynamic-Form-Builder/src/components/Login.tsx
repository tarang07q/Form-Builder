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

    // Name validation for both login and register
    if (!userData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (userData.name.length < 2) {
      newErrors.name = "Name should be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(userData.name)) {
      newErrors.name = "Name should contain only letters and spaces";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
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
        submit: "Login failed. Please check your credentials or register first.",
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
        Welcome to the Student Portal. Please enter your details to continue.
      </p>

      <div className="auth-tabs">
        <button
          className={`auth-tab ${!isRegistering ? 'active' : ''}`}
          onClick={() => setIsRegistering(false)}
        >
          Login
        </button>
        <button
          className={`auth-tab ${isRegistering ? 'active' : ''}`}
          onClick={() => setIsRegistering(true)}
        >
          Register
        </button>
      </div>

      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        <div className="form-group">
          <label htmlFor="rollNumber" className="form-label">
            Roll Number <span className="required">*</span>
          </label>
          <input
            type="text"
            id="rollNumber"
            name="rollNumber"
            value={userData.rollNumber}
            onChange={handleChange}
            className={`form-input ${errors.rollNumber ? "error" : ""}`}
            placeholder="Enter your roll number (without RA)"
          />
          {errors.rollNumber && (
            <div className="error-message">{errors.rollNumber}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Full Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className={`form-input ${errors.name ? "error" : ""}`}
            placeholder="Enter your full name"
          />
          {errors.name && (
            <div className="error-message">{errors.name}</div>
          )}
        </div>

        {errors.submit && (
          <div className="error-message" style={{ marginBottom: "1rem" }}>
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading
            ? isRegistering
              ? "Creating Account..."
              : "Logging in..."
            : isRegistering
              ? "Create Account"
              : "Login"}
        </button>

        <p className="switch-mode">
          {isRegistering ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="switch-button"
                onClick={() => setIsRegistering(false)}
              >
                Login here
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                className="switch-button"
                onClick={() => setIsRegistering(true)}
              >
                Register here
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default Login; 