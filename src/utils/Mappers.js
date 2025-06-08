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
        case 'service': return 'Service (Zelle, Venmo, PayPal, etc.)';
        case 'web': return 'Website';
        case 'other': return 'Other';
        default: return medium;
    }
}

/**
 * Maps a payment type and medium string (format: "type|medium") to a user-friendly string.
 * If no match, returns "Type - Medium" with mapped type/medium names.
 */
export function mapPaymentTypeMedium(type) {
    if (!type) return '';
    // Parse type and medium from string like "credit|person"
    let t = type, m = '';
    if (type.includes('|')) {
        [t, m] = type.split('|').map(s => s.trim());
    } else {
        // Fallback: try to parse legacy format "type (medium)"
        const match = /^(.+?)\s*\((.+)\)$/.exec(type);
        if (match) {
            t = match[1].trim();
            m = match[2].trim();
        }
    }
    t = t ? t.toLowerCase() : '';
    m = m ? m.toLowerCase() : '';
    // Specific mappings
    if (t === 'credit' && m === 'person') return 'Credit Card (In Person)';
    if (t === 'credit' && m === 'web') return 'Credit Card (Online)';
    if (t === 'debit' && m === 'person') return 'Debit Card (In Person)';
    if (t === 'debit' && m === 'web') return 'Debit Card (Online)';
    if (t === 'bank' && m === 'ach') return 'Bank Transfer (ACH)';
    if (t === 'bank' && m === 'auto') return 'Bank Transfer (Autopay)';
    if (t === 'check' && m === 'person') return 'Check (In Person)';
    if (t === 'check' && m === 'mail') return 'Check (Mail)';
    if (t === 'cash' && m === 'person') return 'Cash (In Person)';
    if (t === 'cash' && m === 'mail') return 'Cash (Mail)';
    if (t === 'cyber' && m === 'web') return 'Cybercurrency';
    if (t === 'other' && m === 'ewallet') return 'Other - eWallet (Apple Pay, Google Pay, etc.)';
    if (t === 'other' && m === 'service') return 'Other - Service (Zelle, PayPal, Venmo, etc.)';
    if (t === 'other' && m === 'other') return 'Other';
    // Default: Type - Medium
    const typeLabel = mapPaymentType(t);
    const mediumLabel = mapPaymentMedium(m);
    return `${typeLabel} - ${mediumLabel}`;
}