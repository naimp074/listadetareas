// app.js
import Tarea from "./tarea.js";

// Elementos del DOM
const btnAgregarTarea = document.getElementById('btnAgregarTarea');
const modalTarea = new bootstrap.Modal(document.getElementById('tareaModal'));
const formularioTarea = document.getElementById('formTarea');
const inputDescripcion = document.getElementById('descripcion');
const selectEstado = document.getElementById('estado');
const tbody = document.querySelector('#tablaTareasBody');
const sinTareas = document.getElementById('sinTareas');
const contenedorEnProceso = document.getElementById('contenedorEnProceso');
const contenedorTerminadas = document.getElementById('contenedorTerminadas');

let estoyCreando = true;
let idTarea = null;

// Obtener tareas del localStorage o iniciar array vacío
const listaTareas = JSON.parse(localStorage.getItem('tareasKey')) || [];

const guardarLocalStorage = () => {
  localStorage.setItem('tareasKey', JSON.stringify(listaTareas));
};

const crearTarea = () => {
  const tareaNueva = new Tarea(inputDescripcion.value, selectEstado.value);
  listaTareas.push(tareaNueva);
  guardarLocalStorage();

  Swal.fire({
    title: "Tarea creada!",
    text: `La tarea fue creada correctamente`,
    icon: "success",
    confirmButtonText: "Ok",
  });

  limpiarFormulario();
  dibujarFila(tareaNueva, listaTareas.length);
  cargarTareas();
};

function limpiarFormulario() {
  formularioTarea.reset();
}

const cargarTareas = () => {
  tbody.innerHTML = "";
  contenedorEnProceso.innerHTML = "";
  contenedorTerminadas.innerHTML = "";

  if (listaTareas.length !== 0) {
    listaTareas.forEach((itemTarea, indice) => {
      dibujarFila(itemTarea, indice + 1);

      if (itemTarea.estado === 'en proceso') {
        contenedorEnProceso.innerHTML += crearCardTarea(itemTarea, '🕒');
      }

      if (itemTarea.estado === 'terminada') {
        contenedorTerminadas.innerHTML += crearCardTarea(itemTarea, '✅');
      }
    });
  }

  verificarTareas();
};

const verificarTareas = () => {
  if (listaTareas.length === 0) {
    sinTareas.classList.remove('d-none');
  } else {
    sinTareas.classList.add('d-none');
  }
};

const dibujarFila = (itemTarea, fila) => {
  tbody.innerHTML += `
    <tr>
      <th scope="row">${fila}</th>
      <td>${itemTarea.descripcion}</td>
      <td>
        <span class="badge ${obtenerClaseEstado(itemTarea.estado)}">
          ${itemTarea.estado}
        </span>
      </td>
      <td>${formatearFecha(itemTarea.creada)}</td>
      <td>${formatearFecha(itemTarea.modificada)}</td>
      <td>
        <button type="button" class="btn btn-warning btn-sm me-2 btn-editar" onclick="prepararTarea('${itemTarea.id}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button type="button" class="btn btn-danger btn-sm btn-borrar" onclick="borrarTarea('${itemTarea.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `;
};

const crearCardTarea = (tarea, icono) => {
  return `
    <div class="card-tarea">
      <h5>${icono} Tarea</h5>
      <p>${tarea.descripcion}</p>
    </div>
  `;
};

const obtenerClaseEstado = (estado) => {
  switch (estado) {
    case 'creada': return 'bg-secondary';
    case 'en proceso': return 'bg-primary';
    case 'terminada': return 'bg-success';
    default: return 'bg-secondary';
  }
};

const formatearFecha = (fechaISO) => {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString();
};

window.borrarTarea = (id) => {
  Swal.fire({
    title: "¿Estás seguro que quieres eliminar la tarea?",
    text: "Los cambios serán permanentes!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Borrar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      const indiceTarea = listaTareas.findIndex((tarea) => tarea.id === id);
      listaTareas.splice(indiceTarea, 1);
      guardarLocalStorage();
      cargarTareas();

      Swal.fire({
        title: "Tarea eliminada!",
        text: "La tarea fue eliminada correctamente",
        icon: "success"
      });
    }
  });
};

window.prepararTarea = (id) => {
  const tareaBuscada = listaTareas.find((tarea) => tarea.id === id);
  inputDescripcion.value = tareaBuscada.descripcion;
  selectEstado.value = tareaBuscada.estado;
  idTarea = id;
  estoyCreando = false;
  modalTarea.show();
};

const editarTarea = () => {
  const indiceTarea = listaTareas.findIndex((tarea) => tarea.id === idTarea);
  const tarea = listaTareas[indiceTarea];

  selectEstado.addEventListener('change', (e) => {
    const estadoInfo = document.getElementById('estadoInfo');
    estadoInfo.classList.remove('d-none');

    if (e.target.value === 'en proceso') {
      estadoInfo.textContent = "Al marcar como 'En Proceso', se registrará la hora de inicio.";
      estadoInfo.className = 'alert alert-info mt-3';
    } else if (e.target.value === 'terminada') {
      estadoInfo.textContent = "Al marcar como 'Terminada', la tarea se bloqueará para ediciones futuras.";
      estadoInfo.className = 'alert alert-warning mt-3';
    } else {
      estadoInfo.classList.add('d-none');
    }
  });

  if (tarea.estado === 'terminada') {
    Swal.fire({
      title: "Tarea terminada",
      text: "Las tareas terminadas no pueden modificarse. ¿Quieres reabrirla?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, reabrir",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        tarea.estado = 'en proceso';
        tarea.descripcion = inputDescripcion.value;
        guardarLocalStorage();
        cargarTareas();
        modalTarea.hide();
      }
    });
    return;
  }

  tarea.descripcion = inputDescripcion.value;
  tarea.estado = selectEstado.value;

  guardarLocalStorage();
  cargarTareas();
  modalTarea.hide();

  Swal.fire({
    title: "Tarea actualizada!",
    text: "La tarea fue modificada correctamente",
    icon: "success"
  });
};

// Eventos
btnAgregarTarea.addEventListener('click', () => {
  limpiarFormulario();
  estoyCreando = true;
  modalTarea.show();
});

formularioTarea.addEventListener('submit', (e) => {
  e.preventDefault();
  if (estoyCreando) {
    crearTarea();
  } else {
    editarTarea();
  }
  modalTarea.hide();
});

// Tema claro/oscuro
const btndark = document.querySelector('.btn-dark')
const cambiartema = () => {
  const html = document.documentElement
  const temaActual = html.getAttribute('data-bs-theme')
  html.setAttribute('data-bs-theme', temaActual === 'dark' ? 'light' : 'dark')
}
btndark.addEventListener('click', cambiartema)

// Cargar al iniciar
cargarTareas();