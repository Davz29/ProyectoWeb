const CLAVE = "fime-smash-5d.duplas.v1";
const CUPO = 8;

const formulario = document.querySelector("#formulario");
const lista = document.querySelector("#lista");
const aviso = document.querySelector("#aviso");
const filtro = document.querySelector("#filtro");

function leerEquipos() {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE) || "[]");
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function guardarEquipos(equipos) {
    try {
        localStorage.setItem(CLAVE, JSON.stringify(equipos));
        return true;
    } catch {
        avisar("No se pudo guardar en este navegador.", true);
        return false;
    }
}

function avisar(texto, esError) {
    if (!aviso) {
        return;
    }
    aviso.textContent = texto;
    if (esError) {
        aviso.className = "text-red-700 font-bold mt-3";
    } else {
        aviso.className = "text-sky-800 font-bold mt-3";
    }
}

function jugadores(equipo) {
    const uno = equipo.apodo1 + (equipo.personaje1 ? " (" + equipo.personaje1 + ")" : " (Sin definir)");
    const dos = equipo.apodo2 + (equipo.personaje2 ? " (" + equipo.personaje2 + ")" : " (Sin definir)");
    return uno + " y " + dos;
}

function mostrarCupo() {
    const cupoEl = document.querySelector("#cupo");
    const boton = document.querySelector("#inscribir");
    if (!cupoEl || !boton) {
        return;
    }

    const libres = CUPO - leerEquipos().length;
    if (libres > 0) {
        cupoEl.textContent = "Lugares disponibles: " + libres + " de " + CUPO + " equipos.";
        boton.disabled = false;
    } else {
        cupoEl.textContent = "Cupo lleno. Retira un equipo para liberar un lugar.";
        boton.disabled = true;
    }
}

function registrarEquipo(evento) {
    evento.preventDefault();
    const equipos = leerEquipos();

    if (equipos.length >= CUPO) {
        mostrarCupo();
        avisar("El cupo está lleno.", true);
        return;
    }

    const equipo = {
        nombre: formulario.elements.nombre.value.trim(),
        apodo1: formulario.elements.apodo1.value.trim(),
        apodo2: formulario.elements.apodo2.value.trim(),
        personaje1: formulario.elements.personaje1.value.trim(),
        personaje2: formulario.elements.personaje2.value.trim(),
        presente: false
    };

    if (!equipo.nombre || !equipo.apodo1 || !equipo.apodo2) {
        avisar("Escribe el nombre del equipo y los dos apodos.", true);
        return;
    }

    equipos.push(equipo);
    if (!guardarEquipos(equipos)) {
        return;
    }

    const nombrePase = document.querySelector("#nombre-pase");
    const detallePase = document.querySelector("#detalle-pase");
    if (nombrePase && detallePase) {
        nombrePase.textContent = equipo.nombre;
        detallePase.textContent = jugadores(equipo) + " · Por llegar";
    }

    avisar("Equipo inscrito: " + equipo.nombre + ".", false);
    formulario.reset();
    mostrarCupo();
    formulario.elements.nombre.focus();
}

function modificarEquipo(nombre, accion) {
    const equipos = leerEquipos();
    const posicion = equipos.findIndex(function (equipo) {
        return equipo.nombre === nombre;
    });

    if (posicion === -1) {
        mostrarEquipos();
        return;
    }

    let mensaje = "";
    if (accion === "retirar") {
        equipos.splice(posicion, 1);
        mensaje = nombre + " se retiró. Hay un lugar libre más.";
    } else {
        const equipo = equipos[posicion];
        equipo.presente = !equipo.presente;
        if (equipo.presente) {
            mensaje = nombre + ": llegada confirmada.";
        } else {
            mensaje = nombre + ": por llegar.";
        }
    }

    if (!guardarEquipos(equipos)) {
        return;
    }

    mostrarEquipos();
    avisar(mensaje, false);
}

function mostrarEquipos() {
    if (!lista) {
        return;
    }

    const equipos = leerEquipos();
    const valorFiltro = filtro ? filtro.value : "todos";
    const presentes = equipos.filter(function (equipo) {
        return equipo.presente;
    }).length;

    const totalEl = document.querySelector("#total");
    const presentesEl = document.querySelector("#presentes");
    const pendientesEl = document.querySelector("#pendientes");
    if (totalEl) totalEl.textContent = equipos.length;
    if (presentesEl) presentesEl.textContent = presentes;
    if (pendientesEl) pendientesEl.textContent = equipos.length - presentes;

    lista.replaceChildren();
    let visibles = 0;

    equipos.forEach(function (equipo) {
        if (valorFiltro === "pendientes" && equipo.presente) {
            return;
        }
        if (valorFiltro === "presentes" && !equipo.presente) {
            return;
        }

        visibles++;

        const elemento = document.createElement("li");
        if (equipo.presente) {
            elemento.className = "p-4 rounded-xl border bg-sky-50";
        } else {
            elemento.className = "p-4 rounded-xl border bg-white";
        }

        const titulo = document.createElement("h3");
        titulo.className = "font-bold text-lg text-slate-900";
        titulo.textContent = equipo.nombre;

        const estado = document.createElement("span");
        if (equipo.presente) {
            estado.className = "px-3 py-1 rounded-full text-xs font-bold bg-sky-200 text-sky-950";
            estado.textContent = "Presente";
        } else {
            estado.className = "px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800";
            estado.textContent = "Por llegar";
        }

        const filaSuperior = document.createElement("div");
        filaSuperior.className = "flex items-center justify-between gap-2";
        filaSuperior.appendChild(titulo);
        filaSuperior.appendChild(estado);

        const descripcion = document.createElement("p");
        descripcion.className = "text-slate-700 mt-1";
        descripcion.textContent = jugadores(equipo);

        const botonEstado = document.createElement("button");
        botonEstado.type = "button";
        botonEstado.className = "px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold cursor-pointer";
        botonEstado.textContent = equipo.presente ? "Deshacer llegada" : "Confirmar llegada";
        botonEstado.addEventListener("click", function () {
            modificarEquipo(equipo.nombre, "llegada");
        });

        const botonRetirar = document.createElement("button");
        botonRetirar.type = "button";
        botonRetirar.className = "px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-600 text-red-700 text-sm font-bold cursor-pointer";
        botonRetirar.textContent = "Retirar equipo";
        botonRetirar.addEventListener("click", function () {
            modificarEquipo(equipo.nombre, "retirar");
        });

        const controles = document.createElement("div");
        controles.className = "flex flex-wrap gap-2 mt-3";
        controles.appendChild(botonEstado);
        controles.appendChild(botonRetirar);

        elemento.appendChild(filaSuperior);
        elemento.appendChild(descripcion);
        elemento.appendChild(controles);
        lista.appendChild(elemento);
    });

    if (visibles === 0) {
        const vacio = document.createElement("p");
        vacio.className = "text-slate-700";
        vacio.textContent = "No hay equipos para mostrar.";
        lista.appendChild(vacio);
    }
}

if (formulario) {
    formulario.addEventListener("submit", registrarEquipo);
}

if (filtro) {
    filtro.addEventListener("change", mostrarEquipos);
}

function actualizarPagina() {
    if (formulario) {
        mostrarCupo();
    }
    if (lista) {
        mostrarEquipos();
    }
}

actualizarPagina();
window.addEventListener("pageshow", actualizarPagina);
window.addEventListener("storage", actualizarPagina);