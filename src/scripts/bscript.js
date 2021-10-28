//import 'regenerator-runtime/runtime'

//make difference between edit and create
let submitMethod;
let prefixId;
let characterId = localStorage["stored"];

if (characterId == 0) {
    submitMethod = "POST"
    prefixId = ""
}
else {
    submitMethod = "PUT"
    prefixId = "/" + characterId
}

//load img and return url to send
const inputFile = document.getElementById('inputfile')
const displayImgb = document.querySelector('#displayImg')
let fileURL;
let fileURLtoSend;

document.getElementById('modifImg').addEventListener('click', ()=>{
    inputFile.click()
})

inputFile.addEventListener('change', () => {
    let reader = new FileReader() 
  reader.readAsDataURL(inputFile.files[0])
  reader.onload = () => {      
    fileURLtoSend = reader.result.split(',')[1];
    fileURL = reader.result
    console.log(fileURL)
    let imgTag = `<img scr=${fileURL} alt="">`
    displayImgb.src = fileURL
    return fileURLtoSend
}
})

//display the Markdown editor
//Initialization of the markdown editor and customization of it toolbar
const easyMDE = new EasyMDE({element: document.querySelector('.inputLongDescription'),
toolbar: ["bold", "italic", "heading", "|", "quote", "strikethrough",
    "heading-smaller","heading-bigger", "code","quote","unordered-list","ordered-list","link","|","clean-block","preview"]});
    
//script to display content to edit a character (for characterEditorCreator)
let editCharacters = async() => {
    try {
    let response = await fetch("https://character-database.becode.xyz/characters"+prefixId);
    let character = await response.json();
    
    //display content when editing and nothing for creating new character
    if (characterId==0) {
    //let singleImgField = document.querySelector('.singleImg').src = null;
    let inputNameField = document.querySelector('.inputName').value = null;
    let inputShortDescriptionField = document.querySelector('.inputShortDescription').value = null;
    let inputLongDescriptionField = document.querySelector('.inputLongDescription').value = null;
    }
    else {
    let singleImgField = document.querySelector('#displayImg').src = "data:image/png;base64," + character.image;
    let inputNameField = document.querySelector('.inputName').value = character.name;
    let inputShortDescriptionField = document.querySelector('.inputShortDescription').value = character.shortDescription;
    let inputLongDescriptionField = document.querySelector('.inputLongDescription').value = character.description;
    let htmlToMkd = new showdown.Converter()
    let mkdDescription = htmlToMkd.makeMarkdown(character.description)
    easyMDE.value(mkdDescription)
    localStorage["img"] = character.image
    }
    } catch(err) {console.error("error occured during fetching character" + err)}
}
editCharacters()



//send edited character to api
const saveCharacters = async () => {
    
    //get value from markdown editor
    let mkdDescription = easyMDE.value()
    let mkdToHtml = new showdown.Converter()
    let htmlDescription = mkdToHtml.makeHtml(mkdDescription)

    //Object to put/post
    let characterToPut = new Object
    if (fileURLtoSend==undefined) {
        characterToPut.image= localStorage["img"]
    }
    else {
    characterToPut.image = fileURLtoSend
    }
    characterToPut.name = document.querySelector('.inputName').value
    characterToPut.description = htmlDescription
    characterToPut.shortDescription = document.querySelector('.inputShortDescription').value

    //do not post/put with an empty field
    if ((characterToPut.image==null) || (characterToPut.image==undefined) || (characterToPut.name==null) || (characterToPut.name==undefined) || (characterToPut.description==null) || (characterToPut.description==undefined) || (characterToPut.shortDescription==null) || (characterToPut.shortDescription==undefined)){
        alert("You have to fill all available fields, including adding a picture") //replace with sweet alert
    }
    else {
try {
    await fetch("https://character-database.becode.xyz/characters"+ prefixId,
    {
        method : submitMethod,
        body : JSON.stringify(characterToPut),
        headers: {"Content-type": "application/json; charset=UTF-8"}
    })
} catch (err) {console.log("error occured during saving" + err)}
    alert("saved") //replace with sweet alert with duration 2000ms
    setTimeout(window.location.href = '../index.html',2000)
}
}
const submitButton = document.querySelector('#saveModifications');
submitButton.addEventListener('click',saveCharacters);

document.getElementById('abort').addEventListener('click', ()=>{
    let abort = window.confirm("Continue? Your modifications will not be saved!\nThis will redirect you to the main page");
    if (abort==true) {
        window.location.href = '../index.html'
    }
    else {}
})



