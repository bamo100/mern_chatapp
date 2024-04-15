import axios from "axios"
import { useContext, useState } from "react"
import { UserContext } from "./userContext"

export default function Register () {
   const [username, setUsername] = useState('')
   const [password, setPassword] = useState('')
   const [isLoginOrRegister, setIsLoginorRegister] = useState('register')

   const {setUsername:setLoggedInUsername, setId} = useContext(UserContext)
   async function handleSubmit(ev) {
        const url = isLoginOrRegister === 'register' ? 'register' : 'login'
        ev.preventDefault()
        const {data} = await axios.post(url, {username, password})
        console.log(username, data.id)
        setLoggedInUsername(username)
        setId(data.id)
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form action="" className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <input type="text" value={username} onChange={ev => setUsername(ev.target.value)} placeholder="Username" className="block w-full rounded-sm p-2 mb-2 border" />
                <input type="password" value={password} onChange={ev => setPassword(ev.target.value)} placeholder="password" className="block w-full rounded-sm p-2 mb-2 border"  name="" id="" />
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
                    {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
                </button>
                <div className="text-center mt-2">
                    {isLoginOrRegister === 'register' && (
                        <div>
                            Already a member? 
                            <button onClick={() =>  setIsLoginorRegister('login')}>
                                Login here
                            </button> 
                        </div>
                    )}
                    {
                        isLoginOrRegister === 'login' && (
                            <div>
                                Don`t have an account?
                                <button onClick={() =>  setIsLoginorRegister('register')}>
                                    Register
                                </button> 
                            </div>
                        )
                    }
                </div>
            </form>
        </div>
    )
}
