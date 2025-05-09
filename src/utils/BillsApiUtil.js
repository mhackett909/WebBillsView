export const fetchEntries = async () => {
    try {
        const response = await fetch(`/api/v1/entries`, { method: 'GET' });
        const responseData = await response.json();

        if (Array.isArray(responseData)) {
            return responseData.map((entry, index) => ({ id: index, ...entry }));
        } else {
            console.log("Fetch returned empty data.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching entries:", error);
        return [];
    }
};