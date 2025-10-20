import disposableDomains from 'disposable-email-domains';

/**
 * Email validation utilities
 * Handles disposable email detection and validation
 */

export class EmailValidation {
  /**
   * Check if an email domain is disposable/temporary
   */
  static isDisposableEmail(email: string): boolean {
    try {
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain) return true; // Invalid email format
      
      // Manual list of additional disposable domains not in the main package
      const additionalDisposableDomains = [
        'foxroids.com',
        'tempmail.org',
        'guerrillamail.com',
        'mailinator.com',
        'temp-mail.org',
        'throwaway.email',
        'yopmail.com',
        'maildrop.cc',
        'mailnesia.com',
        'sharklasers.com',
        'guerrillamailblock.com',
        'pokemail.net',
        'spam4.me',
        'bccto.me',
        'chacuo.net',
        'dispostable.com',
        'mailcatch.com',
        'mailmetrash.com',
        'trashmail.net',
        'trashmail.com',
        'mailnull.com',
        'spamgourmet.com',
        'mailinator2.com',
        'mytrashmail.com',
        'trashymail.com',
        'trashmail.net',
        'spam.la',
        'binkmail.com',
        'bobmail.info',
        'chammy.info',
        'devnullmail.com',
        'letthemeatspam.com',
        'mailin8r.com',
        'mailinator.com',
        'mailinator2.com',
        'mailinator3.com',
        'mailinator4.com',
        'mailinator5.com',
        'notmailinator.com',
        'reallymymail.com',
        'reconmail.com',
        'safetymail.info',
        'sogetthis.com',
        'spamhereplease.com',
        'superrito.com',
        'thisisnotmyrealemail.com',
        'tradermail.info',
        'veryrealemail.com',
        'wegwerfmail.de',
        'wegwerfmail.net',
        'wegwerfmail.org',
        'wegwerpmailadres.nl',
        'wetrainbayarea.com',
        'wetrainbayarea.org',
        'wh4f.org',
        'whyspam.me',
        'willselfdestruct.com',
        'wuzup.net',
        'wuzupmail.net',
        'yeah.net',
        'yopmail.com',
        'yopmail.net',
        'yopmail.org',
        'ypmail.webarnak.fr.eu.org',
        'cool.fr.nf',
        'jetable.fr.nf',
        'nospam.ze.tc',
        'nomail.xl.cx',
        'mega.zik.dj',
        'speed.1s.fr',
        'courriel.fr.nf',
        'moncourrier.fr.nf',
        'monemail.fr.nf',
        'monmail.fr.nf'
      ];
      
      // Check if domain is in the disposable domains list or our additional list
      return disposableDomains.includes(domain) || additionalDisposableDomains.includes(domain);
    } catch (error) {
      console.error('Error checking disposable email:', error);
      return false; // Allow email if check fails
    }
  }

  /**
   * Validate email format
   */
  static isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Comprehensive email validation
   */
  static validateEmail(email: string): {
    isValid: boolean;
    isDisposable: boolean;
    error?: string;
  } {
    // Check format first
    if (!this.isValidEmailFormat(email)) {
      return {
        isValid: false,
        isDisposable: false,
        error: 'Invalid email format'
      };
    }

    // Check if disposable
    const isDisposable = this.isDisposableEmail(email);
    
    return {
      isValid: !isDisposable,
      isDisposable,
      error: isDisposable ? 'Disposable email addresses are not allowed. Please use a permanent email address.' : undefined
    };
  }

  /**
   * Get list of common disposable email domains for reference
   */
  static getDisposableDomains(): string[] {
    // Return a subset of the most common ones
    return [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'temp-mail.org',
      'throwaway.email',
      'foxroids.com', // Added the domain you tested
      'yopmail.com',
      'maildrop.cc'
    ];
  }
}

export default EmailValidation;
