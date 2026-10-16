import API from "../../../services/api";

export function resolveProductImageUri(image) {
    if (!image) {
        return null;
    }

    if (/^https?:\/\//i.test(image)) {
        return image;
    }

    const baseUrl = API.defaults.baseURL.replace(/\/api\/?$/, "");
    const imagePath = image.replace(/^\/+/, "");

    return `${baseUrl}/${imagePath.startsWith("storage/") ? imagePath : `storage/${imagePath}`}`;
}
