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
  const [mode, setMode] = useState<'login' | 'register'>('login');

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

    // Name validation (for both login and registration)
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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // For login, we need both roll number and name
    if (!userData.rollNumber.trim() || !userData.name.trim()) {
      const newErrors: { [key: string]: string } = {};
      if (!userData.rollNumber.trim()) {
        newErrors.rollNumber = "Roll Number is required";
      }
      if (!userData.name.trim()) {
        newErrors.name = "Name is required";
      }
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Use both roll number and name for authentication
      console.log("Logging in with:", userData);
      const formData = await getForm(userData.rollNumber);
      console.log("Login successful with roll number:", userData.rollNumber, "and name:", userData.name);
      onLoginSuccess(formData);
    } catch (error) {
      console.error("Login error:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Login failed. Please check your roll number and name or register first.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("Registering user with data:", userData);
      const result = await createUser(userData);
      console.log("Registration result:", result);

      // After successful registration, get the form
      const formData = await getForm(userData.rollNumber);
      console.log("Form fetched after registration:", formData);
      onLoginSuccess(formData);
    } catch (error) {
      console.error("Registration error:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Registration failed. Please try again with a different roll number.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Student Portal</h2>
      <p className="login-description">
        Welcome to the Student Portal. Please {mode === 'login' ? 'login to' : 'register for'} your account.
      </p>
      <div className="login-mode-toggle">
        <button
          className={`mode-button ${mode === 'login' ? 'active' : ''}`}
          onClick={() => setMode('login')}
          disabled={isLoading}
        >
          Login
        </button>
        <button
          className={`mode-button ${mode === 'register' ? 'active' : ''}`}
          onClick={() => setMode('register')}
          disabled={isLoading}
        >
          Register
        </button>
      </div>
      <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
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
            required
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
            required
          />
          {errors.name && <div className="login-error">{errors.name}</div>}
        </div>

        {errors.submit && (
          <div className="login-error" style={{ marginBottom: "1.5rem" }}>
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="login-button login-button-primary"
        >
          {isLoading
            ? (mode === 'login' ? "Logging in..." : "Registering...")
            : (mode === 'login' ? "Login" : "Register")}
        </button>

        <div className="login-note">
          {mode === 'login'
            ? "Don't have an account? Switch to Register mode."
            : "Already have an account? Switch to Login mode."}
        </div>
      </form>
    </div>
  );
};

export default Login;
