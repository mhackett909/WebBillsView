import { mapErrorMessageToResponse } from './Mappers';

// Helper for authenticated fetch with refresh logic
async function fetchWithAutoRefresh({
    url,
    options = {},
    token,
    refreshToken,
    onTokenRefresh
}) {
    let accessToken = token;
    let triedRefresh = false;
    while (true) {
        const mergedOptions = {
            ...options,
            headers: {
                ...(options.headers || {}),
                ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
            },
        };
        const response = await fetch(url, mergedOptions);
        if (response.status === 401 && refreshToken && !triedRefresh) {
            triedRefresh = true;
            console.log("Refreshing token...");
            const refreshResponse = await fetch(`/api/v1/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData.accessToken) {
                    accessToken = refreshData.accessToken;
                    refreshToken = refreshData.refreshToken;
                    sessionStorage.setItem('jwt', accessToken);
                    sessionStorage.setItem('refreshToken', refreshToken);
                    onTokenRefresh(accessToken, refreshToken);
                    continue;
                }
            }
        }
        // If we reach here, request failed
        return response;
    }
}

export const fetchEntries = async (token, refreshToken, onTokenRefresh, filters) => {
    try {
        let url = '/api/v1/entries';
        if (filters && typeof filters === 'object' && Object.keys(filters).length > 0) {
            // Convert filters object to query string
            const params = new URLSearchParams();
            for (const key in filters) {
                if (filters[key] !== undefined && filters[key] !== null) {
                    if (Array.isArray(filters[key])) {
                        filters[key].forEach(val => params.append(key, val));
                    } else {
                        params.append(key, filters[key]);
                    }
                }
            }
            url += `?${params.toString()}`;
        }
        const response = await fetchWithAutoRefresh({
            url,
            options: { method: 'GET' },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            // Expect responseData to be { entries: [...], total: n }
            if (responseData && Array.isArray(responseData.entries) && typeof responseData.total === 'number') {
                return responseData;
            }
            // Fallback: if responseData is an array (legacy), wrap it
            if (Array.isArray(responseData)) {
                return { entries: responseData, total: responseData.length };
            }
            // Defensive fallback
            return { entries: [], total: 0 };
        }
        console.error("Failed to fetch invoices:", response.status, response.statusText);
        return [];
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return [];
    }
};

export const fetchEntryById = async (id, token, refreshToken, onTokenRefresh, filter) => {
    try {
        let url = `/api/v1/entries/${encodeURIComponent(id)}`;
        if (filter) {
            url += `?filter=${encodeURIComponent(filter)}`;
        }
        const response = await fetchWithAutoRefresh({
            url,
            options: { method: 'GET' },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData; // Return the single entry object directly
        }
        console.error('Failed to fetch invoice by id:', response.status, response.statusText);
        return null;
    } catch (error) {
        console.error('Error fetching invoice by id:', error);
        return null;
    }
};

// TODO: Finish
export const exportEntries = async (token, refreshToken, onTokenRefresh) => {
    try {
        const response = await fetchWithAutoRefresh({
            url: '/api/v1/entries/export',
            options: {
                method: 'GET',
                headers: { 'Content-Type': 'text/csv' },
            },
            token,
            refreshToken,
            onTokenRefresh
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

        const contentType = response.headers.get('content-type') || '';

        if (!response.ok) {
            if (contentType.includes('application/json')) {
                const errorData = await response.json();
                return { error: mapErrorMessageToResponse(errorData) };
            } else {
                // Try to get text error message, else fallback
                const text = await response.text();
                return { error: mapErrorMessageToResponse(text) };
            }
        }

        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return { error: 'Login failed due to an unexpected server response. Please try again later.' };
    } catch (error) {
        console.error('Error logging in:', error);
        return { error: 'Login failed due to an unexpected error. Please try again later.' };
    }
};

export const getUser = async (userName, token, refreshToken, onTokenRefresh) => {
    try {
        const response = await fetchWithAutoRefresh({
            url: `/api/v1/user?userName=${encodeURIComponent(userName)}`,
            options: { method: 'GET' },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        }
        console.error("Failed to fetch user:", response.status, response.statusText);
        return null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
};

export const updateUser = async (userData, token, refreshToken, onTokenRefresh) => {
    try {
        const response = await fetchWithAutoRefresh({
            url: '/api/v1/user',
            options: {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        }
        console.error('Failed to update user:', response.status, response.statusText);
        throw new Error(`Failed to update user: ${response.status} ${response.statusText}`);    
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const getPayments = async (entryId, token, refreshToken, onTokenRefresh) => {
    try {
        const response = await fetchWithAutoRefresh({
            url: `/api/v1/payments?entryId=${encodeURIComponent(entryId)}`,
            options: { method: 'GET' },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            // If responseData has a paymentDTOList property, return that, else return []
            if (responseData && Array.isArray(responseData.paymentDTOList)) {
                return responseData.paymentDTOList;
            }
            return [];
        }
        console.error("Failed to fetch payments:", response.status, response.statusText);
        return [];
    } catch (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
};

export const postPayment = async (paymentData, token, refreshToken, onTokenRefresh) => {
    try {
        const response = await fetchWithAutoRefresh({
            url: '/api/v1/payments',
            options: {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData),
            },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        }
        console.error('Failed to post payment:', response.status, response.statusText);
        return null;
    } catch (error) {
        console.error('Error posting payment:', error);
        return null;
    }
};

export const updatePayment = async (paymentData, token, refreshToken, onTokenRefresh, filter) => {
    try {
        let url = '/api/v1/payments';
        if (filter) {
            url += `?filter=${encodeURIComponent(filter)}`;
        }
        const response = await fetchWithAutoRefresh({
            url,
            options: {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData),
            },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        }
        console.error('Failed to update payment:', response.status, response.statusText);
        return null;
    } catch (error) {
        console.error('Error updating payment:', error);
        return null;
    }
};

export const createEntry = async (entryData, token, refreshToken, onTokenRefresh) => {
    try {
        const response = await fetchWithAutoRefresh({
            url: '/api/v1/entries/new',
            options: {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entryData),
            },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        }
        console.error('Failed to create invoice:', response.status, response.statusText);
        return null;
    } catch (error) {
        console.error('Error creating invoice:', error);
        return null;
    }
};

export const editEntry = async (entryData, token, refreshToken, onTokenRefresh, filter) => {
    try {
        let url = '/api/v1/entries/edit';
        if (filter) {
            url += `?filter=${encodeURIComponent(filter)}`;
        }
        const response = await fetchWithAutoRefresh({
            url,
            options: {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entryData),
            },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        }
        console.error('Failed to edit invoice:', response.status, response.statusText);
        return null;
    } catch (error) {
        console.error('Error editing invoice:', error);
        return null;
    }
};

export const getBills = async (token, refreshToken, onTokenRefresh, status) => {
    try {
        let url = '/api/v1/bills';
        const params = new URLSearchParams();
        if (status) {
            params.append('status', status);
        }
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        const response = await fetchWithAutoRefresh({
            url,
            options: { method: 'GET' },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            // If responseData has a billDTOList property, return that, else return []
            if (responseData && Array.isArray(responseData.billDTOList)) {
                return responseData.billDTOList;
            }
            return [];
        }
        console.error('Failed to fetch bills:', response.status, response.statusText);
        return [];
    } catch (error) {
        console.error('Error fetching bills:', error);
        return [];
    }
};

export const getBillById = async (id, token, refreshToken, onTokenRefresh, bypass) => {
    try {
        let url = `/api/v1/bills/${encodeURIComponent(id)}`;
        if (bypass) {
            url += `?bypass=${encodeURIComponent(bypass)}`;
        }
        const response = await fetchWithAutoRefresh({
            url,
            options: { method: 'GET' },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        }
        console.error('Failed to fetch bill by id:', response.status, response.statusText);
        return null;
    } catch (error) {
        console.error('Error fetching bill by id:', error);
        return null;
    }
};

export const createBill = async (billData, token, refreshToken, onTokenRefresh) => {
    try {
        const response = await fetchWithAutoRefresh({
            url: '/api/v1/bills',
            options: {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(billData),
            },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        }
        console.error('Failed to create bill:', response.status, response.statusText);
        return null;
    } catch (error) {
        console.error('Error creating bill:', error);
        return null;
    }
};

export const editBill = async (billData, token, refreshToken, onTokenRefresh) => {
    try {
        const response = await fetchWithAutoRefresh({
            url: '/api/v1/bills',
            options: {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(billData),
            },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        }
        console.error('Failed to edit bill:', response.status, response.statusText);
        return null;
    } catch (error) {
        console.error('Error editing bill:', error);
        return null;
    }
};

export const deleteBill = async (billData, token, refreshToken, onTokenRefresh) => {
    try {
        const response = await fetchWithAutoRefresh({
            url: '/api/v1/bills',
            options: {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(billData),
            },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        }
        console.error('Failed to delete bill:', response.status, response.statusText);
        return null;
    } catch (error) {
        console.error('Error deleting bill:', error);
        return null;
    }
};

export const resendVerificationEmail = async (token, refreshToken, onTokenRefresh) => {
    try {
        const response = await fetchWithAutoRefresh({
            url: '/api/v1/auth/resend-verification',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (!response.ok) {
            throw new Error('Failed to resend verification email');
        }
        return true;
    } catch (error) {
        console.error('Error resending verification email:', error);
        throw error;
    }
};

export const getRecycleBin = async (token, refreshToken, onTokenRefresh) => {
    try {
        const response = await fetchWithAutoRefresh({
            url: '/api/v1/recycle',
            options: { method: 'GET' },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            // If responseData has a recycleItems property, return that, else return []
            if (responseData && Array.isArray(responseData.recycleItems)) {
                return responseData.recycleItems;
            }
            return [];
        }
        console.error('Failed to fetch recycled entries:', response.status, response.statusText);
        return [];
    } catch (error) {
        console.error('Error fetching recycled entries:', error);
        return [];
    }
};

export const getPaymentById = async (id, token, refreshToken, onTokenRefresh) => {
    try {
        const response = await fetchWithAutoRefresh({
            url: `/api/v1/payments/${encodeURIComponent(id)}`,
            options: { method: 'GET' },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        }
        console.error('Failed to fetch payment by id:', response.status, response.statusText);
        return null;
    } catch (error) {
        console.error('Error fetching payment by id:', error);
        return null;
    }
};

export const getStats = async (token, refreshToken, onTokenRefresh, filters) => {
    try {
        let url = '/api/v1/entries/stats';
        if (filters && typeof filters === 'object' && Object.keys(filters).length > 0) {
            // Convert filters object to query string
            const params = new URLSearchParams();
            for (const key in filters) {
                if (filters[key] !== undefined && filters[key] !== null) {
                    if (Array.isArray(filters[key])) {
                        filters[key].forEach(val => params.append(key, val));
                    } else {
                        params.append(key, filters[key]);
                    }
                }
            }
            url += `?${params.toString()}`;
        }
        const response = await fetchWithAutoRefresh({
            url,
            options: { method: 'GET' },
            token,
            refreshToken,
            onTokenRefresh
        });
        if (response.ok) {
            const responseData = await response.json();
            return responseData; // Return the DTO object directly
        }
        console.error('Failed to fetch stats:', response.status, response.statusText);
        return null;
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
};
