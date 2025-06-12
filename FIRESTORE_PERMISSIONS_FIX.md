# Fixing Firestore Permissions

If you're seeing errors like `FirebaseError: Missing or insufficient permissions` when using the application, follow these steps to resolve the issue:

## Step 1: Update Your Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`test-app-c4c59`)
3. Navigate to **Firestore Database** in the left menu
4. Select the **Rules** tab
5. Replace the existing rules with these temporary development rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY DEVELOPMENT RULES - REPLACE WITH STRICTER RULES FOR PRODUCTION
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. Click "Publish"

## Step 2: Test Your Application

After updating the rules, try using the application again. You should now be able to:
- Create an account
- Log in
- Access your user profile

## Step 3: Use the Built-in Diagnostics

The application now includes diagnostics tools to help identify Firestore permission issues:

1. Log in to the application
2. On the homepage, click the "Test Firestore" button 
3. Check the results to see if read/write operations are working

## Step 4: Use Console Debugging Tools

For more advanced troubleshooting, you can use the built-in debugging tools in your browser console:

1. Open your browser's Developer Tools (F12 or Ctrl+Shift+I)
2. Go to the Console tab
3. After logging in, use these commands:

```javascript
// Get your user ID
const userId = firebase.auth().currentUser.uid;

// Run diagnostics
window.FirebaseDebugTools.diagnose(userId);

// Suggest security rules
window.FirebaseDebugTools.suggestRules();

// Attempt to repair your user data
window.FirebaseDebugTools.repair(userId, {
  displayName: "Your Name",
  email: "your.email@example.com"
});
```

## Step 5: For Production Use

Once your application is working correctly and you're ready for production, update your security rules to be more restrictive:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default deny for everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Need More Help?

If you continue experiencing issues with Firestore permissions, check the following:
- Ensure your Firebase project is properly configured
- Verify that your authentication is working correctly
- Check for any console errors related to Firebase
- Make sure your security rules match your application's needs
