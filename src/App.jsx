import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './App.css'
import './components/Header.css'
import Login from './components/Login'
import Register from './components/Register'
import AdminPanel from './components/AdminPanel'
import MisReservas from './components/MisReservas'
import { auth, db } from './firebase/config'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, addDoc, query, where, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { FaCalendarAlt, FaClipboardList, FaSignOutAlt, FaUser, FaCog, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [currentView, setCurrentView] = useState('login') // 'login', 'register', 'dashboard'
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('usuario') // 'usuario' o 'admin'
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [vistaActual, setVistaActual] = useState('calendario') // 'calendario', 'admin', 'misReservas'
  
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    horaInicio: '',
    horaFin: '',
    materiales: []
  })
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [reservas, setReservas] = useState([]) // Reservas del día seleccionado

  // Aplica el tema oceano
  useEffect(() => {
    document.body.classList.add('theme-ocean')
    return () => document.body.classList.remove('theme-ocean')
  }, [])

  // Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid))
          const userData = userDoc.data()
          const rol = userData?.rol || 'usuario'
          
          setUser({
            email: user.email,
            uid: user.uid,
            displayName: user.displayName
          })
          setUserRole(rol)
          setCurrentView('dashboard')
        } catch (error) {
          console.error('Error al obtener rol de usuario:', error)
          setUser({
            email: user.email,
            uid: user.uid,
            displayName: user.displayName
          })
          setUserRole('usuario')
          setCurrentView('dashboard')
        }
      } else {
        setUser(null)
        setUserRole('usuario')
        setCurrentView('login')
      }
      setIsAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Cargar reservas del día seleccionado en tiempo real
  useEffect(() => {
    if (!selectedDate) return
    
    const fechaSeleccionada = selectedDate.toDateString()
    const q = query(
      collection(db, 'reservas'),
      where('fecha', '==', fechaSeleccionada)
    )
    
    // Usar onSnapshot para actualizaciones en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reservasDelDia = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Ordenar por hora de inicio
      reservasDelDia.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
      setReservas(reservasDelDia)
    }, (error) => {
      console.error('Error al cargar reservas en tiempo real:', error)
    })

    return () => unsubscribe()
  }, [selectedDate])

  // Generar opciones de horarios (cada 30 minutos de 8:00 a 22:00)
  const generarOpcionesHorario = () => {
    const opciones = []
    for (let hora = 8; hora <= 22; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = hora.toString().padStart(2, '0')
        const minutoStr = minuto.toString().padStart(2, '0')
        const tiempo = `${horaStr}:${minutoStr}`
        opciones.push(tiempo)
      }
    }
    return opciones
  }

  // Verificar si un horario está disponible
  const esHorarioDisponible = (hora) => {
    const fechaReserva = selectedDate.toDateString()
    return !reservas.some(reserva => {
      return reserva.fecha === fechaReserva && 
             hora >= reserva.horaInicio && 
             hora < reserva.horaFin
    })
  }

  // Sugerir duración automática cuando se selecciona hora inicio
  const handleHoraInicioChange = (e) => {
    const nuevaHoraInicio = e.target.value
    setFormData(prev => ({ 
      ...prev, 
      horaInicio: nuevaHoraInicio,
      // Sugerir automáticamente 1 hora de duración si no hay hora fin
      horaFin: prev.horaFin || sugerirHoraFin(nuevaHoraInicio)
    }))
  }

  const sugerirHoraFin = (horaInicio) => {
    if (!horaInicio) return ''
    const [hora, minuto] = horaInicio.split(':').map(Number)
    const nuevaHora = hora + 1
    if (nuevaHora > 22) return '22:30' // Límite del día
    return `${nuevaHora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
  }

  // Calcular hora fin basada en duración
  const calcularHoraFin = (horaInicio, duracion) => {
    if (!horaInicio) return ''
    const [hora, minuto] = horaInicio.split(':').map(Number)
    let minutosAgregar = 0
    
    switch(duracion) {
      case '30min': minutosAgregar = 30; break
      case '1h': minutosAgregar = 60; break
      case '1h 30min': minutosAgregar = 90; break
      case '2h': minutosAgregar = 120; break
      case '3h': minutosAgregar = 180; break
      default: minutosAgregar = 60
    }
    
    const totalMinutos = hora * 60 + minuto + minutosAgregar
    const nuevaHora = Math.floor(totalMinutos / 60)
    const nuevoMinuto = totalMinutos % 60
    
    if (nuevaHora > 22 || (nuevaHora === 22 && nuevoMinuto > 30)) {
      return '22:30' // Límite del día
    }
    
    return `${nuevaHora.toString().padStart(2, '0')}:${nuevoMinuto.toString().padStart(2, '0')}`
  }

  // Calcular duración entre dos horas
  const calcularDuracion = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return ''
    const [horaI, minI] = horaInicio.split(':').map(Number)
    const [horaF, minF] = horaFin.split(':').map(Number)
    
    const minutosInicio = horaI * 60 + minI
    const minutosFin = horaF * 60 + minF
    const duracionMinutos = minutosFin - minutosInicio
    
    const horas = Math.floor(duracionMinutos / 60)
    const minutos = duracionMinutos % 60
    
    if (horas === 0) return `${minutos} min`
    if (minutos === 0) return `${horas} h`
    return `${horas} h ${minutos} min`
  }

  // Validar conflictos de horario
  const validarHorario = (horaInicio, horaFin, fechaReserva) => {
    const reservasDelDia = reservas.filter(r => r.fecha === fechaReserva)
    
    for (const reserva of reservasDelDia) {
      const inicioExistente = reserva.horaInicio
      const finExistente = reserva.horaFin
      
      // Verificar solapamiento de horarios
      if (
        (horaInicio >= inicioExistente && horaInicio < finExistente) ||
        (horaFin > inicioExistente && horaFin <= finExistente) ||
        (horaInicio <= inicioExistente && horaFin >= finExistente)
      ) {
        return {
          valido: false,
          mensaje: `Conflicto de horario con la reserva de "${reserva.nombre}" (${reserva.horaInicio}-${reserva.horaFin})`
        }
      }
    }

    return { valido: true, mensaje: '' }
  }

  // Manejar cambios en formulario
  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const materiales = formData.materiales.includes(value)
        ? formData.materiales.filter(m => m !== value)
        : [...formData.materiales, value]
      setFormData(prev => ({ ...prev, materiales }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.categoria || !formData.horaInicio || !formData.horaFin) {
      toast.error('Por favor, completa todos los campos obligatorios', {
        position: "top-right",
        autoClose: 3000
      })
      return
    }

    if (formData.horaInicio >= formData.horaFin) {
      toast.error('La hora de fin debe ser posterior a la hora de inicio', {
        position: "top-right",
        autoClose: 3000
      })
      return
    }

    // Validar conflictos de horario
    const fechaReserva = selectedDate.toDateString()
    const validacion = validarHorario(formData.horaInicio, formData.horaFin, fechaReserva)
    
    if (!validacion.valido) {
      toast.error(validacion.mensaje, {
        position: "top-right",
        autoClose: 3000
      })
      return
    }

    try {
      await addDoc(collection(db, 'reservas'), {
        nombre: formData.nombre,
        categoria: formData.categoria,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        materiales: formData.materiales,
        fecha: fechaReserva,
        fechaCreacion: new Date(),
        usuarioId: user.uid,
        usuarioEmail: user.email
      })

      toast.success(
        `¡Reserva confirmada! ${formData.nombre} - ${formData.categoria} el ${selectedDate.toLocaleDateString('es-ES')} de ${formData.horaInicio} a ${formData.horaFin}`,
        {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        }
      )

      // Mostrar mensaje adicional con instrucciones importantes
      setTimeout(() => {
        toast.info(
          "📋 IMPORTANTE: Pasar con administración por las llaves y el material 5 minutos antes de la hora de inicio",
          {
            position: "top-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: {
              fontSize: '14px',
              fontWeight: '600'
            }
          }
        )
      }, 1500)
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        categoria: '',
        horaInicio: '',
        horaFin: '',
        materiales: []
      })
      
      // Las reservas se actualizarán automáticamente por onSnapshot
      
    } catch (error) {
      console.error('Error al guardar reserva:', error)
      toast.error('Error al crear la reserva. Intenta nuevamente.', {
        position: "top-right",
        autoClose: 3000
      })
    }
  }

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth)
      setCurrentView('login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // Renderizado condicional por vista
  if (isAuthLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (currentView === 'login') {
    return (
      <div className="d-flex flex-column min-vh-100 bg-transparent">
        <Login 
          switchToRegister={() => setCurrentView('register')} 
        />
      </div>
    )
  }

  if (currentView === 'register') {
    return (
      <div className="d-flex flex-column min-vh-100 bg-transparent">
        <Register 
          switchToLogin={() => setCurrentView('login')}
          onRegister={() => setCurrentView('dashboard')}
        />
      </div>
    )
  }

  if (currentView === 'dashboard') {
    // Mostrar navegación entre vistas
    if (vistaActual === 'admin' && userRole === 'admin') {
      return <AdminPanel user={user} onVolver={() => setVistaActual('calendario')} />
    }
    
    if (vistaActual === 'misReservas') {
      return <MisReservas user={user} onVolver={() => setVistaActual('calendario')} />
    }
    
    // Vista principal del calendario (por defecto)
    return (
      <div className="container-fluid p-4 d-flex flex-column app-container">
        {/* Header con navegación */}
        <div className="header-container">
          {/* Título principal */}
          <div className="title-section">
            <h1 className="title-main">
              <FaCalendarAlt className="title-icon" />
              Sistema de Reserva de Salas
            </h1>
            <p className="title-subtitle">Reserva tu sala de reuniones de manera rápida y eficiente</p>
          </div>
          
          {/* Navegación reorganizada: Usuario -> Navegación -> Cerrar sesión */}
          <div className="navigation-bar">
            {/* Información del usuario - Al principio */}
            <div className="user-info-container">
              <span className="user-badge">
                <FaUser className="user-icon" />
                <span className="user-name">{user.displayName || user.email}</span>
              </span>
            </div>
            
            {/* Navegación principal centrada */}
            <div className="nav-buttons-container">
              <div className="btn-group nav-button-group" role="group" aria-label="Navegación principal">
                <button
                  className={`btn nav-button nav-button-calendario ${vistaActual === 'calendario' ? 'active' : ''}`}
                  onClick={() => setVistaActual('calendario')}
                >
                  <FaCalendarAlt className="nav-button-icon" />
                  Calendario
                </button>
                
                <button
                  className={`btn nav-button nav-button-reservas ${vistaActual === 'misReservas' ? 'active' : ''} ${userRole !== 'admin' ? 'no-admin' : ''}`}
                  onClick={() => setVistaActual('misReservas')}
                >
                  <FaClipboardList className="nav-button-icon" />
                  Mis Reservas
                </button>
                
                {userRole === 'admin' && (
                  <button
                    className={`btn nav-button nav-button-admin ${vistaActual === 'admin' ? 'active' : ''}`}
                    onClick={() => setVistaActual('admin')}
                  >
                    <FaCog className="nav-button-icon" />
                    Panel Admin
                  </button>
                )}
              </div>
            </div>
            
            {/* Botón Cerrar sesión - Al final */}
            <div className="logout-container">
              <button 
                className="btn logout-button" 
                onClick={handleLogout}
              >
                <FaSignOutAlt className="logout-icon" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal - Calendario y Formulario */}
        <div className="row g-3 flex-grow-1 align-items-stretch flex-column-reverse flex-lg-row mx-0">
          {/* Columna Formulario (1/3) */}
          <div className="col-12 col-lg-4 col-xl-3 d-flex flex-column" style={{minHeight:'0'}}>
            <div className="card shadow-sm flex-grow-1">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="card-title text-center fw-semibold">
                  <FaClipboardList className="me-2 text-success" />
                  Datos de Reserva
                </h5>
              </div>
              <div className="card-body overflow-auto pt-3 d-flex flex-column" style={{minHeight:'0'}}>
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                  <div>
                    <label className="form-label fw-semibold small">Nombre*</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Ej. Quien lo solicita"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label fw-semibold small">Categoría*</label>
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Reunión de equipo">Reunión de equipo</option>
                      <option value="Presentación cliente">Presentación cliente</option>
                      <option value="Entrevista">Entrevista</option>
                      <option value="Capacitación">Capacitación</option>
                      <option value="Videoconferencia">Videoconferencia</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  {/* Selección de horarios mejorada */}
                  <div className="mb-3">
                    <label className="form-label fw-bold mb-3" style={{color: '#2C3E50'}}>
                      <FaClock className="me-2" style={{color: '#E67E22'}} />
                      Horario de la reserva*
                    </label>
                    
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold">Hora inicio</label>
                        <select
                          name="horaInicio"
                          value={formData.horaInicio}
                          onChange={handleHoraInicioChange}
                          className="form-select form-select-lg"
                          style={{
                            fontSize: '1.1rem',
                            padding: '0.75rem 1rem',
                            minHeight: '50px'
                          }}
                          required
                        >
                          <option value="">-- Seleccionar --</option>
                          {generarOpcionesHorario().map(hora => (
                            <option 
                              key={hora} 
                              value={hora}
                              disabled={!esHorarioDisponible(hora)}
                              style={{
                                fontSize: '1.1rem',
                                padding: '8px',
                                backgroundColor: esHorarioDisponible(hora) ? '' : '#ffe6e6',
                                color: esHorarioDisponible(hora) ? '' : '#dc3545'
                              }}
                            >
                              {hora} {!esHorarioDisponible(hora) ? '(Ocupado)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-6">
                        <label className="form-label fw-semibold">Hora fin</label>
                        <select
                          name="horaFin"
                          value={formData.horaFin}
                          onChange={handleInputChange}
                          className="form-select form-select-lg"
                          style={{
                            fontSize: '1.1rem',
                            padding: '0.75rem 1rem',
                            minHeight: '50px'
                          }}
                          required
                          disabled={!formData.horaInicio}
                        >
                          <option value="">-- Seleccionar --</option>
                          {generarOpcionesHorario()
                            .filter(hora => hora > formData.horaInicio)
                            .map(hora => (
                            <option 
                              key={hora} 
                              value={hora}
                              style={{
                                fontSize: '1.1rem',
                                padding: '8px'
                              }}
                            >
                              {hora}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Botones de duración rápida */}
                  {formData.horaInicio && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted mb-2">
                        ⚡ Duración rápida:
                      </label>
                      <div className="d-flex gap-2 flex-wrap">
                        {['30min', '1h', '1h 30min', '2h', '3h'].map(duracion => {
                          const horaFin = calcularHoraFin(formData.horaInicio, duracion)
                          const disponible = horaFin && horaFin <= '22:30'
                          return (
                            <button
                              key={duracion}
                              type="button"
                              className={`btn ${formData.horaFin === horaFin ? 'btn-primary' : 'btn-outline-primary'}`}
                              style={{
                                fontSize: '0.95rem',
                                padding: '8px 16px',
                                minWidth: '80px',
                                fontWeight: '600'
                              }}
                              disabled={!disponible}
                              onClick={() => setFormData(prev => ({...prev, horaFin}))}
                            >
                              {duracion}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Validación visual del horario */}
                  {formData.horaInicio && formData.horaFin && (
                    <div className="mb-3">
                      {validarHorario(formData.horaInicio, formData.horaFin, selectedDate.toDateString()).valido ? (
                        <div className="alert alert-success py-3 mb-0" style={{ fontSize: '1rem' }}>
                          <div className="d-flex align-items-center">
                            <span className="me-2" style={{ fontSize: '1.2em' }}>✅</span>
                            <div>
                              <strong>Horario disponible</strong><br />
                              <span className="text-success-emphasis">
                                {formData.horaInicio} - {formData.horaFin} 
                                <span className="badge bg-success-dark ms-2">
                                  {calcularDuracion(formData.horaInicio, formData.horaFin)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-danger py-3 mb-0" style={{ fontSize: '1rem' }}>
                          <div className="d-flex align-items-center">
                            <span className="me-2" style={{ fontSize: '1.2em' }}>❌</span>
                            <div>
                              <strong>Conflicto de horario</strong><br />
                              <span className="text-danger-emphasis">
                                {validarHorario(formData.horaInicio, formData.horaFin, selectedDate.toDateString()).mensaje}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="form-label fw-semibold small">Materiales adicionales</label>
                    <div className="d-flex flex-column gap-1">
                      {['Proyector', 'Pizarra', 'Sistema de audio', 'Videoconferencia'].map(material => (
                        <div key={material} className="form-check form-check-inline">
                          <input
                            type="checkbox"
                            name="materiales"
                            value={material}
                            checked={formData.materiales.includes(material)}
                            onChange={handleInputChange}
                            className="form-check-input"
                            id={material}
                          />
                          <label className="form-check-label small" htmlFor={material}>
                            {material}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn fw-bold mt-auto text-white"
                    style={{
                      backgroundColor: '#E67E22',
                      borderColor: '#E67E22',
                      fontSize: '1.1rem',
                      padding: '12px 24px',
                      minHeight: '50px',
                      borderRadius: '8px'
                    }}
                  >
                    <FaCalendarAlt className="me-2" />
                    Confirmar Reserva
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Columna Calendario (2/3) */}
          <div className="col-12 col-lg-8 col-xl-9 d-flex flex-column" style={{minHeight:'0'}}>
            <div className="card shadow-sm flex-grow-1 d-flex flex-column">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="card-title text-center fw-semibold">
                  <FaCalendarAlt className="me-2 text-primary" />
                  Calendario de Reservas
                </h5>
                <p className="text-center text-muted small mb-0">
                  {selectedDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="card-body d-flex flex-column justify-content-center" style={{minHeight:'0'}}>
                <div className="d-flex justify-content-center flex-grow-1 align-items-center">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    locale="es-ES"
                    className="react-calendar-custom"
                    tileClassName={({ date }) => {
                      const today = new Date()
                      const isToday = date.toDateString() === today.toDateString()
                      const isSelected = date.toDateString() === selectedDate.toDateString()
                      const hasReservations = reservas.some(r => r.fecha === date.toDateString())
                      
                      if (isSelected) return 'selected-tile'
                      if (isToday) return 'today-tile'
                      if (hasReservations) return 'reserved-tile'
                      if (date < today) return 'past-tile'
                      return 'future-tile'
                    }}
                  />
                </div>
                
                {/* Leyenda */}
                <div className="row g-2 small justify-content-center mt-3">
                  {[
                    {c:'bg-success',l:'Seleccionada'},
                    {c:'bg-danger',l:'Ocupada'},
                    {c:'bg-primary',l:'Hoy'},
                    {c:'bg-secondary',l:'Disponible'}
                  ].map(item => (
                    <div key={item.l} className="col-auto">
                      <div className="d-flex align-items-center border rounded-pill px-3 py-1 bg-light">
                        <span className={`d-inline-block rounded-circle me-2 ${item.c}`} style={{width:10,height:10}}></span>
                        <span className="text-muted fw-semibold">{item.l}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reservas del día seleccionado */}
                {reservas.length > 0 ? (
                  <div className="mt-3 border-top pt-3">
                    <h6 className="fw-semibold text-danger mb-2">
                      <FaClock className="me-2" />
                      Horarios ocupados ({reservas.length} reservas):
                    </h6>
                    <div className="row g-2">
                      {reservas.map(reserva => (
                        <div key={reserva.id} className="col-12 col-md-6">
                          <div className="card border-danger bg-light-subtle border-1 shadow-sm">
                            <div className="card-body p-2">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="fw-semibold text-danger mb-1">
                                    <FaClock className="me-1" />
                                    {reserva.horaInicio} - {reserva.horaFin}
                                  </div>
                                  <small className="text-muted">
                                    {reserva.categoria} • Sala ocupada
                                  </small>
                                </div>
                                <div className="text-end">
                                  <span className="badge bg-danger-dark">
                                    Ocupado
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="alert alert-warning mt-2 py-2">
                      <small>
                        <FaExclamationTriangle className="me-1" />
                        <strong>Importante:</strong> Asegúrate de elegir un horario que no se solape con las reservas existentes.
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 border-top pt-3">
                    <div className="alert alert-success py-2">
                      <small>
                        <FaCalendarAlt className="me-1" />
                        <strong>¡Día disponible!</strong> No hay reservas para esta fecha. Puedes elegir cualquier horario.
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenedor de notificaciones Toast */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    )
  }
}

export default App
