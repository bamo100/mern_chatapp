import axios from 'axios'
import { UserContextProvider, UserContext} from "./userContext";
import Routes from "./route";

function App() {
  const apiUrl = process.env.API_BASE_URL;
  // const isProduction = process.env === 'production';
  axios.defaults.baseURL = isProduction ? apiUrl : 'http://localhost:4040';
  axios.defaults.withCredentials = true;

  return ( 
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}

export default App
