# Project structure

Top level
- frontend/ is the React app created with Create React App (TypeScript).
- docs/ holds these explanations.

Main runtime files
- frontend/src/index.tsx boots React and renders App.
- frontend/src/App.tsx owns clock size/location state and the Reset button.
- frontend/src/components/MiniClock.tsx renders the clock and handles drag/resize.
- frontend/src/App.css and frontend/src/index.css provide styling.

Build and tooling
- frontend/package.json contains scripts and dependencies.
- frontend/Dockerfile and frontend/docker-compose.yml provide container setup.
