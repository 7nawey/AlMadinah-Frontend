import { Injectable } from '@angular/core';

/**
 * Simple transliteration-based translation assistant.
 * Provides real-time suggestions between Arabic and English.
 * This is NOT a full translation service - it offers phonetic transliteration
 * to help users fill bilingual forms faster.
 */
@Injectable({
  providedIn: 'root'
})
export class TranslationAssistantService {

  private arabicToEnglishMap: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a', 'ء': '', 'ى': 'a',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'g', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'dh', 'ع': 'a', 'غ': 'gh',
    'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'a', ' ': ' ',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  };

  private englishToArabicMap: Record<string, string> = {
    'a': 'ا', 'b': 'ب', 't': 'ت', 'd': 'د', 'r': 'ر', 'z': 'ز',
    's': 'س', 'f': 'ف', 'q': 'ق', 'k': 'ك', 'l': 'ل', 'm': 'م',
    'n': 'ن', 'h': 'ه', 'w': 'و', 'y': 'ي', 'g': 'ج', 'p': 'ب',
    'j': 'ج', 'c': 'ك', 'v': 'ف', 'x': 'كس', ' ': ' ',
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩',
  };

  /**
   * Suggest English transliteration from Arabic text.
   * Only returns suggestion if text is primarily Arabic.
   */
  suggestEnglish(arabicText: string): string {
    if (!arabicText || !this.isArabic(arabicText)) return '';
    let result = '';
    for (const char of arabicText) {
      result += this.arabicToEnglishMap[char] || char;
    }
    return result;
  }

  /**
   * Suggest Arabic transliteration from English text.
   * Only returns suggestion if text is primarily English/Latin.
   */
  suggestArabic(englishText: string): string {
    if (!englishText || this.isArabic(englishText)) return '';
    let result = '';
    for (const char of englishText.toLowerCase()) {
      result += this.englishToArabicMap[char] || char;
    }
    return result;
  }

  /**
   * Check if text contains primarily Arabic characters.
   */
  isArabic(text: string): boolean {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  }

  /**
   * Smart field suggestion.
   * If source field has content and target is empty, suggest translation.
   * Returns suggestion string or empty if no suggestion needed.
   */
  getSuggestion(sourceValue: string, targetValue: string): string {
    if (!sourceValue || targetValue) return '';
    if (this.isArabic(sourceValue)) {
      return this.suggestEnglish(sourceValue);
    } else {
      return this.suggestArabic(sourceValue);
    }
  }
}
