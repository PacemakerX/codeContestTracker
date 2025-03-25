// Import and configure environment variables
require("dotenv").config();

// API configuration constants
const API_URL = "https://clist.by/api/v4/contest/";
const API_KEY = process.env.CLIST_API_KEY; // API key stored in .env file

/**
 * Controller function to fetch programming contests from CLIST API
 * Retrieves contests from the past 7 days and upcoming 30 days
 * Currently filters for contests from: codeforces.com, leetcode.com, codechef.com
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns JSON response with contest data or error message
 */
const getContests = async (req, res) => {
  try {
    // Get current date for reference
    const currentDate = new Date();
    
    // Calculate date range boundaries
    const past7Days = new Date(currentDate);
    past7Days.setDate(currentDate.getDate() - 7); // Calculate date 7 days ago

    const upcoming30Days = new Date(currentDate);
    upcoming30Days.setDate(currentDate.getDate() + 30); // Calculate date 30 days ahead

    // Convert dates to ISO string format required by the API
    const startTimestamp = past7Days.toISOString();
    const endTimestamp = upcoming30Days.toISOString();

    // Construct API call with query parameters:
    // - start__gte: contests starting after this date
    // - end__lte: contests ending before this date
    // - resource__in: specific coding platforms to include
    // - orderby: sort results by start date
    const response = await fetch(
      `${API_URL}?start__gte=${startTimestamp}&end__lte=${endTimestamp}&resource__in=codeforces.com,leetcode.com,codechef.com&orderby=start`,
      {
        headers: {
          Authorization: `ApiKey ${API_KEY}`,
        },
      }
    );

    // Check if the API request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch contests: ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();
    
    // Sort contests by start date (although API already returns sorted data)
    const sortedContests = data.objects.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    // Send successful response with contest data
    res.status(200).json(data.objects);
  } catch (error) {
    // Handle any errors and send error response
    res.status(500).json({ message: error.message });
  }
};

// Export the controller function
module.exports = { getContests };
