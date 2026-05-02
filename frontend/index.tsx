import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import FirebaseListener from './components/FirebaseListener';

const Main = () => {
  return (
    <React.StrictMode>
      {/* The FirebaseListener handles all global state and background sync */}
      <FirebaseListener />
      <App />
    </React.StrictMode>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(<Main />);