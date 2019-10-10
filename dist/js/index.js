function navigateToEditor() {
  localStorage.clear();
  window.location.href = "editor-simulator.html"
}

function loadFile() {
  document.getElementById("file").click();
  $.getJSON("/dist/json/lawn.json", function(json){
  });

}

function fileListener(){
  var selectedFile =  document.getElementById("file");
  selectedFile.addEventListener('change', function() {
    const reader = new FileReader()
    reader.onload =function (){
      localStorage.setItem('lawn', reader.result)
      window.location.href = "editor-simulator.html"
    }
    reader.readAsText(selectedFile.files[0])
}, false)
}