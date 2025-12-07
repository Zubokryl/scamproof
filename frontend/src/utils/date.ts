export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export const formatDate = (dateString: string) => {
  const date = parseDate(dateString);
  return date ? date.toLocaleDateString('ru-RU') : 'Дата не указана';
};