import axios from 'axios'
import { UserContextProvider, UserContext} from "./userContext";
import Routes from "./route";

function App() {
  axios.defaults.baseURL = 'http://localhost:4040';
  axios.defaults.withCredentials = true;

  return ( 
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}

export default App
