import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux"; // Import useSelector
import CodeforcesLogo from "../assets/codeforces.svg";
import LeetcodeLogo from "../assets/leetcode.svg";
import CodechefLogo from "../assets/codechef.svg";

const API_URL = "http://localhost:3030/api/contests";

export default function ContestList() {
  const [contests, setContests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const hasFetchedData = useRef(false);

  const { token } = useSelector((state) => state.auth); // Get token from Redux state

  useEffect(() => {
    if (!hasFetchedData.current) {
      fetchContests();
      hasFetchedData.current = true;
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchContests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setContests(data);
    } catch {
      // Error handling without console.log
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCountdown = (startTime) => {
    const startDate = new Date(startTime);
    const diff = startDate - currentTime;

    if (diff <= 0) return "Starting now";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let countdown = "";
    if (days > 0) countdown += `${days}d `;
    if (hours > 0 || days > 0) countdown += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) countdown += `${minutes}m `;
    countdown += `${seconds}s`;

    return countdown;
  };

  const getPlatformLogo = (host) => {
    const platformLogos = {
      "codeforces.com": <img src={CodeforcesLogo} alt="Codeforces" className="w-6 h-6" />,
      "leetcode.com": <img src={LeetcodeLogo} alt="Leetcode" className="w-6 h-6" />,
      "codechef.com": <img src={CodechefLogo} alt="Codechef" className="w-6 h-6" />,
    };

    return platformLogos[host] || <span className="text-xl">🖥️</span>;
  };

  const now = new Date();
  const pastContests = contests.filter((contest) => new Date(contest.start) < now);
  const upcomingContests = contests.filter((contest) => new Date(contest.start) >= now);

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">Coding Contests</h2>

      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!isLoading && pastContests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-2">Past Contests</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-800 rounded-lg shadow">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Start Time</th>
                  <th className="p-3 text-left">Contest Name</th>
                  {token && <th className="p-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {pastContests.map((contest) => (
                  <tr key={contest.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-3 text-gray-300">
                      {new Date(contest.start) > now ? "Ongoing" : "Finished"}
                    </td>
                    <td className="p-3 text-gray-300">{formatDate(contest.start)}</td>
                    <td className="p-3 text-white font-medium">
                      <a href={contest.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                        <span className="text-xl" title={contest.host}>{getPlatformLogo(contest.host)}</span>
                        {contest.event}
                      </a>
                    </td>
                    {token && (
                      <td className="p-3 flex justify-center gap-4">
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">⏰ Add Reminder</button>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">⭐ Bookmark</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && upcomingContests.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Upcoming Contests</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-800 rounded-lg shadow">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="p-3 text-left w-40">Countdown</th>
                  <th className="p-3 text-left w-48">Start Time</th>
                  <th className="p-3 text-left">Contest Name</th>
                  {token && <th className="p-3 text-center w-64">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {upcomingContests.map((contest) => (
                  <tr key={contest.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-3 text-green-400 font-mono w-40">
                      <div className="w-32">{getCountdown(contest.start)}</div>
                    </td>
                    <td className="p-3 text-gray-300 w-48">{formatDate(contest.start)}</td>
                    <td className="p-3 text-white font-medium">
                      <a href={contest.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                        <span className="text-xl" title={contest.host}>{getPlatformLogo(contest.host)}</span>
                        {contest.event}
                      </a>
                    </td>
                    {token && (
                      <td className="p-3 flex justify-center gap-4 w-64">
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">⏰ Set Reminder</button>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">⭐ Bookmark</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
