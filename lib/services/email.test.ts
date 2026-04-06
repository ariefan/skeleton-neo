import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { getSenderEmail } from './email.ts';

describe('getSenderEmail', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear relevant env vars before each test
    delete process.env.RESEND_FROM;
    delete process.env.EMAIL_FROM;
  });

  afterEach(() => {
    // Restore env vars after each test
    for (const key in process.env) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, originalEnv);
  });

  test('should return RESEND_FROM if defined', () => {
    process.env.RESEND_FROM = 'resend@example.com';
    process.env.EMAIL_FROM = 'email@example.com';
    assert.strictEqual(getSenderEmail(), 'resend@example.com');
  });

  test('should return EMAIL_FROM if RESEND_FROM is not defined', () => {
    process.env.EMAIL_FROM = 'email@example.com';
    assert.strictEqual(getSenderEmail(), 'email@example.com');
  });

  test('should return default if neither are defined', () => {
    assert.strictEqual(getSenderEmail(), 'noreply@localhost');
  });
});
