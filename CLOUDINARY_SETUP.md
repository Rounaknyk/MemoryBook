# Cloudinary Setup Guide for MemoryVault

You're seeing the "Failed to upload image to Cloudinary" error because you need to create an **unsigned upload preset** in your Cloudinary account.

## Quick Fix (5 minutes)

### Step 1: Go to Cloudinary Dashboard
1. Visit [cloudinary.com](https://cloudinary.com) and log in
2. You'll see your **Cloud Name** on the dashboard - copy this

### Step 2: Create Upload Preset
1. Click on the **Settings** icon (gear) in the top-right
2. Click on **Upload** tab in the left sidebar
3. Scroll down to **Upload presets** section
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: `ml_default` (or any name you prefer)
   - **Signing Mode**: Select **"Unsigned"** (IMPORTANT!)
   - Leave other settings as default
6. Click **Save**

### Step 3: Update Your .env.local File
Add these lines to your `.env.local` file:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
```

Replace `your_cloud_name_here` with your actual Cloud Name from Step 1.

### Step 4: Restart Development Server
1. Stop the dev server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. Try uploading an image - it should work now! 🎉

## Alternative: Use a Different Preset Name

If you want to use a different name for your upload preset:

1. Create the preset with your chosen name (e.g., `memoryvault_uploads`)
2. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=memoryvault_uploads
   ```

## Why Unsigned?

Unsigned upload presets allow browser-based uploads without exposing your API secret. This is perfect for client-side applications like MemoryVault.

## Troubleshooting

### Still getting errors?
1. Double-check the preset name matches exactly
2. Ensure "Signing Mode" is set to "Unsigned"
3. Make sure you've added the Cloud Name to `.env.local`
4. Restart your dev server after changing `.env.local`

### Where to find API Key/Secret?
You don't need these for basic image uploads! The unsigned preset handles everything. However, if you want them for future features:
1. Go to Settings → Access Keys
2. Copy API Key and API Secret
3. Add to `.env.local` (already in the template)

## Need Help?

Check the [Cloudinary Upload Preset Documentation](https://cloudinary.com/documentation/upload_presets) for more details.
