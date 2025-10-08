/**
 * Utility functions for processing markdown formatting in AI responses
 */

/**
 * Removes markdown formatting from text, converting it to plain text
 * @param text - The text containing markdown formatting
 * @returns Clean text without markdown formatting
 */
export function stripMarkdown(text: string): string {
  if (!text) return text;
  
  return text
    // Remove bold formatting (**text** or __text__)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Remove italic formatting (*text* or _text_)
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove code formatting (`text`)
    .replace(/`(.*?)`/g, '$1')
    // Remove strikethrough formatting (~~text~~)
    .replace(/~~(.*?)~~/g, '$1')
    // Remove headers (# ## ###)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Clean up multiple spaces and newlines
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Converts markdown to HTML for better display
 * @param text - The text containing markdown formatting
 * @returns HTML string with proper formatting
 */
export function markdownToHtml(text: string): string {
  if (!text) return text;
  
  return text
    // Convert bold (**text** or __text__)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Convert italic (*text* or _text_)
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Convert code (`text`)
    .replace(/`(.*?)`/g, '<code class="bg-zinc-700 px-1 py-0.5 rounded text-xs">$1</code>')
    // Convert strikethrough (~~text~~)
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    // Convert headers
    .replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold mt-2 mb-1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-base font-semibold mt-3 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold mt-4 mb-3">$1</h1>')
    // Convert links [text](url) -> <a href="url">text</a>
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-yellow-400 hover:text-yellow-300 underline">$1</a>')
    // Convert line breaks
    .replace(/\n/g, '<br>');
}

/**
 * Simple markdown processor that handles basic formatting for chat messages
 * @param text - The text containing markdown formatting
 * @returns Processed text with basic HTML formatting
 */
export function processChatMarkdown(text: string): string {
  if (!text) return text;
  
  return text
    // Convert bold (**text** or __text__) to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/__(.*?)__/g, '<strong class="font-semibold text-white">$1</strong>')
    // Convert italic (*text* or _text_) to <em>
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/_(.*?)_/g, '<em class="italic">$1</em>')
    // Convert code (`text`) to <code>
    .replace(/`(.*?)`/g, '<code class="bg-zinc-700 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    // Convert line breaks
    .replace(/\n/g, '<br>');
}
