import axios from 'axios';

// ye function directly public url generate kr ke dega 

export const uploadAudioToCloudinary = async (blob) => {

    // jb bhi folder structure banao cloud pr tb ye parameters me lo 
    // interviewId, questionIndex, attempt

    
    // 1 - formData object banate hai jo data ko binary form me leke jaayega 
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', 'interview_audio');
    // formData.append('folder', `mockmate_audio/${interviewId}/${questionIndex}`);
    // formData.append('public_id', `attempt_${attempt}_${Date.now()}`);   // Unique ID

    const cloudName = 'disuxoqxj';

    try {
        // ab cloudinary ke docs pr direct upload endpoint ka code likha hai wo idhar copy kr ke modify kiya 
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            formData,
            { timeout: 30000 }
        );
        return response.data.secure_url;

    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Cloudinary upload timeout');
        }
        throw error;
    }

}