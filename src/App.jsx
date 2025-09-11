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
import { collection, addDoc, query, where, doc, getDoc, onSnapshot, getDocs } from 'firebase/firestore'
import { FaCalendarAlt, FaClipboardList, FaSignOutAlt, FaUser, FaCog, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import huluxBackground from './assets/huluxfondo.jpeg'
import emailjs from '@emailjs/browser'
import { EMAIL_CONFIG } from './config/emailConfig'

function App() {
  // Inicializar EmailJS
  useEffect(() => {
    // Inicializar EmailJS con la clave pública
    emailjs.init(EMAIL_CONFIG.PUBLIC_KEY)
  }, [])

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
  const [categoriaPersonalizada, setCategoriaPersonalizada] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [reservas, setReservas] = useState([]) // Reservas del día seleccionado
  const [reservaGuardandose, setReservaGuardandose] = useState(null) // Para manejar el estado optimista

  // Aplica el fondo de Hulux globalmente en toda la aplicación usando JavaScript
  useEffect(() => {
    // Aplicar la imagen de fondo directamente con JavaScript
    document.body.style.backgroundImage = `url(${huluxBackground})`
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundPosition = 'center center'
    document.body.style.backgroundRepeat = 'no-repeat'
    document.body.style.backgroundAttachment = 'fixed'
    document.body.style.minHeight = '100vh'
    
    // Aplicar overlay para mejorar legibilidad
    const overlay = document.createElement('div')
    overlay.id = 'hulux-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(17, 41, 62, 0.15);
      z-index: -1;
      pointer-events: none;
    `
    
    // Solo agregar el overlay si no existe
    if (!document.getElementById('hulux-overlay')) {
      document.body.appendChild(overlay)
    }
    
    return () => {
      // Limpiar estilos y overlay al desmontar
      document.body.style.backgroundImage = ''
      document.body.style.backgroundSize = ''
      document.body.style.backgroundPosition = ''
      document.body.style.backgroundRepeat = ''
      document.body.style.backgroundAttachment = ''
      
      const existingOverlay = document.getElementById('hulux-overlay')
      if (existingOverlay) {
        existingOverlay.remove()
      }
    }
  }, [])

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
      
      // Limpiar el estado de reserva guardándose cuando se actualicen las reservas
      setReservaGuardandose(null)
    }, (error) => {
      console.error('Error al cargar reservas en tiempo real:', error)
    })

    return () => unsubscribe()
  }, [selectedDate])

  // Limpiar estado de reserva guardándose cuando cambie la fecha
  useEffect(() => {
    setReservaGuardandose(null)
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

  // Función para enviar correo de confirmación
  const enviarCorreoConfirmacion = async (datosReserva) => {
    try {
      // Verificar que EmailJS esté configurado
      if (!EMAIL_CONFIG.SERVICE_ID || EMAIL_CONFIG.SERVICE_ID === 'your_service_id' ||
          !EMAIL_CONFIG.TEMPLATE_ID || EMAIL_CONFIG.TEMPLATE_ID === 'your_template_id' ||
          !EMAIL_CONFIG.PUBLIC_KEY || EMAIL_CONFIG.PUBLIC_KEY === 'your_public_key') {
        console.warn('EmailJS no está completamente configurado. Saltando envío de email.');
        return false;
      }

      const templateParams = {
        to_email: EMAIL_CONFIG.TO_EMAIL,
        from_name: 'Sistema de Reservas Hulux',
        usuario_nombre: datosReserva.usuarioEmail,
        reserva_nombre: datosReserva.nombre,
        reserva_categoria: datosReserva.categoria,
        reserva_fecha: datosReserva.fechaFormateada,
        reserva_hora_inicio: datosReserva.horaInicio,
        reserva_hora_fin: datosReserva.horaFin,
        reserva_duracion: calcularDuracion(datosReserva.horaInicio, datosReserva.horaFin),
        reserva_materiales: datosReserva.materiales.join(', '),
        mensaje_completo: `
Nueva Reserva de Sala - Sistema Hulux

📋 DETALLES DE LA RESERVA:
• Solicitante: ${datosReserva.usuarioEmail}
• Nombre/Evento: ${datosReserva.nombre}
• Categoría: ${datosReserva.categoria}
• Fecha: ${datosReserva.fechaFormateada}
• Horario: ${datosReserva.horaInicio} - ${datosReserva.horaFin}
• Duración: ${calcularDuracion(datosReserva.horaInicio, datosReserva.horaFin)}
• Materiales: ${datosReserva.materiales.join(', ')}

Sistema de Reservas Hulux
        `
      };

      const result = await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAIL_CONFIG.PUBLIC_KEY
      );

      console.log('Correo enviado exitosamente:', result);
      return true;
    } catch (error) {
      console.error('Error al enviar correo:', error);
      // No bloquear la aplicación si falla el email
      return false;
    }
  };

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
  const validarHorario = (horaInicio, horaFin, fechaReserva, reservaIdAIgnorar = null) => {
    const reservasDelDia = reservas.filter(r => 
      r.fecha === fechaReserva && 
      (reservaIdAIgnorar ? r.id !== reservaIdAIgnorar : true)
    )
    
    // Si hay una reserva guardándose, no la consideres como conflicto
    if (reservaGuardandose && 
        reservaGuardandose.fecha === fechaReserva &&
        reservaGuardandose.horaInicio === horaInicio &&
        reservaGuardandose.horaFin === horaFin) {
      // Esta es la reserva que se está guardando, no es conflicto
      return { valido: true, mensaje: '' }
    }
    
    for (const reserva of reservasDelDia) {
      const inicioExistente = reserva.horaInicio
      const finExistente = reserva.horaFin
      
      // Verificar solapamiento de horarios - Lógica mejorada
      const inicioNuevo = horaInicio
      const finNuevo = horaFin
      
      // Hay conflicto si:
      // 1. La nueva reserva empieza antes de que termine una existente Y termina después de que empiece la existente
      const hayConflicto = (
        (inicioNuevo < finExistente && finNuevo > inicioExistente)
      )
      
      if (hayConflicto) {
        return {
          valido: false,
          mensaje: `Conflicto de horario con la reserva de "${reserva.nombre}" (${reserva.horaInicio}-${reserva.horaFin})`
        }
      }
    }

    return { valido: true, mensaje: '' }
  }

  // Validar que todos los campos obligatorios estén llenos
  const validarFormulario = () => {
    const camposObligatorios = {
      nombre: 'Nombre',
      categoria: 'Categoría',
      horaInicio: 'Hora de inicio',
      horaFin: 'Hora de fin'
    }

    for (const [campo, etiqueta] of Object.entries(camposObligatorios)) {
      if (!formData[campo] || formData[campo].trim() === '') {
        return {
          valido: false,
          mensaje: `El campo "${etiqueta}" es obligatorio`
        }
      }
    }

    // Validar categoría personalizada cuando se selecciona "Otro"
    if (formData.categoria === 'Otro' && (!categoriaPersonalizada || categoriaPersonalizada.trim() === '')) {
      return {
        valido: false,
        mensaje: 'Debe especificar la categoría personalizada'
      }
    }

    // Validar que se haya seleccionado al menos un material adicional
    if (!formData.materiales || formData.materiales.length === 0) {
      return {
        valido: false,
        mensaje: 'Debe seleccionar al menos un material adicional'
      }
    }

    return { valido: true, mensaje: '' }
  }

  // Verificar si el formulario está completo para habilitar/deshabilitar el botón
  const formularioCompleto = () => {
    const camposBasicosCompletos = formData.nombre.trim() !== '' &&
                                   formData.categoria !== '' &&
                                   formData.horaInicio !== '' &&
                                   formData.horaFin !== '' &&
                                   formData.materiales.length > 0;
    
    // Si se selecciona "Otro", también debe completar la categoría personalizada
    if (formData.categoria === 'Otro') {
      return camposBasicosCompletos && categoriaPersonalizada.trim() !== '';
    }
    
    return camposBasicosCompletos;
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
      
      // Limpiar categoría personalizada si se cambia de "Otro" a otra opción
      if (name === 'categoria' && value !== 'Otro') {
        setCategoriaPersonalizada('')
      }
    }
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const resultadoValidacion = validarFormulario()
    if (!resultadoValidacion.valido) {
      toast.error(resultadoValidacion.mensaje, {
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

    // Validar conflictos de horario con datos actuales
    const fechaReserva = selectedDate.toDateString()
    
    // Hacer una consulta fresca a la base de datos para asegurar datos actualizados
    try {
      const q = query(
        collection(db, 'reservas'),
        where('fecha', '==', fechaReserva)
      )
      
      // Obtener reservas más recientes para validación final
      const querySnapshot = await getDocs(q)
      const reservasActuales = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Validar contra las reservas más actuales
      for (const reserva of reservasActuales) {
        const inicioExistente = reserva.horaInicio
        const finExistente = reserva.horaFin
        const inicioNuevo = formData.horaInicio
        const finNuevo = formData.horaFin
        
        if (inicioNuevo < finExistente && finNuevo > inicioExistente) {
          toast.error(`Conflicto de horario con la reserva de "${reserva.nombre}" (${reserva.horaInicio}-${reserva.horaFin})`, {
            position: "top-right",
            autoClose: 3000
          })
          return
        }
      }

      const categoriaFinal = formData.categoria === 'Otro' ? categoriaPersonalizada : formData.categoria;
      
      // Marcar que se está guardando esta reserva
      const nuevaReserva = {
        nombre: formData.nombre,
        categoria: categoriaFinal,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        materiales: formData.materiales,
        fecha: fechaReserva,
        fechaCreacion: new Date(),
        usuarioId: user.uid,
        usuarioEmail: user.email
      }
      
      setReservaGuardandose(nuevaReserva)
      
      await addDoc(collection(db, 'reservas'), nuevaReserva)

      // Enviar correo de confirmación
      const datosCorreo = {
        usuarioEmail: user.email,
        nombre: formData.nombre,
        categoria: categoriaFinal,
        fechaFormateada: selectedDate.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        materiales: formData.materiales
      };

      // Intentar enviar el correo (no bloquear si falla)
      const correoEnviado = await enviarCorreoConfirmacion(datosCorreo);
      if (correoEnviado) {
        console.log('Correo de confirmación enviado exitosamente');
      } else {
        console.log('No se pudo enviar el correo de confirmación');
      }

      toast.success(
        `¡Reserva confirmada! ${formData.nombre} - ${categoriaFinal} el ${selectedDate.toLocaleDateString('es-ES')} de ${formData.horaInicio} a ${formData.horaFin}`,
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
          "📋 IMPORTANTE: Solicita las llaves y el material a ocupar en el área de administración",
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
      setCategoriaPersonalizada('')
      
      // Limpiar el estado de reserva guardándose después de un breve delay
      setTimeout(() => {
        setReservaGuardandose(null)
      }, 2000)
      
      // Las reservas se actualizarán automáticamente por onSnapshot
      
    } catch (error) {
      console.error('Error al guardar reserva:', error)
      // Limpiar estado en caso de error también
      setReservaGuardandose(null)
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
          {/* Título principal con logo */}
          <div className="title-section">
            <div className="title-with-logo">
              <img 
                src="/logo-hulux.png" 
                alt="Logo Hulux" 
                className="app-logo"
              />
              <div className="title-content">
                <h1 className="title-main">
                  <FaCalendarAlt className="title-icon" />
                  Sistema de Reserva de Salas
                </h1>
                <p className="title-subtitle">Reserva tu sala de reuniones de manera rápida y eficiente</p>
              </div>
            </div>
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
        <div className="row g-2 g-lg-3 flex-grow-1 align-items-stretch flex-column-reverse flex-lg-row mx-0">
          {/* Columna Formulario - Responsiva */}
          <div className="col-12 col-lg-4 col-xl-3 d-flex flex-column mb-3 mb-lg-0" style={{minHeight:'0'}}>
            <div className="card shadow-sm flex-grow-1">
              <div className="card-header bg-white border-0 pb-2 pb-lg-0">
                <h5 className="card-title text-center fw-semibold fs-6 fs-lg-5">
                  <FaClipboardList className="me-2 text-success" />
                  Datos de Reserva
                </h5>
              </div>
              <div className="card-body overflow-auto pt-2 pt-lg-3 d-flex flex-column px-2 px-lg-3" style={{minHeight:'0'}}>
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-2 gap-lg-3">
                  <div>
                    <label className="form-label fw-semibold small">Nombre*</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="form-control form-control-sm form-control-lg-normal"
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
                      className="form-select form-select-sm form-select-lg-normal"
                      required
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Reunión de equipo">Reunión de equipo</option>
                      <option value="Presentación cliente">Presentación cliente</option>
                      <option value="Entrevista">Entrevista</option>
                      <option value="Capacitación">Capacitación</option>
                      <option value="Otro">Otro</option>
                    </select>
                    
                    {/* Campo para categoría personalizada cuando se selecciona "Otro" */}
                    {formData.categoria === 'Otro' && (
                      <div className="mt-2">
                        <label className="form-label fw-semibold small">Especifica la categoría*</label>
                        <input
                          type="text"
                          name="categoriaPersonalizada"
                          value={categoriaPersonalizada}
                          onChange={(e) => setCategoriaPersonalizada(e.target.value)}
                          className="form-control"
                          placeholder="Escribe la categoría personalizada..."
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Selección de horarios mejorada */}
                  <div className="mb-3">
                    <label className="form-label fw-bold mb-2 mb-lg-3" style={{color: 'var(--hulux-azul-oscuro)'}}>
                      <FaClock className="me-2" style={{color: 'var(--hulux-naranja)'}} />
                      Horario de la reserva*
                    </label>
                    
                    <div className="row g-2 g-lg-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold small">Hora inicio</label>
                        <select
                          name="horaInicio"
                          value={formData.horaInicio}
                          onChange={handleHoraInicioChange}
                          className="form-select form-select-lg"
                          style={{
                            fontSize: window.innerWidth <= 576 ? '0.9rem' : '1.1rem',
                            padding: window.innerWidth <= 576 ? '0.5rem 0.75rem' : '0.75rem 1rem',
                            minHeight: window.innerWidth <= 576 ? '42px' : '50px'
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
                                fontSize: window.innerWidth <= 576 ? '0.9rem' : '1.1rem',
                                padding: '8px',
                                backgroundColor: esHorarioDisponible(hora) ? '' : 'rgba(220, 53, 69, 0.1)',
                                color: esHorarioDisponible(hora) ? 'var(--hulux-azul-oscuro)' : '#dc3545'
                              }}
                            >
                              {hora} {!esHorarioDisponible(hora) ? '(Ocupado)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-6">
                        <label className="form-label fw-semibold small">Hora fin</label>
                        <select
                          name="horaFin"
                          value={formData.horaFin}
                          onChange={handleInputChange}
                          className="form-select form-select-lg"
                          style={{
                            fontSize: window.innerWidth <= 576 ? '0.9rem' : '1.1rem',
                            padding: window.innerWidth <= 576 ? '0.5rem 0.75rem' : '0.75rem 1rem',
                            minHeight: window.innerWidth <= 576 ? '42px' : '50px'
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
                    <div className="mb-2 mb-lg-3">
                      <label className="form-label fw-semibold text-muted mb-2 small">
                        ⚡ Duración rápida:
                      </label>
                      <div className="d-flex gap-1 gap-lg-2 flex-wrap">
                        {['30min', '1h', '1h 30min', '2h', '3h'].map(duracion => {
                          const horaFin = calcularHoraFin(formData.horaInicio, duracion)
                          const disponible = horaFin && horaFin <= '22:30'
                          return (
                            <button
                              key={duracion}
                              type="button"
                              className={`btn btn-sm ${formData.horaFin === horaFin ? 'btn-primary' : 'btn-outline-primary'}`}
                              style={{
                                fontSize: window.innerWidth <= 576 ? '0.75rem' : '0.95rem',
                                padding: window.innerWidth <= 576 ? '6px 12px' : '8px 16px',
                                minWidth: window.innerWidth <= 576 ? '65px' : '80px',
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
                    <label className="form-label fw-semibold small">
                      Materiales adicionales <span className="text-danger">*</span>
                    </label>
                    <small className="text-muted d-block mb-2">Selecciona al menos un material</small>
                    <div className="d-flex flex-column gap-1">
                      {['Proyector', 'Pizarra', 'Sistema de audio', 'HDMI', 'No requiero material'].map(material => (
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
                    disabled={!formularioCompleto()}
                    style={{
                      backgroundColor: formularioCompleto() ? 'var(--hulux-naranja)' : '#cccccc',
                      borderColor: formularioCompleto() ? 'var(--hulux-naranja)' : '#cccccc',
                      fontSize: '1.1rem',
                      padding: '12px 24px',
                      minHeight: '50px',
                      borderRadius: '8px',
                      cursor: formularioCompleto() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <FaCalendarAlt className="me-2" />
                    Confirmar Reserva
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Columna Calendario - Responsiva */}
          <div className="col-12 col-lg-8 col-xl-9 d-flex flex-column" style={{minHeight:'0'}}>
            <div className="card shadow-sm flex-grow-1 d-flex flex-column">
              <div className="card-header bg-white border-0 pb-1 pb-lg-0">
                <h5 className="card-title text-center fw-semibold fs-6 fs-lg-5">
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
              <div className="card-body d-flex flex-column justify-content-center p-2 p-lg-4" style={{minHeight: window.innerWidth <= 576 ? '350px' : '500px'}}>
                <div className="d-flex justify-content-center flex-grow-1 align-items-center">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    locale="es-ES"
                    className="react-calendar-custom w-100"
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
                        <strong>Importante:</strong> Asegúrese de elegir un horario no reservado.
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
