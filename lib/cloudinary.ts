export interface CloudinaryUploadResponse {
    url: string;
    public_id: string;
    resource_type: 'image' | 'video';
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();

    // Use environment variable for upload preset, or fall back to unsigned default
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

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
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
    // This would typically require server-side implementation with API key/secret
    // For now, we'll create a server action for this
    try {
        const response = await fetch('/api/delete-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publicId }),
        });

        if (!response.ok) {
            throw new Error('Failed to delete image from Cloudinary');
        }
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
}
