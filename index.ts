declare const Chart: any

interface Habito {
  id: number
  nombre: string
  color: string
  frecuencia: string
  racha: number
  ultimoCumplimiento?: string
  diasMarcados: string[]
}

interface Usuario {
  nombre: string
  contrasena: string
  habitos: Habito[]
}

class HabitosApp {
  private usuarios: { [key: string]: Usuario } = {}
  private usuarioActual: string | null = null
  private graficoRachas: any = null
  private graficoCumplimiento: any = null
  private soloLetrasRegex = /^\D+$/

  constructor() {
    this.cargarDatosStorage()
  }

  private obtenerFechaLocal(offsetDias = 0): string {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() - offsetDias)
    const anio = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const dia = String(fecha.getDate()).padStart(2, '0')
    return `${anio}-${mes}-${dia}`
  }

  private cargarDatosStorage(): void {
    const datos = localStorage.getItem('Datosusuario')
    this.usuarios = datos ? JSON.parse(datos) : {}
  }

  private guardarStorage(): void {
    localStorage.setItem('Datosusuario', JSON.stringify(this.usuarios))
  }

  registrarUsuario(): boolean {
    const nombreInput = document.getElementById('name') as HTMLInputElement
    const passInput = document.getElementById('contrasena') as HTMLInputElement
    const pass1Input = document.getElementById('contrasena1') as HTMLInputElement
    const spanMensaje = document.getElementById('Mesage') as HTMLElement

    if (!nombreInput || !passInput || !pass1Input || !spanMensaje) return false

    const nombre = nombreInput.value.trim()
    const pass = passInput.value
    const pass1 = pass1Input.value

    if (!nombre || !pass || !pass1) {
      alert('Por favor, complete todos los campos')
      return false
    }

    if (nombre.length < 3 || nombre.length > 20) {
      alert('El nombre debe tener entre 3 y 20 caracteres')
      return false
    }

    if (!this.soloLetrasRegex.test(nombre)) {
      alert('El nombre no puede contener numeros')
      return false
    }

    if (pass != pass1) {
      alert('Las contraseñas no coinciden')
      return false
    }

    if (this.usuarios[nombre]) {
      alert('Este usuario ya existe. Inicia sesion abajo.')
      return false
    }

    this.usuarios[nombre] = {
      nombre,
      contrasena: pass,
      habitos: []
    }

    this.guardarStorage()
    this.usuarioActual = nombre
    localStorage.setItem('usuarioActivo', nombre)

    spanMensaje.innerText = `Bienvenido, ${nombre}!`
    spanMensaje.style.color = '#201435'
    spanMensaje.style.backgroundColor = 'pink'

    return true
  }

  iniciarSesion(): boolean {
  const nombreInput = document.getElementById('loginName') as HTMLInputElement
  const passInput = document.getElementById('loginPass') as HTMLInputElement
  const spanMensaje = document.getElementById('Mesage') as HTMLElement

    if (!nombreInput || !passInput || !spanMensaje) return false

    const nombre = nombreInput.value.trim()
    const pass = passInput.value

    if (!nombre || !pass) {
      alert('Por favor, complete los campos de inicio de sesion')
      return false
    }

    const usuario = this.usuarios[nombre]
    if (!usuario || usuario.contrasena != pass) {
      alert('Usuario o contraseña incorrectos')
      return false
    }

    this.usuarioActual = nombre
    localStorage.setItem('usuarioActivo', nombre)

    spanMensaje.innerText = `Bienvenido de nuevo, ${nombre}!`
    spanMensaje.style.color = '#201435'
    spanMensaje.style.backgroundColor = 'pink'

    return true
  }

  private obtenerHabitosActuales(): Habito[] {
    if (!this.usuarioActual) return []
    const usuario = this.usuarios[this.usuarioActual]
    if (!usuario) return []
    return usuario.habitos.map(h => ({
      ...h,
      diasMarcados: Array.isArray(h.diasMarcados) ? h.diasMarcados : []
    }))
  }

  private guardarHabitosActuales(habitos: Habito[]): void {
    if (!this.usuarioActual) return
    const usuario = this.usuarios[this.usuarioActual]
    if (!usuario) return
    usuario.habitos = habitos
    this.guardarStorage()
  }

