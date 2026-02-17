# How to Add Your Own Videos to the Ad Carousel

## 1. Recommended Video Format
For the best performance and compatibility across all browsers (Chrome, Safari, Firefox, Edge) and devices (Mobile, Desktop):

*   **Format:** `.mp4`
*   **Codec:** H.264 (Video) + AAC (Audio)
*   **Resolution:** 1080p (1920x1080) or 720p (1280x720) is sufficient. 4K might be too large and slow to load.
*   **File Size:** Try to keep it under **10MB** per video for fast loading.

## 2. Where to Put Your Videos
All video files should be placed in the `public/videos` folder of your project.

**Path:** `dr_kals_virtual_hospital/public/videos/`

## 3. How to Add Them

### Method A: The Simple Swap (Replace Existing)
If you just want to replace the current "walking doctors" video with your own:

1.  Rename your video file to `hospital.mp4`.
2.  Copy it into `public/videos/`, replacing the existing file.
3.  Refresh your browser. All ads using this file will now show your new video.

### Method B: Adding Multiple Different Videos
If you want 5 *different* videos for the 5 different ads:

1.  **Name your files:** Give them simple names, e.g., `lab.mp4`, `consultation.mp4`, `specialists.mp4`.
2.  **Copy them:** Put all of them into `public/videos/`.
3.  **Update the System:** You need to tell the database about these new files.
    *   Open `scripts/seed-ad.mjs` in your code editor.
    *   Look for the `ads` list (lines 10-40).
    *   Update the `url` for each ad to match your new filenames.
    
    **Example:**
    ```javascript
    {
        title: 'Advanced Diagnostic Lab',
        url: '/videos/lab.mp4', // Changed from '/videos/hospital.mp4'
        link: '/services',
        priority: 40
    },
    ```

4.  **Apply Changes:**
    Open your terminal and run:
    ```bash
    node scripts/seed-ad.mjs
    ```
    This will update the database with your new video paths.
