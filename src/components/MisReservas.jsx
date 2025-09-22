import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { FaTrash, FaClock, FaCalendarAlt, FaExclamationTriangle, FaArrowLeft, FaUser, FaClipboardList, FaCheckCircle, FaHome, FaSadTear } from 'react-icons/fa'
import { toast } from 'react-toastify'
import './Header.css'

function MisReservas({ user, onVolver }) {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return

    // Consulta en tiempo real de las reservas del usuario actual
    const q = query(
      collection(db, 'reservas'),
      where('usuarioId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reservasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Ordenar por fecha
      reservasData.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      setReservas(reservasData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user?.uid])

  const cancelarReserva = async (reservaId, reserva) => {
    if (window.confirm(`¿Estás seguro de cancelar la reserva "${reserva.nombre}"?`)) {
      try {
        await deleteDoc(doc(db, 'reservas', reservaId))
        toast.success(`Reserva "${reserva.nombre}" cancelada exitosamente`, {
          position: "top-right",
          autoClose: 3000
        })
      } catch {
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
    return 'Fecha no válida'
  }

  const esPasada = (fecha) => {
    const hoy = new Date()
    const fechaReserva = new Date(fecha)
    return fechaReserva < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="text-muted">Cargando tus reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid p-4 app-container">
      {/* Header mejorado con colores Hulux */}
      <div className="mb-4 p-4 text-white" style={{background: 'linear-gradient(135deg, var(--hulux-azul-oscuro) 0%, var(--hulux-morado) 100%)', borderRadius: '15px', boxShadow: '0 10px 25px rgba(17,41,62,0.2)'}}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-lg shadow-sm fw-semibold d-flex align-items-center"
              onClick={onVolver}
              style={{backgroundColor: 'var(--hulux-celeste)', color: 'var(--hulux-azul-oscuro)', borderRadius: '12px'}}
            >
              <FaArrowLeft className="me-2" />
              Volver al Calendario
            </button>
            <div>
              <h1 className="fw-bold h3 mb-1 d-flex align-items-center">
                <FaClipboardList className="me-3" style={{fontSize: '1.8rem'}} />
                Mis Reservas
              </h1>
              <p className="mb-0 opacity-75" style={{fontSize: '1.1rem'}}>
                {reservas.length === 0 
                  ? 'Aún no tienes reservas registradas' 
                  : `Administre reservas y espacios corporativos (${reservas.length} reservas)`
                }
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <div className="badge p-3 d-flex align-items-center shadow-sm" style={{backgroundColor: 'var(--hulux-verde-lima)', color: 'var(--hulux-azul-oscuro)', borderRadius: '12px', fontSize: '0.9rem'}}>
              <FaUser className="me-2" style={{color: 'var(--hulux-azul-oscuro)'}} />
              <span className="fw-bold">{user?.displayName || user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido de reservas */}
      <div className="card shadow-sm flex-grow-1">
        <div className="card-body">
          {reservas.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <FaSadTear className="text-muted mb-3" style={{fontSize: '4rem'}} />
              </div>
              <h4 className="text-muted mb-3">
                <FaClipboardList className="me-2" />
                No tienes reservas registradas
              </h4>
              <p className="text-muted mb-4 fs-5">
                Bienvenido a tu centro de gestión. <br />
                ¡Comience reservando su primera sala de reuniones!
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button 
                  className="btn btn-lg fw-semibold px-4 py-3 text-white" 
                  onClick={onVolver}
                  style={{
                    backgroundColor: 'var(--hulux-naranja)',
                    borderColor: 'var(--hulux-naranja)',
                    borderRadius: '12px',
                    fontSize: '1.1rem'
                  }}
                >
                  <FaCalendarAlt className="me-2" />
                  Crear mi primera reserva
                </button>
                <button 
                  className="btn btn-outline-secondary btn-lg fw-semibold px-4 py-3" 
                  onClick={onVolver}
                  style={{
                    borderRadius: '12px',
                    fontSize: '1.1rem'
                  }}
                >
                  <FaArrowLeft className="me-2" />
                  Volver al Calendario
                </button>
              </div>
              <div className="mt-4 p-3 bg-light rounded-3 border">
                <small className="text-muted">
                  <strong>💡 Consejo:</strong> Desde el calendario puedes seleccionar una fecha y crear reservas fácilmente
                </small>
              </div>
            </div>
          ) : (
          <div className="row g-3">
            {reservas.map((reserva) => (
              <div key={reserva.id} className="col-12 col-md-6 col-lg-4">
                <div className={`card h-100 ${esPasada(reserva.fecha) ? 'border-secondary' : ''}`} 
                     style={{
                       borderColor: esPasada(reserva.fecha) ? '#6c757d' : 'var(--hulux-naranja)',
                       borderWidth: '2px'
                     }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0 fw-bold" style={{color: 'var(--hulux-azul-oscuro)'}}>{reserva.nombre}</h6>
                      {!esPasada(reserva.fecha) && (
                        <button
                          className="btn btn-sm"
                          onClick={() => cancelarReserva(reserva.id, reserva)}
                          title="Cancelar reserva"
                          style={{
                            backgroundColor: '#dc3545',
                            borderColor: '#dc3545',
                            color: 'white'
                          }}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">
                        <FaCalendarAlt className="me-1" />
                        {formatearFecha(reserva.fecha)}
                      </small>
                      <span className="badge" 
                            style={{
                              backgroundColor: esPasada(reserva.fecha) ? '#6c757d' : 'var(--hulux-azul-oscuro)',
                              color: 'white'
                            }}>
                        <FaClock className="me-1" />
                        {reserva.horaInicio} - {reserva.horaFin}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="badge mb-1" 
                            style={{
                              backgroundColor: 'var(--hulux-naranja)',
                              color: 'white'
                            }}>{reserva.categoria}</span>
                    </div>

                    {reserva.materiales?.length > 0 && (
                      <div className="mb-2">
                        <small className="text-dark">
                          <strong style={{color: 'var(--hulux-azul-oscuro)'}}>Materiales:</strong> 
                          <span style={{color: 'var(--hulux-azul-medio)'}}>{reserva.materiales.join(', ')}</span>
                        </small>
                      </div>
                    )}

                    {esPasada(reserva.fecha) && (
                      <div style={{color: 'var(--hulux-azul-oscuro)'}}>
                        <small>
                          <FaExclamationTriangle className="me-1" style={{color: 'var(--hulux-naranja)'}} />
                          <strong>Reserva pasada</strong>
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

export default MisReservas
