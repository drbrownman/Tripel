# Tripel – Personal Travel Explorer

Tripel (https://tripel.xyz) is a web-based application designed to help you explore and share your personal travel history by parsing and visualizing Google Maps Timeline data.

## Features

- **Auto-detection**: Automatically detect and extract trips from your raw Google Maps Timeline location history.
- **Live Map View**: Visualize routes, stops, and even flight paths on a beautiful interactive map.
- **Edit & Tag**: Rename detected trips, manually tag stops (e.g., Home, Work, Chores), and hide unwanted segments.
- **Customize & Share**: Download beautiful snapshots of your trip ready to share.

## How to Use

1. **Export your Google Maps Timeline**:
   - Go to [timeline.google.com](https://timeline.google.com) or use the Google Maps app on your phone.
   - Access "Settings & Privacy" and select "Export Timeline data".
   - Download the `.json` file containing your location history.
2. **Open Tripel**:
   - Simply open `index.html` in your web browser. There is no server required, all data processing happens locally in your browser.
3. **Import Data**:
   - Click "Import Data" and drop your `.json` file(s). You can upload multiple files at once.
4. **Configure Settings**:
   - (Optional) Provide a Google Maps API Key to enable automatic place naming and better auto-tagging.
   - Adjust trip detection settings such as minimum duration, range, and stop thresholds.
5. **Tag Your Places**:
   - Tripel will find your most frequently visited places. Tag at least one as "Home". This is crucial for accurately detecting when a trip starts and ends.
6. **View Your Trips**:
   - Browse the detected trips, view their detailed stats (distance, days, transport modes), and interact with them on the map.
7. **Customize and Share**:
   - Choose from dozens of map themes and other settings to customize your trip views. Make shares and download them to share on your socials.
7. **Work across sessions**:
   - Onces trips are processed, you can save your session and resume on the next visit.

## Privacy

Your data stays on your device. Tripel runs entirely in the browser and does not upload your location history to any external servers (unless you provide a Google Maps API key, which makes standard requests to Google for place details).
