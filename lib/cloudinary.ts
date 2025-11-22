export interface CloudinaryUploadResponse {
    url: string;
    public_id: string;
    resource_type: 'image' | 'video';
}

export async function uploadToCloudinary(file: File, coupleId: string): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();

    // Use environment variable for upload preset, or fall back to unsigned default
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    // Add couple-scoped folder
    formData.append('folder', `couples/${coupleId}/memories`);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
        throw new Error('Cloudinary cloud name is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your .env.local file.');
    }

    // Detect file type (image or video)
    const isVideo = file.type.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Cloudinary error response:', errorData);

            throw new Error(
                `Failed to upload ${resourceType} to Cloudinary. ` +
                `Please ensure you have created an unsigned upload preset named "${uploadPreset}" in your Cloudinary settings. ` +
                `Go to Settings > Upload > Upload presets > Add upload preset, set Signing Mode to "Unsigned", and name it "${uploadPreset}".`
            );
        }

        const data = await response.json();

        return {
            url: data.secure_url,
            public_id: data.public_id,
            resource_type: resourceType,
        };
    } catch (error: any) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

/**
 * Delete media from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    console.log('Cloudinary deletion is not implemented in unsigned mode.');
    console.log('Public ID to delete:', publicId);
    // Note: Deletion requires signed requests with API_SECRET
    // For now, you can manually delete from Cloudinary dashboard
    // or set up a server endpoint with API credentials
}
