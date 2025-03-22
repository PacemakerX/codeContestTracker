require("dotenv").config();

const API_URL = "https://clist.by/api/v4/contest/";
const API_KEY = process.env.CLIST_API_KEY;

// Fetch contests from the past 7 days and the upcoming 30 days
const getContests = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Calculate past 7 days and upcoming 30 days timestamps
    const past7Days = new Date(currentDate);
    past7Days.setDate(currentDate.getDate() - 7);

    const upcoming30Days = new Date(currentDate);
    upcoming30Days.setDate(currentDate.getDate() + 30);

    const startTimestamp = past7Days.toISOString();
    const endTimestamp = upcoming30Days.toISOString();

    // API call to fetch contests
    const response = await fetch(
      `${API_URL}?start__gte=${startTimestamp}&end__lte=${endTimestamp}&resource__in=codeforces.com,leetcode.com,codechef.com&orderby=start`,
      {
        headers: {
          Authorization: `ApiKey ${API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch contests: ${response.statusText}`);
    }

    const data = await response.json();
    const sortedContests = data.objects.sort((a, b) => new Date(a.start) - new Date(b.start));
    res.status(200).json(data.objects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getContests };
