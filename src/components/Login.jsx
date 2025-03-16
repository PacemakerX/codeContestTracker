import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // Import Redux dispatch
import { loginSuccess } from "../redux/authSlice"; // Import action to update Redux state

export default function LoginForm() {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

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

      navigate("/"); // Redirect to dashboard
    } catch (err) {
      setError(`An error occurred: ${err.message}. Please try again.`);
    }
  };

  return (
    <div className="flex items-center justify-center  bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Login
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="emailOrUsername"
            placeholder="Email Or Username"
            value={formData.emailOrUsername}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold p-3 rounded-md transition duration-300"
          >
            Login
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
