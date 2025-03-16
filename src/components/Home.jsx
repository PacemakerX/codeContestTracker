export default function Home() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4">
          Track & Plan Your Coding Contests
        </h1>
        <p className="text-lg text-gray-300 mb-6 max-w-2xl">
          Stay ahead in competitive programming by tracking upcoming contests
          across multiple platforms.
        </p>
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition">
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2">Multi-Platform Support</h3>
          <p className="text-gray-400">
            Fetch contests from Codeforces, CodeChef, Leetcode, and more.
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2">Bookmark & Reminders</h3>
          <p className="text-gray-400">
            Save contests and get reminders before they start.
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2">Solution Links</h3>
          <p className="text-gray-400">
            Find YouTube solutions for past contests.
          </p>
        </div>
      </section>

      {/* Upcoming Contests Preview */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Upcoming Contests</h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <p className="text-gray-400">
            Contest data will be displayed here...
          </p>
        </div>
      </section>
    </div>
  );
}
