import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthBar: React.FC = () => {
  const { user, login, logout, loading } = useAuth();

  return (
    <div className="fixed top-4 right-4 z-[300] flex items-center gap-4 bg-[rgba(30,34,54,0.85)] px-4 py-2 rounded-full shadow-lg">
      {loading ? (
        <span className="text-white">Loading...</span>
      ) : user ? (
        <>
          <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-yellow-300" />
          <span className="text-white font-semibold">{user.name}</span>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full font-bold ml-2"
            onClick={logout}
          >
            Logout
          </button>
        </>
      ) : (
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full font-bold"
          onClick={login}
        >
          Login with Google
        </button>
      )}
    </div>
  );
};

export default AuthBar;
