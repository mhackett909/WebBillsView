
// Returns a user-friendly payment type string
export function mapPaymentType(type) {
    const t = type ? type.toLowerCase() : '';
    switch (t) {
        case 'bank': return 'Bank Account';
        case 'cash': return 'Cash';
        case 'check': return 'Check';
        case 'credit': return 'Credit';
        case 'cyber': return 'Cybercurrency';
        case 'debit': return 'Debit';
        case 'prepaid': return 'Prepaid Card';
        case 'other': return 'Other';
        default: return type;
    }
}

// Returns a user-friendly payment medium string
export function mapPaymentMedium(medium) {
    const m = medium ? medium.toLowerCase() : '';
    switch (m) {
        case 'ach': return 'ACH';
        case 'auto': return 'Automatic Payment';
        case 'eft': return 'Electronic Fund Transfer';
        case 'ewallet': return 'eWallet (Apple Pay, Google Pay, etc.)';
        case 'person': return 'In Person';
        case 'mail': return 'Mail';
        case 'app': return 'Mobile App';
        case 'phone': return 'Phone';
        case 'other': return 'Other';
        case 'service': return 'Service (Zelle, Venmo, PayPal, etc.)'
        case 'web': return 'Website';
        default: return medium;
    }
}