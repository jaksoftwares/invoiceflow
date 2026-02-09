export async function uploadFile(
  file: File,
  folder: string = 'invoiceflow_uploads'
): Promise<string> {
  try {
    // 1. Get Signature from backend
    const signResponse = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder }),
    });

    if (!signResponse.ok) {
      throw new Error('Failed to get upload signature');
    }

    const { signature, timestamp, cloudName, apiKey } = await signResponse.json();

    // 2. Upload with Signature
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      console.error('Cloudinary upload response:', await uploadResponse.text());
      throw new Error('Upload failed');
    }

    const data = await uploadResponse.json();
    return data.secure_url;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}
