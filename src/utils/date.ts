export const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getTomorrow = (): string => {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('sk-SK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (time: string): string => {
  return time;
};

