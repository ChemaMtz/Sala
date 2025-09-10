import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { FaCalendarAlt, FaTrash, FaClock, FaUser, FaBuilding, FaFilter, FaArrowLeft, FaCog, FaChartBar, FaExclamationTriangle } from 'react-icons/fa'
import { toast } from 'react-toastify'
import './Header.css'
import '../App.css'

function AdminPanel({ user, onVolver }) {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroUsuario, setFiltroUsuario] = useState('')

  useEffect(() => {
    // Consulta en tiempo real de todas las reservas
    const q = query(
      collection(db, 'reservas'),
      orderBy('fechaCreacion', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reservasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setReservas(reservasData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const cancelarReserva = async (reservaId, reserva) => {
    if (window.confirm(`¿Estás seguro de cancelar la reserva "${reserva.nombre}"?`)) {
      try {
        await deleteDoc(doc(db, 'reservas', reservaId))
        toast.success(`Reserva "${reserva.nombre}" cancelada exitosamente`, {
          position: "top-right",
          autoClose: 3000
        })
      } catch (error) {
        console.error('Error al cancelar reserva:', error)
        toast.error('Error al cancelar la reserva', {
          position: "top-right",
          autoClose: 3000
        })
      }
    }
  }

  const formatearFecha = (fecha) => {
    if (typeof fecha === 'string') {
      return new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    return fecha?.toDate?.()?.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) || 'Fecha no válida'
  }

  const reservasFiltradas = reservas.filter(reserva => {
    const coincideFecha = !filtroFecha || reserva.fecha === new Date(filtroFecha).toDateString()
    const coincideUsuario = !filtroUsuario || 
      reserva.usuarioEmail.toLowerCase().includes(filtroUsuario.toLowerCase()) ||
      reserva.nombre.toLowerCase().includes(filtroUsuario.toLowerCase())
    
    return coincideFecha && coincideUsuario
  })

  const estadisticas = {
    total: reservas.length,
    hoy: reservas.filter(r => {
      const fechaReserva = new Date(r.fecha)
      const hoy = new Date()
      return fechaReserva.toDateString() === hoy.toDateString()
    }).length,
    esteMes: reservas.filter(r => {
      const fechaReserva = new Date(r.fecha)
      const hoy = new Date()
      return fechaReserva.getMonth() === hoy.getMonth() && fechaReserva.getFullYear() === hoy.getFullYear()
    }).length
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="text-muted">Cargando reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid p-4 app-container">
      {/* Header mejorado del Admin Panel con colores Hulux */}
      <div className="mb-4 p-4 text-white" style={{background: '#2C3E50', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-lg shadow-sm fw-semibold d-flex align-items-center text-white"
              onClick={onVolver}
              style={{backgroundColor: '#E67E22', borderColor: '#E67E22', borderRadius: '12px'}}
            >
              <FaArrowLeft className="me-2" />
              Volver al Calendario
            </button>
            <div>
              <h1 className="fw-bold h3 mb-1 d-flex align-items-center">
                <FaCog className="me-3" style={{fontSize: '1.8rem', color: '#E67E22'}} />
                Panel de Administración
              </h1>
              <p className="mb-0 opacity-75" style={{fontSize: '1.1rem'}}>Gestiona todas las reservas del sistema con control total</p>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <div className="badge p-3 d-flex align-items-center shadow-sm" style={{backgroundColor: '#E67E22', borderRadius: '12px', fontSize: '0.9rem'}}>
              <FaUser className="me-2 text-white" />
              <span className="fw-bold text-white">{user?.displayName || user?.email}</span>
              <span className="badge bg-warning text-dark ms-2 px-2">ADMIN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas mejoradas con colores Hulux */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-lg h-100" style={{background: '#2C3E50', borderRadius: '15px'}}>
            <div className="card-body text-center text-white p-4">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FaChartBar style={{fontSize: '2.5rem', color: '#E67E22'}} />
              </div>
              <h2 className="mb-2 fw-bold" style={{fontSize: '2.5rem'}}>{estadisticas.total}</h2>
              <p className="mb-0 opacity-75 fw-semibold">Total de Reservas</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-lg h-100" style={{background: '#E67E22', borderRadius: '15px'}}>
            <div className="card-body text-center text-white p-4">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FaCalendarAlt style={{fontSize: '2.5rem', opacity: 0.8}} />
              </div>
              <h2 className="mb-2 fw-bold" style={{fontSize: '2.5rem'}}>{estadisticas.hoy}</h2>
              <p className="mb-0 opacity-75 fw-semibold">Reservas Hoy</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-lg h-100" style={{background: 'linear-gradient(135deg, #2C3E50 0%, #E67E22 100%)', borderRadius: '15px'}}>
            <div className="card-body text-center text-white p-4">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FaUser style={{fontSize: '2.5rem', opacity: 0.8}} />
              </div>
              <h2 className="mb-2 fw-bold" style={{fontSize: '2.5rem'}}>{estadisticas.esteMes}</h2>
              <p className="mb-0 opacity-75 fw-semibold">Reservas Este Mes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros mejorados */}
      <div className="card shadow-lg mb-4" style={{borderRadius: '15px', border: 'none'}}>
        <div className="card-header bg-white border-0 p-4" style={{borderRadius: '15px 15px 0 0'}}>
          <h5 className="card-title mb-0 fw-bold d-flex align-items-center">
            <FaFilter className="me-3 text-primary" style={{fontSize: '1.3rem'}} />
            Filtros de Búsqueda
          </h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark">
                <FaCalendarAlt className="me-2 text-primary" />
                Filtrar por fecha
              </label>
              <input
                type="date"
                className="form-control form-control-lg"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                style={{borderRadius: '10px'}}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark">
                <FaUser className="me-2 text-primary" />
                Filtrar por usuario/evento
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Buscar por email o nombre del evento..."
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
                style={{borderRadius: '10px'}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de reservas mejorada */}
      <div className="card shadow-lg" style={{borderRadius: '15px', border: 'none'}}>
        <div className="card-header bg-white border-0 p-4" style={{borderRadius: '15px 15px 0 0'}}>
          <h5 className="card-title mb-0 fw-bold d-flex align-items-center justify-content-between">
            <span>
              <FaBuilding className="me-3 text-primary" style={{fontSize: '1.3rem'}} />
              Todas las Reservas ({reservasFiltradas.length})
            </span>
            {reservasFiltradas.length > 0 && (
              <span className="badge bg-success-dark p-2" style={{borderRadius: '8px'}}>
                {reservasFiltradas.length} reservas encontradas
              </span>
            )}
          </h5>
        </div>
        <div className="card-body p-0">
          {reservasFiltradas.length === 0 ? (
            <div className="text-center py-5">
              <FaExclamationTriangle className="text-warning mb-3" style={{fontSize: '3rem'}} />
              <p className="text-muted mb-0">No hay reservas para mostrar</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0 px-4 py-3 fw-bold text-dark">Evento</th>
                    <th className="border-0 px-4 py-3 fw-bold text-dark">
                      <FaCalendarAlt className="me-2" />
                      Fecha
                    </th>
                    <th className="border-0 px-4 py-3 fw-bold text-dark">
                      <FaClock className="me-2" />
                      Horario
                    </th>
                    <th className="border-0 px-4 py-3 fw-bold text-dark">
                      <FaUser className="me-2" />
                      Usuario
                    </th>
                    <th className="border-0 px-4 py-3 fw-bold text-dark">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasFiltradas.map((reserva) => (
                    <tr key={reserva.id} className="border-bottom">
                      <td className="px-4 py-3">
                        <div>
                          <div className="fw-bold text-dark">{reserva.nombre}</div>
                          <small className="text-muted">{reserva.categoria}</small>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatearFecha(reserva.fecha)}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-info p-2" style={{borderRadius: '8px'}}>
                          {reserva.horaInicio} - {reserva.horaFin}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">{reserva.usuarioEmail}</td>
                      <td className="px-4 py-3">
                        <button
                          className="btn btn-danger btn-sm shadow-sm d-flex align-items-center"
                          onClick={() => cancelarReserva(reserva.id, reserva)}
                          style={{borderRadius: '8px'}}
                        >
                          <FaTrash className="me-2" />
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
