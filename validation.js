const form = document.querySelector("#modalContactForm")
const name = document.querySelector("#name")
const nameHelp = document.querySelector("#nameHelp")
const email = document.querySelector("#email")
const emailHelp = document.querySelector("#emailHelp")
const message = document.querySelector("#message")
const messageHelp = document.querySelector("#messageHelp")


form.addEventListener("submit", (event) => {
	event.preventDefault()

	if (name.value === "" || email.value === "" || message.value === "") {
		if (name.value === ""){
			nameHelp.innerText = "Dejanos tu nombre"
		}
		if (email.value === ""){
			emailHelp.innerText = "Por favor dejanos tu email"
		}
		if (message.value === ""){
			messageHelp.innerText = "No olvides tu mensaje"
		}

	} else {

		document.querySelector('#modalContactForm > div > div > form').submit();
    	$("#modalContactForm").modal("hide");
    	$('.modal-backdrop').remove();
  		
  		}

	})

