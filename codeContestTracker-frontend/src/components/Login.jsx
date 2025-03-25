import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // Import Redux dispatch
import { loginSuccess } from "../redux/authslice"; // Import action to update Redux state
import { useNotification } from "../components/ToastNotification"; // Import notification hook
import { Eye, EyeOff } from "lucide-react";
export default function LoginForm() {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Redux dispatch function

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://localhost:3030/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error("Server returned an empty response.");
        }
        throw new Error(data?.message || "Login failed.");
      }

      const data = await response.json();
      dispatch(loginSuccess({ token: data.token, user: data.user })); // Update Redux state

      addNotification("Login successful!", "success"); // Show success notification
      navigate("/"); // Redirect to dashboard
    } catch (err) {
      addNotification(
        err.message || "Login failed. Please try again.",
        "error"
      );
      // setError(`An error occurred: ${err.message}. Please try again.`);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Login
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 aninmated-fadeIn"
          style={{ animation: "fadeIn 1s ease-out" }}
        >
          <input
            type="text"
            name="emailOrUsername"
            placeholder="Email Or Username"
            value={formData.emailOrUsername}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold p-3 rounded-md transition duration-300"
          >
            Login
          </button>
        </form>

        <p
          className="text-gray-400 text-sm text-center mt-4 aninmated-fadeIn"
          style={{ animation: "fadeIn 1s ease-out" }}
        >
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
      {/* Custom fade-in animation */}
      <style>
        {`
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(-20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
