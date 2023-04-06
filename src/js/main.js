var chatGPTAvailable = false;
var default_text =
  "Enter or paste your text here. To download and save it, click on the Download button.";

function clearText() {
  quill.root.innerHTML = "";
}

function download() {
  var text = quill.root.innerHTML;
  var blob = new Blob([text], { type: "text/html" });
  var anchor = document.createElement("a");
  anchor.download = "text.editpad";
  anchor.href = window.URL.createObjectURL(blob);
  anchor.target = "_blank";
  anchor.style.display = "none"; // just to be safe!
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function toggleDayNight() {
  applyDarkMode();

  if (localStorage.getItem("dark-mode") === "true") {
    localStorage.setItem("dark-mode", false);
    document.getElementById("day").style.display = "initial";
    document.getElementById("night").style.display = "none";
  } else {
    localStorage.setItem("dark-mode", true);
    document.getElementById("night").style.display = "initial";
    document.getElementById("day").style.display = "none";
  }
}

function checkDarkMode() {
  var darkMode = localStorage.getItem("dark-mode");
  if (darkMode === "true") {
    applyDarkMode();
    document.getElementById("night").style.display = "initial";
    document.getElementById("day").style.display = "none";
  } else {
    document.getElementById("day").style.display = "initial";
    document.getElementById("night").style.display = "none";
  }
}

function applyDarkMode() {
  document.getElementById("editor").classList.toggle("dark-mode-editor");
  document.getElementById("topbar").classList.toggle("dark-mode-topbar");
  document.getElementById("toolbar").classList.toggle("dark-mode-toolbar");
  document.getElementById("navbar").classList.toggle("dark-mode-navbar");
  document.getElementById("popup-menu").classList.toggle("dark-mode-popup");
}

async function checkChatGPT() {
  var openAiAccessToken = localStorage.getItem("open-ai-access-token");

  if (openAiAccessToken) {
    document.getElementById("chatgpt-init").style.display = "none";
    document.getElementById("chatgpt-ready").style.display = "block";
    document.getElementById("chatgpt-response").style.display = "block";
    await initChatGPT(openAiAccessToken);
  } else {
    document.getElementById("chatgpt-init").style.display = "block";
    document.getElementById("chatgpt-ready").style.display = "none";
    document.getElementById("chatgpt-response").style.display = "none";
  }
}

async function openChatGPTSidebar() {
  document.body.classList.toggle("sidebar-open");
  await checkChatGPT();
}

async function saveChatGPTToken() {
  const openAiAccessToken = document.getElementById(
    "access-token-textarea"
  ).value;
  await initChatGPT(openAiAccessToken);
}

async function initChatGPT(openAiAccessToken) {
  if (chatGPTAvailable) {
    document.getElementById("chatgpt-init").style.display = "none";
    document.getElementById("chatgpt-ready").style.display = "block";
    document.getElementById("chatgpt-response").style.display = "block";
    return;
  } else {
    document.getElementById(
      "chatgpt-response"
    ).innerHTML += `<div id="chatgpt-response-loading" class="chatgpt-response-loading"><p class="chatgpt-response" id=${uuid.v4()}></p></div>`;
    const response = await callChatGPT("Hello", openAiAccessToken);
    if (response.status !== 200) {
      document.getElementById("chatgpt-authfailed").style.display = "block";
    } else {
      document.getElementById("chatgpt-init").style.display = "none";
      document.getElementById("chatgpt-ready").style.display = "block";
      document.getElementById("chatgpt-response").style.display = "block";
      localStorage.setItem("open-ai-access-token", openAiAccessToken);
      chatGPTAvailable = true;
      processResponse(response);
    }
  }
}

async function processResponse(response) {
  const errorMessages = [
    '{"detail":"Hmm...something seems to have gone wrong. Maybe try me again in a little bit."}',
  ];

  if (response.status !== 200) {
    if (response.status === 401) {
      document.getElementById("chatgpt-init").style.display = "block";
      document.getElementById("chatgpt-authfailed").style.display = "block";
      document.getElementById("chatgpt-ready").style.display = "none";
      document.getElementById("chatgpt-response").style.display = "none";
      localStorage.removeItem("open-ai-access-token");
      chatGPTAvailable = false;
    }
    if (response.status === 429) {
      const responseText = `data: {"message": {"id": "${uuid.v4()}", "author": {"role": "assistant", "name": null, "metadata": {}}, "create_time": null, "update_time": null, "content": {"content_type": "text", "parts": ["Too many requests in 1 hour. Try again later."]}, "end_turn": false, "weight": 1.0, "metadata": {"message_type": "next", "model_slug": "text-davinci-002-render-sha", "finish_details": {"type": "stop"}}, "recipient": "all"}, "conversation_id": "${uuid.v4()}", "error": null}`;
      insertResponse(responseText, true);
    }
  } else if (errorMessages.includes(response.body)) {
    const errorMessage = JSON.parse(response.body).detail;
    const responseText = `data: {"message": {"id": "${uuid.v4()}", "author": {"role": "assistant", "name": null, "metadata": {}}, "create_time": null, "update_time": null, "content": {"content_type": "text", "parts": ["${errorMessage}"]}, "end_turn": false, "weight": 1.0, "metadata": {"message_type": "next", "model_slug": "text-davinci-002-render-sha", "finish_details": {"type": "stop"}}, "recipient": "all"}, "conversation_id": "${uuid.v4()}", "error": null}`;
    insertResponse(responseText, true);
  } else {
    const responseText = await response.text(); //`data: {"message": {"id": "${uuid.v4()}", "author": {"role": "assistant", "name": null, "metadata": {}}, "create_time": null, "update_time": null, "content": {"content_type": "text", "parts": ["Hello! How can I assist you today?"]}, "end_turn": false, "weight": 1.0, "metadata": {"message_type": "next", "model_slug": "text-davinci-002-render-sha", "finish_details": {"type": "stop"}}, "recipient": "all"}, "conversation_id": "${uuid.v4()}", "error": null}`;
    insertResponse(responseText, false);
  }
}

async function insertResponse(responseText, error) {
  try {
    const longestLine = responseText
      .split("\n")
      .reduce((a, b) => (a.length > b.length ? a : b));
    const result = longestLine.replace("data: ", "");
    const json = JSON.parse(result);
    const text = json.message.content.parts[0];

    var x = document.getElementsByClassName("chatgpt-response-loading");
    var i;
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";
    }
    document.getElementById("chatgpt-response").style.display = "block";
    document.getElementById("chatgpt-response").innerHTML += `<div class="${
      error ? "chatgpt-error" : "chatgpt-response"
    }" id=${json.message.id}></div>`;

    var i = 0;
    var speed = 10;

    const parsedText = marked.parse(text);
    let isTag;
    function typeWriter() {
      let text = parsedText.slice(0, ++i);
      if (text === parsedText) return;
      document.getElementById(`${json.message.id}`).innerHTML = text;
      var char = text.slice(-1);
      if (char === "<") isTag = true;
      if (char === ">") isTag = false;

      if (isTag) return typeWriter();

      setTimeout(typeWriter, speed);
    }
    typeWriter();
  } catch (e) {
    console.log(e);
  }
}

