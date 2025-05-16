export const fetchEntries = async (token) => {
    try {
        const response = await fetch(`/api/v1/entries`, {
            method: 'GET',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });
        const responseData = await response.json();
        return Array.isArray(responseData) ? responseData : [];
    } catch (error) {
        console.error("Error fetching entries:", error);
        return [];
    }
};

export const exportEntries = async (token) => {
    try {
        const response = await fetch('/api/v1/entries/export', {
            method: 'GET',
            headers: {
                'Content-Type': 'text/csv',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),

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

export const createUser = async (userData) => {
    try {
        const response = await fetch('/api/v1/auth/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error creating user:', error);
        return null;
    }
};

export const login = async (userData) => {
    try {
        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error logging in:', error);
        return null;
    }
};

export const getUser = async (userName, token) => {
    try {
        const response = await fetch(`/api/v1/user?userName=${encodeURIComponent(userName)}`, {
            method: 'GET',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
};

export const getPayments = async (token) => {
    try {
        const response = await fetch('/api/v1/payments', {
            method: 'GET',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });
        const responseData = await response.json();
        return Array.isArray(responseData) ? responseData : [];
    } catch (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
};

export const postPayment = async (paymentData, token) => {
    try {
        const response = await fetch('/api/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(paymentData),
        });
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error posting payment:', error);
        return null;
    }
};

export const updatePayment = async (paymentData, token) => {
    try {
        const response = await fetch('/api/v1/payments', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(paymentData),
        });
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error updating payment:', error);
        return null;
    }
};

export const createEntry = async (entryData, token) => {
    try {
        const response = await fetch('/api/v1/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(entryData),
        });
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error creating entry:', error);
        return null;
    }
};

export const getBills = async (token) => {
    try {
        const response = await fetch('/api/v1/bills', {
            method: 'GET',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });
        const responseData = await response.json();
        return Array.isArray(responseData) ? responseData : [];
    } catch (error) {
        console.error('Error fetching bills:', error);
        return [];
    }
};

export const getBillByName = async (name, token) => {
    try {
        const response = await fetch(`/api/v1/bills/?name=${encodeURIComponent(name)}`, {
            method: 'GET',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error fetching bill by name:', error);
        return null;
    }
};

export const createBill = async (billData, token) => {
    try {
        const response = await fetch('/api/v1/bills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(billData),
        });
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error creating bill:', error);
        return null;
    }
};

export const deleteBill = async (billData, token) => {
    try {
        const response = await fetch('/api/v1/bills', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(billData),
        });
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error deleting bill:', error);
        return null;
    }
};