import Register from "./register";
import {useContext} from 'react'
import { UserContext} from "./userContext";
import Chat from './chat'

export default function Routes() {
    const {username, id} = useContext(UserContext)

    if(username) {
        return <Chat />
    }

    return (
        <Register />
    )
}