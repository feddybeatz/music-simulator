import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useRouter } from "next/router"

export default function Login() {

const router = useRouter()

const [name, setName] = useState("")
const [code, setCode] = useState("")

useEffect(() => {

const saved = localStorage.getItem("artist_code")

if(saved){

router.push("/dashboard")

}

}, [])

function generateCode(name){

const random = Math.random().toString(36).substring(2,8).toUpperCase()

return name.substring(0,3).toUpperCase() + "-" + random

}

async function createArtist(){

const artistCode = generateCode(name)

const { error } = await supabase

.from("artists")

.insert({

artist_name: name,

artist_code: artistCode

})

if(!error){

alert("SAVE THIS CODE: " + artistCode)

localStorage.setItem("artist_code", artistCode)

router.push("/dashboard")

}

}

async function loginArtist(){

const { data } = await supabase

.from("artists")

.select("*")

.eq("artist_code", code)

.single()

if(data){

localStorage.setItem("artist_code", code)

router.push("/dashboard")

}else{

alert("Artist not found")

}

}

return(

<div style={{padding:50}}>

<h1>Music Simulator Login</h1>

<h2>Create Artist</h2>

<input

placeholder="Artist Name"

onChange={(e)=>setName(e.target.value)}

/>

<button onClick={createArtist}>

Create

</button>

<h2>Login</h2>

<input

placeholder="Artist Code"

onChange={(e)=>setCode(e.target.value)}

/>

<button onClick={loginArtist}>

Login

</button>

</div>

)

}
