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
            window.faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
            window.faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
            window.faceapi.nets.ageGenderNet.loadFromUri(modelPath)
        ]);
        modelsLoaded = true;
        console.log('✅ Face API advanced models loaded');
    } catch (error) {
        console.error('❌ Error loading Face API models:', error);
    }
};

const distance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const midpoint = (p1, p2) => {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    };
};

/**
 * Detect face features (gender, face shape)
 * @param {HTMLImageElement} imageElement 
 */
export const analyzeImage = async (imageElement) => {
    try {
        // 1. Ensure models are loaded
        await loadModels();

        if (!window.faceapi) {
            console.error('Face API not found in window object');
            return null;
        }

        // 2. High-accuracy detection with landmarks
        const result = await window.faceapi
            .detectSingleFace(imageElement, new window.faceapi.SsdMobilenetv1Options())
            .withFaceLandmarks()
            .withAgeAndGender();

        if (!result) {
            console.warn('No face detected');
            return null;
        }

        // 3. Extract Gender info
        const gender = result.gender; // 'male' or 'female'
        const genderConfidence = Math.round(result.genderProbability * 100);

        // 4. Calculate Face Shape using 68 Landmarks
        const points = result.landmarks.positions;
        
        // Jaw Width: Point 0 to 16
        const jawWidth = distance(points[0], points[16]);
        
        // Forehead Width: Eye brow outer ends - Point 17 to 26
        const foreheadWidth = distance(points[17], points[26]);
        
        // Cheekbone Width: Point 1 to 15
        const cheekWidth = distance(points[1], points[15]);
        
        // Face Height: Midpoint of brows to Chin (Point 8)
        const browMidpoint = midpoint(points[17], points[26]);
        const faceHeight = distance(browMidpoint, points[8]);

        const ratio = faceHeight / jawWidth;

        let faceShape = "oval"; // default

        // Logic as requested by user
        if (foreheadWidth > jawWidth * 1.1 && faceHeight > cheekWidth * 1.2) {
            faceShape = "heart";
        } else if (ratio > 1.5) {
            faceShape = "oblong";
        } else if (jawWidth > cheekWidth * 0.95 && ratio < 1.1) {
            faceShape = "square";
        } else if (cheekWidth > jawWidth * 1.1 && ratio < 1.3) {
            faceShape = "round";
        } else {
            faceShape = "oval";
        }

        console.log(`Face Analysis: Ratio=${ratio.toFixed(2)}, Shape=${faceShape}`);

        // Return results (Hair type/density now handled by user selection)
        return {
            gender,
            genderConfidence,
            faceShape
        };
    } catch (error) {
        console.error('❌ Error analyzing image:', error);
        return null;
    }
};
