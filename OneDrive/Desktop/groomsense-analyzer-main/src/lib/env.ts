const requiredPublicKeys = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

export function validateEnv() {
  const missingPublic = requiredPublicKeys.filter(key => {
    const val = process.env[key];
    return !val || val.trim() === '';
  });
  
  if (missingPublic.length > 0) {
    console.error(
      `❌ [GroomSense Env Critical]: Missing client-side configurations:\n${missingPublic.map(k => ` - ${k}`).join('\n')}\nEnsure these are defined in your .env.local file.`
    );
    // Safe warning during build/hydration, throw on runtime client startup
    if (typeof window !== 'undefined') {
      throw new Error(
        `[GroomSense Config Error]: Missing required environment variables: ${missingPublic.join(', ')}. Check your .env.local configuration.`
      );
    }
  }

  // Server-only key validation
  if (typeof window === 'undefined') {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
      console.warn(
        `⚠️ [GroomSense Env Warning]: Missing server-side 'GEMINI_API_KEY'. Skincare and styling AI completions will fail at runtime.`
      );
    }
  }
}

// Automatically validate on loading
validateEnv();
