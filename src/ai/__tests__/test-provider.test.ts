import { describe, it, expect } from 'vitest';

describe('TestTextProvider', () => {
  describe('canned responses', () => {
    it.todo('returns configured canned response');
    it.todo('returns different responses for sequential calls');
    it.todo('cycles through responses when exhausted');
    it.todo('supports response based on input pattern');
  });

  describe('request capture', () => {
    it.todo('captures all requests for assertions');
    it.todo('records request timestamp');
    it.todo('records full request parameters');
    it.todo('allows clearing captured requests');
  });

  describe('delay simulation', () => {
    it.todo('simulates configurable delay');
    it.todo('delay affects response time');
    it.todo('supports variable delays per response');
  });

  describe('error simulation', () => {
    it.todo('simulates errors when configured');
    it.todo('simulates specific error types');
    it.todo('simulates rate limiting');
    it.todo('simulates timeout errors');
  });

  describe('token usage simulation', () => {
    it.todo('returns configurable token counts');
    it.todo('calculates tokens from response length');
  });

  describe('assertion helpers', () => {
    it.todo('provides helper to assert request was made');
    it.todo('provides helper to assert request count');
    it.todo('provides helper to assert request content');
  });
});

describe('TestImageProvider', () => {
  describe('canned responses', () => {
    it.todo('returns configured image URL');
    it.todo('returns configured base64 data');
    it.todo('returns placeholder image by default');
  });

  describe('request capture', () => {
    it.todo('captures all image generation requests');
    it.todo('records prompt and dimensions');
  });

  describe('error simulation', () => {
    it.todo('simulates image generation errors');
    it.todo('simulates content policy violations');
  });
});
