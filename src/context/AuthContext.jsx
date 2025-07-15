import { createContext } from 'react';
export const AuthContext = createContext({});

// since I have an Eslint error I Googled and split up the AuthContext and AuthContextProvider into two files:
// export default AuthContextProvider; the error is: ESLint: Fast refresh only works when a file only exports components. Move your React context(s) to a separate file. (react-refresh/only-export-components)

