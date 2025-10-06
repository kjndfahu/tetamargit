export const formatNumber = (number: number, locale: string = 'sk-SK'): string => {
  return new Intl.NumberFormat(locale).format(number);
};

export const formatCurrency = (
  amount: number,
  currency: string = 'EUR',
  locale: string = 'sk-SK'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (
  date: Date | string,
  locale: string = 'sk-SK',
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
};

export const formatTime = (
  time: string,
  locale: string = 'sk-SK'
): string => {
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const getPluralForm = (
  count: number,
  forms: [string, string, string],
  locale: string = 'sk-SK'
): string => {
  if (locale === 'sk-SK') {
    if (count === 1) return forms[0];
    if (count >= 2 && count <= 4) return forms[1];
    return forms[2];
  }
  
  // Для других языков используем стандартную логику
  if (count === 1) return forms[0];
  return forms[1];
};

export const formatCountdown = (seconds: number, locale: string = 'sk-SK'): string => {
  const forms = {
    sk: {
      second: ['sekundu', 'sekundy', 'sekúnd'],
      minute: ['minútu', 'minúty', 'minút'],
      hour: ['hodinu', 'hodiny', 'hodín']
    }
  };
  
  const lang = locale.split('-')[0] as keyof typeof forms;
  const langForms = forms[lang] || forms.sk;
  
  if (seconds < 60) {
    return `${seconds} ${getPluralForm(seconds, langForms.second)}`;
  }
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${getPluralForm(minutes, langForms.minute)}`;
  }
  
  const hours = Math.floor(seconds / 3600);
  return `${hours} ${getPluralForm(hours, langForms.hour)}`;
};

