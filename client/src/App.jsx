import axios from 'axios'
import { UserContextProvider, UserContext} from "./userContext";
import Routes from "./route";

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const isProduction = import.meta.env.MODE === 'production';
  axios.defaults.baseURL = isProduction ? apiUrl : 'http://localhost:4040';
  //axios.defaults.baseURL = 'http://localhost:4040';
  axios.defaults.withCredentials = true;

  return ( 
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}

export default App
