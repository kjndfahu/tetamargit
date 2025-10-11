export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phone: (phone: string, optional: boolean = false): boolean => {
    if (optional && !phone) return true;
    const phoneRegex = /^[\d\s+()-]{9,}$/;
    return phoneRegex.test(phone);
  },

  required: (value: string): boolean => {
    return value.trim().length > 0;
  }
};

export const spamDetection = {
  check: (data: { name?: string; email?: string; message?: string }): boolean => {
    const spamKeywords = ['casino', 'viagra', 'lottery', 'winner', 'claim prize'];
    const text = `${data.name || ''} ${data.email || ''} ${data.message || ''}`.toLowerCase();
    return spamKeywords.some(keyword => text.includes(keyword));
  }
};

export function useFormInputHandler() {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    setFormData: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  return { handleInputChange };
}
