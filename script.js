let prompt=document.querySelector("#prompt");
let chatContainer=document.querySelector(".chat-container")

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAcTDliZKsiwHneDvv-jZkkYTJHOM8HFss"
let user={
    data:null,

}

async function generateResponse(aiChatBox){
let text=aiChatBox.querySelector(".ai-chat-area")
    let RequestOption={
        method:"POST",
        headers:{'Content-Type': 'application/json'},
        body:JSON.stringify({
            "contents":[
                {"parts":[{"text": user.data}

                ]
            }]
        })
    }
    try{
        let response=await fetch(Api_Url, RequestOption)
        let data=await response.json()
        let apiResponse=data.candidates[0].content.parts[0].text.replace('/\*\*(.*?\*\*/g',"$1").trim();
        text.innerHTML=apiResponse
        saveChatToDatabase(user.data, apiResponse);

    }catch(error){
        console.log(error);
    }finally{
        chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior: "smooth"})
    }
    
}



function createChatBox(html, classes){
    let div = document.createElement("div")
    div.innerHTML=html
    div.classList.add(classes)
    return div
}



function handlechatResponse(message){
    user.data=message
    let html= `<img src="user.png" alt="" id="userImage" width="50">
    <div class="user-chat-area">
    ${user.data}
    </div>`
    prompt.value=""
    let userChatBox = createChatBox(html, "user-chat-box")
    chatContainer.appendChild(userChatBox)

    chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior: "smooth"})

    setTimeout(()=>{
        let html=`<img src="bot1.png" alt="" id="aiImage" width="70">
    <div class="ai-chat-area">
        <img src="loading.webp" alt="" class="load" width="50px">

    </div>`

    let aiChatBox = createChatBox(html, "ai-chat-box")
    chatContainer.appendChild(aiChatBox)
    generateResponse(aiChatBox)
    },600)

}

async function saveChatToDatabase(userMessage, botResponse) {
    try {
        let response = await fetch("save_chat.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_message: userMessage,
                bot_response: botResponse
            })
        });

        let result = await response.json();
        if (result.success) {
            console.log("Chat data saved successfully!");
        } else {
            console.error("Error saving chat data:", result.error);
        }
    } catch (error) {
        console.error("Failed to send chat data:", error);
    }
}

async function fetchChatHistory() {
    try {
        let response = await fetch("save_chat.php?action=fetch");
        let data = await response.json();

        if (data.success) {
            data.messages.reverse().forEach(msg => {
                displayChatMessage(msg.user_message, msg.bot_response);
            });
        }
    } catch (error) {
        console.error("Failed to fetch chat history:", error);
    }
}


prompt.addEventListener("keydown",(e)=>{
    if(e.key=="Enter"){
       handlechatResponse(prompt.value)

    }
console.log(e);
})