import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useRouter } from "next/router"

export default function Dashboard(){

const router = useRouter()

const [artist, setArtist] = useState(null)

useEffect(()=>{

loadArtist()

}, [])

async function loadArtist(){

const code = localStorage.getItem("artist_code")

if(!code){

router.push("/")

return

}

const { data } = await supabase

.from("artists")

.select("*")

.eq("artist_code", code)

.single()

setArtist(data)

}

function logout(){

localStorage.removeItem("artist_code")

router.push("/")

}

if(!artist) return <div>Loading...</div>

return(

<div style={{padding:50}}>

<h1>{artist.artist_name}</h1>

<h2>Money: ${artist.money}</h2>

<h2>Fans: {artist.fans}</h2>

<h2>Popularity: {artist.popularity}</h2>

<h2>Health: {artist.health}</h2>

<button onClick={logout}>

Logout

</button>

</div>

)

}
