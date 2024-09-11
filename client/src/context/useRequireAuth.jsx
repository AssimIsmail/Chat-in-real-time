import { useContext } from 'react';
import { UserContext } from './UserContext';

const useRequireAuth = () => {
  const currentUser = useContext(UserContext);

  const isAuthenticated = () => {
    return currentUser !== null;
  };

  return isAuthenticated;
};

export default useRequireAuth;
