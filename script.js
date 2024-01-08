console.log("lets right js");
let currentsong = new Audio();
let songs;
let currfolder;

function secondstominutesseconds(seconds){
    if ( isNaN(seconds)||seconds<0){
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingseconds = Math.floor(seconds%60);
    const formattedminutes = String(minutes).padStart(2, '0');
    const formattedseconds = String(remainingseconds).padStart(2, '0');
    return `${formattedminutes}:${formattedseconds}`;
}
async function getsongs(folder) {
    currfolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div  = document.createElement("div")
    div.innerHTML =  response;
    songs = []
    let as = div.getElementsByTagName("a")
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show all the songs in the playlist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML  = songul.innerHTML + `<li>
        <img class="invert" src="images/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20"," ")}</div>
                                <div>Song artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert " src="images/play.svg" alt="">
                            </div>
                        
        </li>`;
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}
const playMusic = (track,pause = false)=>{
    currentsong.src = `/${currfolder}/` +track
    if(!pause){
        currentsong.play()
        play.src = "images/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

    
    
}

async function displayalbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div  = document.createElement("div")
    div.innerHTML =  response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        
        if(e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[0]
            // get the metadata from the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div  class="play">
                <img src="images/play.svg" alt="">
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    //load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            // playMusic(songs[0])
        })
    })
    Array.from(document.getElementsByClassName("play")).forEach(e=>{
        e.addEventListener("click",function(){
            playMusic(songs[0])
        })
    })
    
}

async function main(){
    
    //get the list of the songs
    await getsongs("songs/rp")
    playMusic(songs[0],true)
    
    //display all the albums
    displayalbums()

    //play the songs
    var audio = new Audio(songs[0]);
    audio.play();

    audio.addEventListener("loadeddata",()=>{
        let duration = audio.duration;
        // console.log(audio.duration,audio.currentSrc,audio.currentTime)
    });

    //attach event listener to play, next and previous
    play.addEventListener("click", ()=>{
        if(currentsong.paused){
            currentsong.play()
            play.src = "images/pause.svg"
        }
        else{
            currentsong.pause()
            play.src = "images/play.svg"
        }
    })

    //listen for timeupdate event
    currentsong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML = `${secondstominutesseconds(currentsong.currentTime)} / ${secondstominutesseconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime/currentsong.duration)*100 + "%"
    })

    //add an event listener to a seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration)*percent)/100
    })

    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0"
    })
    //add an event listener for close
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-110%"
    })

    //add an event listener to previous and next
    previous.addEventListener("click",()=>{
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index-1) >= 0){
            playMusic(songs[index-1])
        }
    })
    next.addEventListener("click",()=>{
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
        
    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log("setting volume to",e.target.value,"/100")
        currentsong.volume = parseInt(e.target.value)/100
    })

    //add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("images/volume.svg")){
            e.target.src = e.target.src.replace("images/volume.svg","images/mute.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            currentsong.volume = 0;
        }
        else{
            e.target.src = e.target.src.replace("images/mute.svg","images/volume.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
            currentsong.volume = 0.5;
        }
    })
}
main()