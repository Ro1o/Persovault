import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digitalwallet.driver',
  appName: 'Digital Driver Wallet',
  webDir: 'dist',
  server: {
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;