import {useEffect, useState, useContext, useRef } from "react";
import Avatar from "./avatar";
import Logo from "./logo";
import { UserContext } from "./userContext";
import {uniqBy} from 'lodash';
import axios from "axios"
import Contact from "./contact";


export default function Chat() {
    const [ws, setWs] = useState(null)
    const [offlinePeople, setOfflinePeole] = useState({})
    const [onlinePeople, setOnlinePeople] = useState({})
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [newMessageText, setNewMessageText] = useState("")
    const {username, id, setId, setUsername} = useContext(UserContext)
    const [messages, setMessages] = useState([])
    const divUnderMessages = useRef()
    useEffect(() => {
        connectToWs()
    }, [])

    function connectToWs() {
        const ws = new WebSocket(
            process.env.NODE_ENV === 'production'
            ?   `wss://${import.meta.env.VITE_API_URL}`
            :   'ws://localhost:4040'
        )
        setWs(ws)
        ws.addEventListener('message', handleMessage)
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected. Trying to reconnect')
                connectToWs()
            }, 1000)
        })
    }

    function showOnlinePeople(peopleArray) {
        const people = {}
        peopleArray.forEach(({userId, username}) => {
            people[userId] = username;
        })
        // console.log(people)
        setOnlinePeople(people)
    }

    function handleMessage(ev) {
        console.log('new messaage', ev)
        const messagteData = JSON.parse(ev.data)
        console.log(messagteData)
        if('online' in messagteData) {
            showOnlinePeople(messagteData.online)
        } 
        else if('text' in messagteData) {
            // console.log({messagteData})
            console.log(messagteData.text)
            console.log(messagteData.file)
            setMessages(prev => ([...prev, {...messagteData}]))
        }
    }

    function sendMessage(ev, file = null) {
        if(ev) ev.preventDefault()
        ws.send(
            JSON.stringify({
                recipient: selectedUserId,
                text: newMessageText,
                file,
            })
        )
        console.log('sending')
        setNewMessageText('')
        setMessages(prev => ([...prev, {
            text: newMessageText, 
            sender: id,
            recipient: selectedUserId,
            _id: Date.now(),
        }]))

        if(file) {
            axios.get('/messages/' + selectedUserId).then( resp => {
                setMessages(resp.data)
            })
        }
    }

    function logout() {
        axios.post('/logout').then(() => {
            setWs(null)
            console.log("connection down")
            setId(null)
            setUsername(null)
        })
    }

    function sendFile(ev){
        // console.log(ev.target.files)
        const reader = new FileReader()
        reader.readAsDataURL(ev.target.files[0])
        reader.onload = () => {
            sendMessage(null, {
                name: ev.target.files[0].name,
                data: reader.result,
            })
        }
    }

    useEffect(() => {
        const div = divUnderMessages.current
        if (div) {
            div.scrollIntoView({behaviour: 'smooth', block: 'end'})
        }
    }, [messages])

    useEffect(() => {
        axios.get('/people').then(res => {
            const offlinePeopleArr = res.data
                .filter(p => p._id !== id)
                .filter(p => !Object.keys(onlinePeople).includes(p._id))
                const offlinePeople = {}
                offlinePeopleArr.forEach(p => {
                    offlinePeople[p._id] = p
                })
                console.log(offlinePeople)
                setOfflinePeole(offlinePeople)
        })
    }, [onlinePeople])

    useEffect(() => {
        if(selectedUserId) {
            axios.get('/messages/' + selectedUserId).then( resp => {
                setMessages(resp.data)
            })
        } 
    }, [selectedUserId])


    const onlinePeopleExclUser = {...onlinePeople}
    delete onlinePeopleExclUser[id]

    const messageWithoutDupes = uniqBy(messages, '_id')
    // const div = messageBoxRef.current
    // div.scrollTop
    
    // console.log(onlinePeopleExclUser)
    return(
        <div className="flex h-screen">
            <div className="bg-white w-1/3 flex flex-col">
                <div className="flex-grow">
                    <Logo />
                    {Object.keys(onlinePeopleExclUser).map(userId => (
                        <Contact
                            key={userId}
                            id={userId}
                            username={onlinePeopleExclUser[userId]}
                            onClick={() => setSelectedUserId(userId)}
                            selected={userId === selectedUserId}
                            online={true}
                        />
                    ))} 
                    {Object.keys(offlinePeople).map(userId => (
                        <Contact
                            key={userId}
                            id={userId}
                            username={offlinePeople[userId].username}
                            onClick={() => setSelectedUserId(userId)}
                            selected={userId === selectedUserId}
                            online={false}
                        />
                    ))} 
                </div>
                <div className="p-2 text-center flex items-center justify-center">
                    <span className="mr-2 text-sm text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                        </svg>
                        {username}
                    </span>
                    <button onClick={logout} className="text-sm text-gray-500 py-1 bg-blue-100 px-2 border rounded-sm">
                        Logout
                    </button>
                </div>
            </div>
            <div className="bg-blue-50 w-2/3 p-2 flex flex-col">
                <div className="flex-grow">
                    {
                        !selectedUserId && (
                            <div className="flex items-center justify-center h-full">
                               <div className="text-gray-400">&larr; Select a Person from the Sidebar</div> 
                            </div>
                        )
                    }
                    {
                        !!selectedUserId && (
                            <div className="relative h-full">
                                <div className="overflow-y-scroll absolute inset-0">
                                    {messageWithoutDupes.map(message => (
                                        <div key={message._id} className={message.sender === id ? 'text-right' : 'text-left'}>
                                            <div className={"text-left inline-block p-2 my-2 rounded-md text-sm " + (message.sender === id ? 'bg-blue-500 text-white':'bg-white text-gray-500')}>
                                                {message.text}
                                                {
                                                    message.file && (
                                                        <div className="">
                                                            <a target="_blank" className="border-b flex items-center gap-1" href={axios.defaults.baseURL + '/uploads/' + message.file}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                                    <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                                                                </svg>
                                                                {message.file}
                                                            </a>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={divUnderMessages}></div>
                                </div>
                            </div>
                        )
                    }
                </div>
                {
                    !!selectedUserId && (
                        <form className="flex gap-2" onSubmit={sendMessage}>
                            <input type="text"
                                value={newMessageText}
                                onChange={ev => setNewMessageText(ev.target.value)}
                            placeholder="Type Your Message Here" className="bg-white border p-2 flex-grow rounded-sm" />
                            <label className="bg-blue-200 p-2 text-gray-500 rounded-sm border border-blue-200 cursor-pointer">
                                <input type="file" className="hidden" onChange={sendFile} />
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                                </svg>
                            </label>
                            <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                </svg>
                            </button>
                        </form>
                    )
                }
            </div>
        </div>
    )
}