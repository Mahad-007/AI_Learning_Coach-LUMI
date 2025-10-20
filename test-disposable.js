// Test script to verify disposable email blocking
const { EmailValidation } = require('./src/lib/emailValidation.ts');

console.log('Testing disposable email detection...\n');

const testEmails = [
  'test@foxroids.com',
  'user@gmail.com',
  'test@10minutemail.com',
  'user@tempmail.org',
  'test@yahoo.com',
  'user@guerrillamail.com'
];

testEmails.forEach(email => {
  const result = EmailValidation.validateEmail(email);
  console.log(`${email}:`);
  console.log(`  Valid: ${result.isValid}`);
  console.log(`  Disposable: ${result.isDisposable}`);
  console.log(`  Error: ${result.error || 'None'}`);
  console.log('');
});

console.log('Test completed!');
