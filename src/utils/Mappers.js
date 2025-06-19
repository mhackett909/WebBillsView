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
        case 'other': return 'Other';
        default: return type;
    }
}

// Returns a user-friendly payment medium string
export function mapPaymentMedium(medium) {
    const m = medium ? medium.toLowerCase() : '';
    switch (m) {
        case 'ach': return 'ACH/EFT';
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
const paymentMethodMap = {
  credit: {
    person: 'Credit Card (In Person)',
    web: 'Credit Card (Online)',
  },
  debit: {
    person: 'Debit Card (In Person)',
    web: 'Debit Card (Online)',
  },
  bank: {
    ach: 'Bank Transfer (ACH/EFT)',
  },
  check: {
    person: 'Check (In Person)',
    mail: 'Check (Mail)',
  },
  cash: {
    person: 'Cash',
  },
  cyber: {
    web: 'Cybercurrency',
  },
  other: {
    ewallet: 'eWallet (Apple Pay, Google Pay, etc.)',
    service: 'Service (Zelle, PayPal, Venmo, etc.)',
    other: 'Unspecified Method',
  },
};

export function mapPaymentTypeMedium(type) {
  if (!type) return '';

  // Parse type and medium from string like "credit|person"
  let t = type, m = '';
  if (type.includes('|')) {
    [t, m] = type.split('|').map(s => s.trim());
  }

  t = t ? t.toLowerCase() : '';
  m = m ? m.toLowerCase() : '';

  // Lookup combined label
  const label = paymentMethodMap[t]?.[m];
  if (label) return label;

  // Fallback for unknown combos
  const typeLabel = mapPaymentType(t);
  const mediumLabel = mapPaymentMedium(m);
  return `${typeLabel} - ${mediumLabel}`;
}

// Returns a user-friendly error message from an API response or error string
export function mapErrorMessageToResponse(response) {
    // If response is a string (e.g., from response.text()), use it directly
    if (typeof response === 'string') {
        if (response.includes('ECONNREFUSED')) {
            return 'Service Currently Unavailable. Please try again later.';
        } else if (response.includes('ECONNRESET')) {
            return 'Connection Reset. Please try again later.';
        }
    }
    // Otherwise, handle as object
    let errorMsg = response && (response.message || response.detail || response.error);
    if (errorMsg && typeof errorMsg === 'string') {
        if (
            errorMsg.toLowerCase().includes('unauthorized') ||
            errorMsg.toLowerCase().includes('401')
        ) {
            return 'Unauthorized: Invalid username or password.';
        }
    }
    return 'Login failed for an unknown reason.';
}
