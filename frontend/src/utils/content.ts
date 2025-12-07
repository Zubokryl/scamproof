export const prepareContent = (content: string) => {
  return content
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Add lazy loading to images
    .replace(/<img([^>]*)>/g, '<img$1 loading="lazy">')
    // Add lazy loading to videos
    .replace(/<video([^>]*)>/g, '<video$1 preload="metadata" loading="lazy">');
};