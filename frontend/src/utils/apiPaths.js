export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register", //signup
        LOGIN: "/api/auth/login", //authenticate user and return jwt token
        GET_PROFILE: "/api/auth/profile", //get logged in user details
    },

    RESUME: {
        CREATE: "/api/resume", //post - create a new resume
        GET_ALL: "/api/resume", //get - get all resumes of logged in user
        GET_BY_ID: (id) => `/api/resume/${id}`, //get - get a specific resume
        UPDATE: (id) => `/api/resume/${id}`, //put - update a resume
        DELETE: (id) => `/api/resume/${id}`, //delete - delete a resume
        UPLOAD_IMAGES: (id) => `/api/resume/${id}/upload-images`, //put - upload thumbnail and resume profile image
    },

    IMAGES: {
        UPLOAD_IMAGE: "api/auth/upload-image"
    },
};