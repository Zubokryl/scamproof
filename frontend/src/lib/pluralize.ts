/**
 * Returns the correct Russian plural form based on the number
 * @param count The number to determine the plural form for
 * @param forms An array of 3 strings: [one, few, many]
 * @returns The correct plural form
 */
export function pluralize(count: number, forms: [string, string, string]): string {
  const absCount = Math.abs(count) % 100;
  const tens = absCount % 10;
  
  if (absCount > 10 && absCount < 20) {
    return forms[2]; // many
  }
  
  if (tens === 1) {
    return forms[0]; // one
  }
  
  if (tens > 1 && tens < 5) {
    return forms[1]; // few
  }
  
  return forms[2]; // many
}

/**
 * Returns the correct Russian plural form for "articles" (статья)
 */
export function pluralizeArticles(count: number): string {
  const form = pluralize(count, ['статья', 'статьи', 'статей']);
  return `${count} ${form}`;
}

/**
 * Returns the correct Russian plural form for "comments" (комментарий)
 */
export function pluralizeComments(count: number): string {
  const form = pluralize(count, ['комментарий', 'комментария', 'комментариев']);
  return `${count} ${form}`;
}

/**
 * Returns the correct Russian plural form for "likes" (лайк)
 */
export function pluralizeLikes(count: number): string {
  const form = pluralize(count, ['лайк', 'лайка', 'лайков']);
  return `${count} ${form}`;
}

/**
 * Returns the correct Russian plural form for "views" (просмотр)
 */
export function pluralizeViews(count: number): string {
  const form = pluralize(count, ['просмотр', 'просмотра', 'просмотров']);
  return `${count} ${form}`;
}

/**
 * Returns the correct Russian plural form for "users" (пользователь)
 */
export function pluralizeUsers(count: number): string {
  const form = pluralize(count, ['пользователь', 'пользователя', 'пользователей']);
  return `${count} ${form}`;
}

/**
 * Returns the correct Russian plural form for "messages" (сообщение)
 */
export function pluralizeMessages(count: number): string {
  const form = pluralize(count, ['сообщение', 'сообщения', 'сообщений']);
  return `${count} ${form}`;
}

/**
 * Returns the correct Russian plural form for "categories" (категория)
 */
export function pluralizeCategories(count: number): string {
  const form = pluralize(count, ['категория', 'категории', 'категорий']);
  return `${count} ${form}`;
}

/**
 * Returns the correct Russian plural form for "topics" (тема)
 */
export function pluralizeTopics(count: number): string {
  const form = pluralize(count, ['тема', 'темы', 'тем']);
  return `${count} ${form}`;
}

/**
 * Returns the correct Russian plural form for "replies" (ответ)
 */
export function pluralizeReplies(count: number): string {
  const form = pluralize(count, ['ответ', 'ответа', 'ответов']);
  return `${count} ${form}`;
}

/**
 * Returns the correct Russian plural form for "posts" (пост)
 */
export function pluralizePosts(count: number): string {
  const form = pluralize(count, ['пост', 'поста', 'постов']);
  return `${count} ${form}`;
}