# Isochrone Map

An interactive web application that visualizes travel time areas on a map. Select any location and see how far you can travel in a given time by walking, biking, or driving.

## Features

- Interactive map interface using OpenStreetMap
- Support for multiple transportation modes:
  - Walking (3 mph)
  - Biking (9 mph)
  - Driving (30 mph)
- Shows two isochrone areas:
  - Inner zone: Half of the specified time
  - Outer zone: Full specified time
- Customizable travel time (1-60 minutes)
- Real-time updates and error handling
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenRouteService API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/isochrone-map.git
cd isochrone-map
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenRouteService API key:
```
REACT_APP_ORS_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

## Environment Variables

- `REACT_APP_ORS_API_KEY`: Your OpenRouteService API key (required)

## Technologies Used

- React
- Leaflet (react-leaflet)
- OpenRouteService API
- Axios
- CSS Modules

## API Usage

This project uses the OpenRouteService Isochrones API. You'll need to:
1. Sign up at [OpenRouteService](https://openrouteservice.org/)
2. Generate an API key
3. Add the key to your `.env` file

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

- OpenRouteService for providing the isochrone API
- OpenStreetMap contributors for the map data
- React-Leaflet team for the mapping components