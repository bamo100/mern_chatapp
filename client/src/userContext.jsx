import { useState, useEffect } from "react";
import { createContext } from "react";
import axios from 'axios'

export const UserContext = createContext({})

export function UserContextProvider({children}) {
    const [username, setUsername] = useState(null)
    const [id, setId] = useState(null)
    useEffect(() => {
        axios.get('/profile').then(response => {
            setUsername(response.data.username)
            setId(response.data.userId)
        })
    }, []);

    return  (
        <UserContext.Provider value={{username, setUsername, id, setId}}>
            {children}
        </UserContext.Provider>
    )
}