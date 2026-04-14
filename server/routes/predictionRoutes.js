const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

router.post('/heart-disease', (req, res) => {
    try {
        const { age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal } = req.body;

        // Path to the python script
        const scriptPath = path.join(__dirname, '../../heartdisease/predict.py');

        // Arguments for the python script
        const args = [
            scriptPath,
            age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
        ];

        // Ensure all required arguments are present
        if (args.includes(undefined)) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }

        // Spawn python process
        // In local development, 'python' or 'python3' is commonly used.
        // Assuming 'python' is available based on previous tests.
        const pythonProcess = spawn('python', args, {
            cwd: path.join(__dirname, '../../heartdisease') 
        });

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error(`Error Output: ${errorOutput}`);
                return res.status(500).json({ error: 'Prediction failed.' });
            }

            try {
                // Parse the JSON output from the python script
                const result = JSON.parse(output.trim());
                if (result.error) {
                    return res.status(500).json({ error: result.error });
                }
                res.status(200).json(result);
            } catch (err) {
                console.error('Failed to parse Python output:', output);
                res.status(500).json({ error: 'Invalid response from prediction model.' });
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
