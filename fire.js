  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAjXsQL_nenVKdVBVpa3jN15hfP3uw0d_c",
    authDomain: "cxtemplates.firebaseapp.com",
    projectId: "cxtemplates",
    storageBucket: "cxtemplates.appspot.com",
    messagingSenderId: "243820786265",
    appId: "1:243820786265:web:a520ed674168041933f748"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  import { getDatabase, set, get, ref, child, update, remove } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";
  const db = getDatabase();
    
function FireTemplates() {
	for (let i=0; i<Templates.length; i++) {
		set(ref(db, "Templates/" + Templates[i], {
            Tmpl: Templates[i+1].replace(/\\/gi, "\\\\")
            })
            .then(()=> {
                console.log(i + ", ")
            })
            .catch((error)=>{
                console.log(i + ", error: " + error)
            })
        );
		i=i+1;  
	}
}