async function submitToChatGPT() {
  const prompt = document.getElementById("chatgpt-textarea-input").value;
  clearChatGPTTextArea(prompt);
  const response = await callChatGPT(prompt);
  processResponse(response);
}

async function promptChatGPT(prompt) {
  const response = await callChatGPT(prompt);

  if (response.status === 200) {
    const responseText = await response.text();
    const longestLine = responseText
      .split("\n")
      .reduce((a, b) => (a.length > b.length ? a : b));
    const result = longestLine.replace("data: ", "");
    const json = JSON.parse(result);
    const text = json.message.content.parts[0];

    const parsedText = marked.parse(text);
    var caretPosition = quill.getSelection(true);
    quill.clipboard.dangerouslyPasteHTML(caretPosition, parsedText);
  }
}

function clearChatGPTTextArea(prompt) {
  document.getElementById("chatgpt-response").style.display = "block";
  document.getElementById(
    "chatgpt-response"
  ).innerHTML += `<p class="prompt" id="prompt">${prompt}</p>`;
  document.getElementById("chatgpt-textarea-input").value = "";
  document.getElementById(
    "chatgpt-response"
  ).innerHTML += `<div id="chatgpt-response-loading" class="chatgpt-response-loading"><p class="chatgpt-response" id=${uuid.v4()}></p></div>`;
}

async function callChatGPT(prompt, openAiAccessToken) {
  const url = "https://bypass.churchless.tech/api/conversation";
  var accessToken = openAiAccessToken
    ? openAiAccessToken
    : localStorage.getItem("open-ai-access-token");
  return await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      action: "next",
      messages: [
        {
          id: uuid.v4(),
          author: {
            role: "user",
          },
          role: "user",
          content: { content_type: "text", parts: [prompt] },
        },
      ],
      parent_message_id: uuid.v4(),
      model: "text-davinci-002-render",
    }),
  });
}

function printConsoleArt() {
  const consoleStr = `
    ███████ ██████  ██ ████████ ██████   █████  ██████  
    ██      ██   ██ ██    ██    ██   ██ ██   ██ ██   ██ 
    █████   ██   ██ ██    ██    ██████  ███████ ██   ██ 
    ██      ██   ██ ██    ██    ██      ██   ██ ██   ██ 
    ███████ ██████  ██    ██    ██      ██   ██ ██████  
                                                        
                        
    Github: https://github.com/shweshi/editpad

    Version: 1.0.3
    `;
  console.log(consoleStr);
}