agregarHabito(): void {
    const inputNombre = document.getElementById('campoNombreHabito') as HTMLInputElement
    const inputColor = document.getElementById('campoColorHabito') as HTMLInputElement
    const inputFrecuencia = document.getElementById('campoFrecuencia') as HTMLSelectElement

    if (!inputNombre || !inputColor || !inputFrecuencia) return

    const nombre = inputNombre.value.trim()
    const color = inputColor.value
    const frecuencia = inputFrecuencia.value

    if (nombre.length < 3 || nombre.length > 20) {
      alert('El habito debe tener entre 3 y 20 caracteres')
      return
    }

    if (!this.soloLetrasRegex.test(nombre)) {
      alert('El habito no puede contener numeros')
      return
    }

const habitosActuales = this.obtenerHabitosActuales()

const nuevoHabito: Habito = {
 id: Date.now(),
 nombre,
 color,
 frecuencia,
 racha: 0,
 ultimoCumplimiento: '',
 diasMarcados: []
    }

    habitosActuales.push(nuevoHabito)
    this.guardarHabitosActuales(habitosActuales)
    inputNombre.value = ''
    this.renderizarTodo()
  }

  public alternarEstado(id: number, fechaEspecifica?: string): void {
    const habitosActuales = this.obtenerHabitosActuales()
    const habito = habitosActuales.find(h => h.id == id)

    if (!habito) return

    if (!Array.isArray(habito.diasMarcados)) {
      habito.diasMarcados = []
    }

    const hoy = this.obtenerFechaLocal(0)
    const fechaObjetivo = fechaEspecifica || hoy
    const yaCumplioFecha = habito.diasMarcados.includes(fechaObjetivo)

    if (!yaCumplioFecha) {
      habito.diasMarcados.push(fechaObjetivo)
      habito.racha += 1
      if (fechaObjetivo == hoy) {
        habito.ultimoCumplimiento = hoy
      }
    } else {
      habito.diasMarcados = habito.diasMarcados.filter(d => d !== fechaObjetivo)
      habito.racha = Math.max(0, habito.racha - 1)
      if (fechaObjetivo == hoy) {
        habito.ultimoCumplimiento = ''
      }
    }

    this.guardarHabitosActuales(habitosActuales)
    this.renderizarTodo()
  }

  public eliminarHabito(id: number): void {
    let habitosActuales = this.obtenerHabitosActuales()
    habitosActuales = habitosActuales.filter(h => h.id !== id)
    this.guardarHabitosActuales(habitosActuales)
    this.renderizarTodo()
  }

  public renderizarTodo(): void {
    this.renderizarLista()
    this.renderizarProgresoHoy()
    this.renderizarCalendario()
    this.actualizarGraficos()
  }

  private renderizarLista(): void {
    const lista = document.getElementById('listaHabitos') as HTMLElement
    if (!lista) return
    lista.innerHTML = ''

    const habitosActuales = this.obtenerHabitosActuales()

    if (habitosActuales.length == 0) {
      lista.innerHTML = '<p style="color: #888; text-align: center;">No hay habitos registrados todavia.</p>'
      return
    }

    const hoy = this.obtenerFechaLocal(0)

    habitosActuales.forEach(h => {
      const completadoHoy = h.diasMarcados.includes(hoy) || h.ultimoCumplimiento == hoy

      const div = document.createElement('div')
      div.className = 'item-habito'
      div.style.borderLeftColor = h.color

      const infoDiv = document.createElement('div')
      const strongNombre = document.createElement('strong')
      strongNombre.textContent = h.nombre

      const spanDetalle = document.createElement('span')
      spanDetalle.style.fontSize = '12px'
      spanDetalle.style.color = '#666'
      spanDetalle.style.display = 'block'
      spanDetalle.textContent = `Frecuencia: ${h.frecuencia} | Racha: ${h.racha} dias`

      infoDiv.appendChild(strongNombre)
      infoDiv.appendChild(spanDetalle)

      const accionesDiv = document.createElement('div')
      accionesDiv.className = 'acciones-habito'

      const btnMarcar = document.createElement('button')
      btnMarcar.type = 'button'
      btnMarcar.className = `btn-completar ${completadoHoy ? 'completado' : ''}`
      btnMarcar.textContent = completadoHoy ? 'Completado' : 'Marcar'
      btnMarcar.addEventListener('click', () => {
        this.alternarEstado(h.id)
      })

      const btnEliminar = document.createElement('button')
      btnEliminar.type = 'button'
      btnEliminar.className = 'btn-eliminar'
      btnEliminar.textContent = 'Eliminar'
      btnEliminar.addEventListener('click', () => {
        this.eliminarHabito(h.id)
      })

      accionesDiv.appendChild(btnMarcar)
      accionesDiv.appendChild(btnEliminar)

      div.appendChild(infoDiv)
      div.appendChild(accionesDiv)

      lista.appendChild(div)
    })
  }
  private renderizarProgresoHoy(): void {
    const hoy = this.obtenerFechaLocal(0)
    const habitosActuales = this.obtenerHabitosActuales()
    const total = habitosActuales.length
    const completadosHoy = habitosActuales.filter(h => h.diasMarcados.includes(hoy) || h.ultimoCumplimiento == hoy).length

    const porcentaje = total > 0 ? Math.round((completadosHoy / total) * 100) : 0

    const texto = document.getElementById('textoProgreso')
    const barra = document.getElementById('barraProgreso')

    if (texto && barra) {
      texto.innerText = `Completados hoy: ${completadosHoy} de ${total} (${porcentaje}%)`
      barra.style.width = `${porcentaje}%`
    }
  }

  private renderizarCalendario(): void {
    const contenedor = document.getElementById('calendarioContainer') as HTMLElement
    if (!contenedor) return
    contenedor.innerHTML = ''

    const habitosActuales = this.obtenerHabitosActuales()
    const hoy = new Date()

    for (let i = 13; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(hoy.getDate() - i)
      const formatoFecha = this.obtenerFechaLocal(i)
      const nombreDia = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })

      const divDia = document.createElement('div')
      divDia.className = 'dia-calendario'
      divDia.innerText = nombreDia

      const cumplidoAlgunaVez = habitosActuales.some(h => h.diasMarcados.includes(formatoFecha))
      if (cumplidoAlgunaVez) {
        divDia.classList.add('marcado')
      }

      divDia.style.cursor = 'pointer'
      divDia.title = `Clic para editar el ${formatoFecha}`
      divDia.addEventListener('click', () => {
        this.gestionarDiaCalendario(formatoFecha)
      })

      contenedor.appendChild(divDia)
    }
  }

  private gestionarDiaCalendario(fecha: string): void {
    const habitosActuales = this.obtenerHabitosActuales()
    if (habitosActuales.length == 0) {
      alert('No tienes habitos creados para marcar en esta fecha.')
      return
    }

    const nombresHabitos = habitosActuales
      .map((h, index) => `${index + 1}. ${h.nombre} (${h.diasMarcados.includes(fecha) ? 'Cumplido' : 'Pendiente'})`)
      .join('\n')

    const seleccion = prompt(`Fecha: ${fecha}\nEscribe el numero del habito para marcar o desmarcar:\n\n${nombresHabitos}`)

    if (seleccion == null) return

    const index = parseInt(seleccion.trim(), 10) - 1
    if (!isNaN(index) && index >= 0 && index < habitosActuales.length) {
      const habitoSeleccionado = habitosActuales[index]
      if (habitoSeleccionado) {
        this.alternarEstado(habitoSeleccionado.id, fecha)
      }
    } else {
      alert('Seleccion invalida.')
    }
  }

  private actualizarGraficos(): void {
    const hoy = this.obtenerFechaLocal(0)
    const habitosActuales = this.obtenerHabitosActuales()
    const completadosHoy = habitosActuales.filter(h => h.diasMarcados.includes(hoy) || h.ultimoCumplimiento == hoy).length
    const pendientesHoy = habitosActuales.length - completadosHoy

    const canvasRachas = document.getElementById('graficoRachas') as HTMLCanvasElement
    if (canvasRachas) {
      if (this.graficoRachas) this.graficoRachas.destroy()

      this.graficoRachas = new Chart(canvasRachas, {
        type: 'bar',
        data: {
          labels: habitosActuales.map(h => h.nombre),
          datasets: [{
            label: 'Dias de Racha',
            data: habitosActuales.map(h => h.racha),
            backgroundColor: habitosActuales.map(h => h.color),
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
      })
    }

    const canvasCumplimiento = document.getElementById('graficoCumplimientoHoy') as HTMLCanvasElement
    if (canvasCumplimiento) {
      if (this.graficoCumplimiento) this.graficoCumplimiento.destroy()

      this.graficoCumplimiento = new Chart(canvasCumplimiento, {
        type: 'doughnut',
        data: {
          labels: ['Completados', 'Pendientes'],
          datasets: [{
            data: [completadosHoy, pendientesHoy],
            backgroundColor: ['#2ecc71', '#e0e0e0']
          }]
        },
        options: {
          responsive: true
        }
      })
    }
  }

  public verificarSesionActiva(): boolean {
    const usuarioGuardado = localStorage.getItem('usuarioActivo')
    if (usuarioGuardado && this.usuarios[usuarioGuardado]) {
      this.usuarioActual = usuarioGuardado
      return true
    }
    return false
  }
}

const app = new HabitosApp()

window.addEventListener('DOMContentLoaded', () => {
  const contenedorAuth = document.getElementById('contenedorAuth')
  const seccionLogin = document.getElementById('seccionLogin')
  const seccionRegistro = document.getElementById('seccionRegistro')
  const panelHabitos = document.getElementById('panelHabitos')

  const btnIrRegistro = document.getElementById('btnIrRegistro')
  const btnIrLogin = document.getElementById('btnIrLogin')
  const btnValidar = document.getElementById('validar')
  const btnLogin = document.getElementById('btnLogin')
  const btnAgregar = document.getElementById('btnAgregarHabito')
  const btnCerrarSesion = document.getElementById('btnCerrarSesion')

  if (app.verificarSesionActiva() && contenedorAuth && panelHabitos) {
    contenedorAuth.style.display = 'none'
    panelHabitos.style.display = 'block'
    app.renderizarTodo()
  }

  btnIrRegistro?.addEventListener('click', () => {
    if (seccionLogin && seccionRegistro) {
      seccionLogin.style.display = 'none'
      seccionRegistro.style.display = 'block'
    }
  })

  btnIrLogin?.addEventListener('click', () => {
    if (seccionLogin && seccionRegistro) {
      seccionRegistro.style.display = 'none'
      seccionLogin.style.display = 'block'
    }
  })

  btnValidar?.addEventListener('click', () => {
    if (app.registrarUsuario()) {
      setTimeout(() => {
        if (contenedorAuth && panelHabitos) {
          contenedorAuth.style.display = 'none'
          panelHabitos.style.display = 'block'
          app.renderizarTodo()
        }
      }, 800)
    }
  })

  btnLogin?.addEventListener('click', () => {
    if (app.iniciarSesion()) {
      setTimeout(() => {
        if (contenedorAuth && panelHabitos) {
          contenedorAuth.style.display = 'none'
          panelHabitos.style.display = 'block'
          app.renderizarTodo()
        }
      }, 800)
    }
  })

  btnAgregar?.addEventListener('click', () => {
    app.agregarHabito()
  })

  btnCerrarSesion?.addEventListener('click', () => {
    localStorage.removeItem('usuarioActivo')
    location.reload()
  })
})