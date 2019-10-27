import * as CryptoJS from 'crypto-js';

const CLOUD_NAME = '';
const UPLOAD_PRESET = '';

export function expectedImageUrl(imageId: string) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${imageId}.jpg`;
}

export async function uploadImage(imageUuid: string, uri: string) {
  const endpointUri = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const apiKey = '';
  const apiSecret = '';
  const hashString = `public_id=${imageUuid}&timestamp=${timestamp}&upload_preset=${UPLOAD_PRESET}${apiSecret}`;
  const signature = CryptoJS.SHA1(hashString).toString();

  const formData = new FormData();
  formData.append('file', {uri, type: 'image/jpeg', name: 'upload.jpg'});
  formData.append('public_id', imageUuid);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('signature', signature);
  const requestOptions = {
    method: 'POST',
    cors: 'cors',
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: formData, // body data type must match 'Content-Type' header
  };
  const response = await fetch(endpointUri, requestOptions);
  if (response.ok) {
    const image = await response.json();
    return {
      id: image.public_id,
      url: image.secure_url,
    };
  } else {
    throw response;
  }
}
