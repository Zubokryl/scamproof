import api from '@/api/api';
import { Article } from '@/types/articles';

interface SearchResponse {
  articles: Article[];
  categories: any[];
  topics: any[];
}

export const searchArticles = async (query: string): Promise<Article[]> => {
  try {
    const res = await api.get<SearchResponse>(`/search?q=${encodeURIComponent(query)}`);
    return res.data.articles || [];
  } catch (error) {
    console.error('Error searching articles:', error);
    throw new Error('Не удалось выполнить поиск');
  }
};