import React from 'react';
import '../index.css'; // Ajoutez ce fichier CSS pour les animations

const Login = () => {
  const loginWithGoogle = () => {
    window.open("http://localhost:3000/auth/google", "_self");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-10 rounded-xl shadow-xl max-w-sm w-full border border-gray-300 pl-12">
        <h2 className="text-3xl font-bold mb-8 animated-text pl-3">
          <span className="text-g">S</span>
          <span className="text-o">i</span>
          <span className="text-y">g</span>
          <span className="text-b">n</span>
          <span className="text-g"> </span>
          <span className="text-r">i</span>
          <span className="text-y">n</span>
          <span className="text-b"> </span>
          <span className="text-g">w</span>
          <span className="text-o">i</span>
          <span className="text-y">t</span>
          <span className="text-b">h</span>
          <span className="text-g"> </span>
          <span className="text-o">G</span>
          <span className="text-r">o</span>
          <span className="text-y">o</span>
          <span className="text-b">g</span>
          <span className="text-g">l</span>
          <span className="text-r">e</span>
        </h2>
        <button 
          onClick={loginWithGoogle} 
          className="bg-blue-500 text-white w-full py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
