/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns Whether the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  
  // Basic email format validation (RFC 5322 compliant regex)
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

/**
 * Checks for common email provider domains
 * @param email Email address to check
 * @returns Whether the email domain is common
 */
export const isCommonEmailProvider = (email: string): boolean => {
  if (!email || !email.includes('@')) return false;
  
  const domain = email.split('@')[1].toLowerCase();
  const commonDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'protonmail.com',
    'mail.com',
    'zoho.com',
    'gmx.com',
    'yandex.com',
    'live.com',
    'msn.com'
  ];
  
  return commonDomains.includes(domain);
};

/**
 * Checks if the email appears to be a disposable/temporary email
 * @param email Email address to check
 * @returns Whether the email appears to be disposable
 */
export const isDisposableEmail = (email: string): boolean => {
  if (!email || !email.includes('@')) return false;
  
  const domain = email.split('@')[1].toLowerCase();
  const disposableDomains = [
    'mailinator.com',
    'tempmail.com',
    'temp-mail.org',
    'guerrillamail.com',
    'yopmail.com',
    'trashmail.com',
    'sharklasers.com',
    '10minutemail.com',
    'mailnesia.com',
    'throwawaymail.com',
    'dispostable.com',
    'tempr.email',
    'temp-mail.ru',
    'fakeinbox.com'
  ];
  
  return disposableDomains.includes(domain);
};

/**
 * Comprehensive email validation
 * @param email Email address to validate
 * @returns Object with validation results
 */
export const validateEmail = (email: string) => {
  const isValid = isValidEmail(email);
  const isCommon = isCommonEmailProvider(email);
  const isDisposable = isDisposableEmail(email);
  
  return {
    isValid,
    isCommon,
    isDisposable,
    feedback: !isValid ? 'Please enter a valid email address' :
              isDisposable ? 'Please use a permanent email address, not a disposable one' :
              ''
  };
}; 