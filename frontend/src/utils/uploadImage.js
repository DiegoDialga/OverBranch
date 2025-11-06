import axiosInstance from "./axiosInstance.js";
import {API_PATHS} from "./apiPaths.js";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try{
        const response = await axiosInstance.post(API_PATHS.IMAGES.UPLOAD_IMAGE, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });

        return response.data;
    }catch(err){
        console.error("Error uploading the image.",err);
        throw err;
    }
}

export default uploadImage;