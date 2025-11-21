# Google Maps Setup Guide

This guide will help you set up Google Maps API for the Memory Map feature.

## Step 1: Create/Select Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name

## Step 2: Enable Required APIs

Navigate to **APIs & Services** > **Library** and enable these 4 APIs:

1. ✅ **Maps JavaScript API** - For displaying the interactive map
2. ✅ **Places API** - For location search and autocomplete
3. ✅ **Geocoding API** - For converting addresses to coordinates
4. ✅ **Geolocation API** - For "Use Current Location" feature

**How to enable:**
- Search for each API name in the Library
- Click on the API
- Click "Enable"

## Step 3: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the generated API key immediately

## Step 4: Restrict Your API Key (IMPORTANT for security)

1. Click on your newly created API key to edit it
2. Under **Application restrictions**:
   - Select "HTTP referrers"
   - Add your domains:
     - `localhost:3000/*` (for local development)
     - `yourdomain.com/*` (for production)
3. Under **API restrictions**:
   - Select "Restrict key"
   - Choose only these APIs:
     - Maps JavaScript API
     - Places API  
     - Geocoding API
     - Geolocation API
4. Click **Save**

## Step 5: Set Up Billing (Required)

1. Go to **Billing** in Google Cloud Console
2. Link a billing account
3. **Important**: Set up billing alerts:
   - Go to **Billing** > **Budgets & alerts**
   - Create alerts at $5, $10, and $20

**Don't worry**: Google provides $200 free credit per month. For personal use, you'll likely stay well within the free tier (~$1-2/month usage).

## Step 6: Add API Key to Your App

1. Copy your API key
2. Add it to your `.env` file:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Step 7: Verify Setup

1. Restart your dev server: `npm run dev`
2. Go to "Add Memory" page
3. Enable location feature
4. Try "Use Current Location" or search for a place
5. You should see the map appear!

## Troubleshooting

### "This page can't load Google Maps correctly"
- Check that all 4 APIs are enabled
- Verify API key is in your `.env` file
- Make sure you've restarted the dev server

### "Geolocation is not supported"
- Ensure you're using HTTPS or localhost
- Check browser location permissions

### "RefererNotAllowedMapError"
- Add your domain to HTTP referrers in API key restrictions
- Make sure to use the format: `yourdomain.com/*`

### "This API project is not authorized"
- Enable billing in Google Cloud Console
- Verify all 4 APIs are enabled

## Pricing (2024)

- **Free Tier**: $200 credit/month
- **Maps JavaScript API**: $7 per 1,000 loads
- **Places API**: $17 per 1,000 requests
- **Geocoding API**: $5 per 1,000 requests

**Estimated personal usage**: ~$1.55/month (well within free tier)

## Security Best Practices

1. ✅ Always restrict your API key
2. ✅ Only enable APIs you actually use
3. ✅ Set up billing alerts
4. ✅ Use `NEXT_PUBLIC_` prefix in Next.js
5. ✅ Never commit API keys to GitHub

## Need Help?

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
