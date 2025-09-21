export const sanitizers = {
  name: (value: string): string => {
    // Remove digits; allow letters (incl. diacritics), spaces, hyphens, apostrophes
    return value
      .replace(/[0-9]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trimStart();
  },

  phone: (value: string): string => {
    // Allow only digits, +, spaces, parentheses and dashes
    return value.replace(/[^0-9+\-()\s]/g, '');
  }
};

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phone: (phone: string, isOptional = false): boolean => {
    if (!phone.trim() && isOptional) return true;
    // Phone format
    const phoneRegex = /^(\+[1-9]\d{6,14}|0\d{8,14})$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  }
};

export const spamDetection = {
  check: (data: { name?: string; email: string; message: string }): boolean => {
    const text = `${data.name || ''} ${data.email} ${data.message}`.toLowerCase();

    const keywords = ['bitcoin', 'crypto', 'loan', 'viagra', 'seo', 'click here', 'free money'];
    if (keywords.some(k => text.includes(k))) return true;

    if (/(https?:\/\/|www\.)/i.test(text)) return true; // URLs
    if (/(.)\1{6,}/.test(text)) return true; // 7+ repeated chars
    if (data.message.trim().length < 10) return true; // too short

    return false;
  }
};

// Custom hook for form input handling with validation
export const useFormInputHandler = () => {
  const handleInputChange = <T extends Record<string, any>>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    setFormData: React.Dispatch<React.SetStateAction<T>>
  ) => {
    const { name, value } = e.target;

    if (name === 'name' || name === 'firstName' || name === 'lastName') {
      setFormData(prev => ({ ...prev, [name]: sanitizers.name(value) }));
      return;
    }
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: sanitizers.phone(value) }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return { handleInputChange };
};
