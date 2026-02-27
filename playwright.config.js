// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  timeout: 50 * 1000,
  expect:{timeout: 50 * 1000}, 
  use: 
  {
    browserName: "chromium",
    headless: false
  }


});