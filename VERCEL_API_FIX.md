# Vercel API Fix - Network Errors

## 🚨 Problem

Getting "Network error: No response from server" for all API calls:
- `/api/upload` - File upload failing
- `/api/dashboards` - Dashboard loading failing  
- `/api/sessions` - Sessions loading failing

## ✅ Solution Applied

Fixed the Vercel serverless function handler to properly initialize the Express app.

### Changes Made:
1. **`api/index.ts`** - Created proper async handler for Vercel
2. **`server/index.ts`** - Refactored to use `createApp()` factory function
3. **Deployed to Vercel** - New deployment with fixes

## 🔧 What Was Fixed

The issue was that Vercel serverless functions need:
- Proper async initialization of Express app
- Cached app instance across invocations
- Error handling for initialization failures

## 🧪 Testing

After deployment completes (2-3 minutes):

1. **Test Health Endpoint**:
   ```bash
   curl https://marico-insight-safe.vercel.app/api/health
   ```
   Should return: `{"status":"OK","message":"Server is running"}`

2. **Test File Upload**:
   - Go to: https://marico-insight-safe.vercel.app
   - Try uploading a file
   - Should work now!

3. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - Check logs for any errors

## ⚠️ If Still Not Working

### Check Environment Variables:
Make sure these are set in Vercel:
- `OPENAI_API_KEY` (required)
- `VITE_AZURE_CLIENT_ID` (for auth)
- `VITE_AZURE_TENANT_ID` (for auth)
- Any other env vars your app needs

### Check Function Logs:
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Functions" tab
4. Click on `api/index.ts`
5. Check "Logs" for errors

### Common Issues:
- **Timeout**: Function might be timing out (60s limit)
- **Memory**: Function might be running out of memory (2048MB limit)
- **Initialization**: Services (CosmosDB, Blob Storage) might be failing

## 📝 Next Steps

1. Wait for deployment to complete (check Vercel dashboard)
2. Test the health endpoint
3. Try uploading a file
4. Check function logs if still failing

---

**The fix has been deployed. Please test and let me know if it works!**

