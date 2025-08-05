export default class Tarea {
  #id;
  #descripcion;
  #estado;
  #creada;
  #modificada;

  constructor(descripcion, estado) {
    this.#id = crypto.randomUUID();
    this.#descripcion = descripcion;
    this.#estado = estado || "creada";
    this.#creada = new Date().toISOString();
    this.#modificada = new Date().toISOString();
  }

  // Getters
  get id() {
    return this.#id;
  }

  get descripcion() {
    return this.#descripcion;
  }

  get estado() {
    return this.#estado;
  }

  get creada() {
    return this.#creada;
  }

  get modificada() {
    return this.#modificada;
  }

  // Setters
  set id(nuevoId) {
    this.#id = nuevoId;
  }

  set descripcion(nuevaDescripcion) {
    this.#descripcion = nuevaDescripcion;
    this.#modificada = new Date().toISOString();
  }

  set estado(nuevoEstado) {
    this.#estado = nuevoEstado;
    this.#modificada = new Date().toISOString();
  }

  // Método para almacenar el objeto en el localStorage/sessionStorage
  toJSON() {
    return {
      id: this.id,
      descripcion: this.descripcion,
      estado: this.estado,
      creada: this.creada,
      modificada: this.modificada
    };
  }
}