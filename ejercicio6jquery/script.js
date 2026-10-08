// Ejercicio jQuery: registro con validación

$(function () {
  // Al empezar, el formulario y el mensaje están ocultos
  $("#registro").hide();
  $("#confirmacion").hide();

  // Botón "Registrarse": oculta el contenido y muestra el formulario
  $("#btnRegistro").click(function () {
    $("#confirmacion").hide();
    $("#principal").hide();
    $("#registro").show();
  });

  // Botón "Cancelar": oculta el formulario y vuelve el contenido principal
  $("#btnCancelar").click(function () {
    limpiarFormulario();
    $("#registro").hide();
    $("#principal").show();
  });

  // Botón "Enviar": validamos los campos
  $("#formRegistro").on("submit", function (e) {
    e.preventDefault(); // evita que la página se recargue

    if (validar()) {
      let nombre = $("#nombre").val().trim();
      limpiarFormulario();
      $("#registro").hide();
      $("#principal").show();
      $("#confirmacion")
        .text(`¡Registro completado! Bienvenido/a a la Niebla, ${nombre}.`)
        .fadeIn();
    }
  });
});

// Devuelve true si todos los campos son válidos
function validar() {
  let valido = true;
  $(".error").text(""); // borramos errores anteriores

  // Nombre y apellidos: al menos dos palabras, solo letras (con acentos)
  let nombre = $("#nombre").val().trim();
  let regexNombre = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+( +[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/;
  if (!regexNombre.test(nombre)) {
    $("#errorNombre").text("Escribe al menos dos palabras, solo con letras.");
    valido = false;
  }

  // Email con formato válido (algo@algo.algo)
  let email = $("#email").val().trim();
  let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    $("#errorEmail").text("Escribe un email válido, por ejemplo nombre@correo.com");
    valido = false;
  }

  // Teléfono: solo números, sin espacios
  let telefono = $("#telefono").val();
  let regexTelefono = /^[0-9]+$/;
  if (!regexTelefono.test(telefono)) {
    $("#errorTelefono").text("Solo números, sin espacios.");
    valido = false;
  }

  // Contraseña: 8+ caracteres, con mayúscula, minúscula y número
  let password = $("#password").val();
  let tieneMayuscula = /[A-Z]/.test(password);
  let tieneMinuscula = /[a-z]/.test(password);
  let tieneNumero = /[0-9]/.test(password);
  if (password.length < 8 || !tieneMayuscula || !tieneMinuscula || !tieneNumero) {
    $("#errorPassword").text("Mínimo 8 caracteres, con una mayúscula, una minúscula y un número.");
    valido = false;
  }

  return valido;
}

// Vacía los campos y los mensajes de error
function limpiarFormulario() {
  $("#formRegistro input").val("");
  $(".error").text("");
}
