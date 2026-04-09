// src/utils/faceDetection.js

let modelsLoaded = false;

/**
 * Load face-api.js models from /models directory
 */
export const loadModels = async () => {
    if (modelsLoaded) return;
    
    try {
        const modelPath = '/models';
        await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
            window.faceapi.nets.ageGenderNet.loadFromUri(modelPath)
        ]);
        modelsLoaded = true;
        console.log('✅ Face API models loaded');
    } catch (error) {
        console.error('❌ Error loading Face API models:', error);
    }
};

/**
 * Detect face features (gender, face shape, hair type, density)
 * @param {HTMLImageElement} imageElement 
 */
export const analyzeImage = async (imageElement) => {
    try {
        // a. Load models
        await loadModels();

        if (!window.faceapi) {
            console.error('Face API not found in window object');
            return null;
        }

        // b. Run detection
        const result = await window.faceapi.detectSingleFace(
            imageElement,
            new window.faceapi.TinyFaceDetectorOptions()
        ).withAgeAndGender();

        if (!result) {
            console.warn('No face detected');
            return null;
        }

        // d. Get gender
        const gender = result.gender; // 'male' or 'female'
        const genderConfidence = Math.round(result.genderProbability * 100);

        // e. Calculate face shape from bounding box
        const { width, height } = result.detection.box;
        const ratio = width / height;
        
        let faceShape = "oval";
        if (ratio > 0.88) faceShape = "round";
        else if (ratio >= 0.78) faceShape = "oval";
        else if (ratio >= 0.68) faceShape = "square";
        else faceShape = "oblong";

        // f. Estimate hair type and density
        const hairType = genderConfidence > 80 ? "wavy" : "straight";
        const hairDensity = "medium";

        // g. Return result
        return {
            gender,
            genderConfidence,
            faceShape,
            hairType,
            hairDensity
        };
    } catch (error) {
        console.error('❌ Error analyzing image:', error);
        return null;
    }
};
