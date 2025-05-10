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

export const exportEntries = async () => {
    try {
        const response = await fetch('/v1/entries/export', {
            method: 'GET',
            headers: {
                'Content-Type': 'text/csv',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to export data');
        }

        // Stream the response as a Blob
        const blob = await response.blob();

        // Create a temporary <a> element for downloading the file
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'exported_data.csv';

        // Append the link to the document, trigger the download, and remove the link
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error exporting data:', error);
    }
};