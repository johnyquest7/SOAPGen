document.addEventListener('DOMContentLoaded', () => {
    const recordButton = document.getElementById('recordButton');
    const transcriptionArea = document.getElementById('transcription');
    const modelSelect = document.getElementById('modelSelect');
    const loadModelButton = document.getElementById('loadModelButton');
    const generateNoteButton = document.getElementById('generateNoteButton');
    const soapNoteArea = document.getElementById('soapNote');

    let mediaRecorder;
    let audioChunks = [];
    let selectedModel;
    let browserAI;

    // Initialize BrowserAI
    async function initializeBrowserAI() {
        browserAI = new BrowserAI();
        await browserAI.init();
    }

    initializeBrowserAI();

    // Handle audio recording
    recordButton.addEventListener('click', async () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            recordButton.textContent = 'Start Recording';
        } else {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            recordButton.textContent = 'Stop Recording';

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioChunks = [];
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioBuffer = new Float32Array(arrayBuffer);
                const transcription = await browserAI.transcribe(audioBuffer);
                transcriptionArea.value = transcription;
                generateNoteButton.disabled = false;
            };
        }
    });

    // Handle model loading
    loadModelButton.addEventListener('click', async () => {
        const modelName = modelSelect.value;
        loadModelButton.textContent = 'Loading...';
        selectedModel = await browserAI.loadModel(modelName);
        loadModelButton.textContent = 'Model is Ready';
    });

    // Handle SOAP note generation
    generateNoteButton.addEventListener('click', async () => {
        const transcription = transcriptionArea.value;
        const soapNote = await selectedModel.generateSOAPNote(transcription);
        soapNoteArea.value = soapNote;
    });
});
