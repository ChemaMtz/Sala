import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase/config'
import { FaGoogle, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import './Auth.css'

function Register({ onRegister, switchToLogin }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Verificar si el usuario ya existe en Firestore
      const userDocRef = doc(db, 'usuarios', user.uid)
      const userDoc = await getDoc(userDocRef)

      // Si no existe, crear el perfil del usuario
      if (!userDoc.exists()) {
        // Determinar rol basado en el email
        const esAdmin = user.email === 'admin@hulux.com'
        
        await setDoc(userDocRef, {
          nombre: user.displayName,
          email: user.email,
          fechaRegistro: new Date(),
          rol: esAdmin ? 'admin' : 'usuario',
          proveedor: 'google'
        })
      }

      setMessage('¡Registro exitoso con Google!')
      onRegister({
        email: user.email,
        uid: user.uid,
        displayName: user.displayName
      })
    } catch (error) {
      console.error('Error en registro con Google:', error)
      let errorMessage = 'Error al registrarse con Google'
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Ventana cerrada por el usuario'
          break
        case 'auth/cancelled-popup-request':
          errorMessage = 'Solicitud cancelada'
          break
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Ya existe una cuenta con este email usando otro método'
          break
        default:
          errorMessage = 'Error al registrarse con Google'
      }
      
      setMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage('Por favor, completa todos los campos obligatorios')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      )

      // Actualizar el perfil del usuario con su nombre
      await updateProfile(userCredential.user, {
        displayName: formData.nombre
      })

      // Guardar información adicional del usuario en Firestore
      // Determinar rol basado en el email
      const esAdmin = formData.email === 'admin@hulux.com'
      
      await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
        nombre: formData.nombre,
        email: formData.email,
        fechaRegistro: new Date(),
        rol: esAdmin ? 'admin' : 'usuario'
      })

      setMessage('¡Registro exitoso! Redirigiendo...')
      
      // Llamar onRegister con los datos del usuario
      onRegister({
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        displayName: formData.nombre
      })

    } catch (error) {
      console.error('Error en registro:', error)
      let errorMessage = 'Error al crear la cuenta'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Ya existe una cuenta con este email'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email inválido'
          break
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet'
          break
        default:
          errorMessage = 'Error al crear la cuenta. Intenta nuevamente'
      }
      
      setMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100 register-container">
      <div className="container-fluid d-flex align-items-center justify-content-center flex-grow-1 py-4">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <div className="card shadow-lg">
            <div className="card-header text-center border-0 pb-0" style={{background: 'var(--hulux-azul-oscuro)', color: 'black', borderRadius: '0.375rem 0.375rem 0 0'}}>
              <h2 className="fw-bold mb-1">🏢 Reserva Sala de Juntas</h2>
              <h4 className="fw-semibold" style={{color: 'var(--hulux-naranja)'}}>Crear Cuenta</h4>
              <p className="small mb-0 opacity-75">Únete para gestionar reservas de salas</p>
            </div>
            <div className="card-body pt-4">
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <FaUser className="me-2" />
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <FaEnvelope className="me-2" />
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="ejemplo@empresa.com"
                      required
                    />
                    <div className="form-text">
                      <small style={{color: 'black'}}>
                        💡 <strong style={{color: 'black'}}>Nota:</strong> Use <code>admin@hulux.com</code> para acceso de administrador
                      </small>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <FaLock className="me-2" />
                      Contraseña *
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <FaLock className="me-2" />
                      Confirmar contraseña *
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Repite tu contraseña"
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="terms" required />
                  <label className="form-check-label small" htmlFor="terms">
                    Acepto los <a href="#" className="text-decoration-none">términos y condiciones</a> y la <a href="#" className="text-decoration-none">política de privacidad</a>
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-lg fw-semibold w-100 text-white" 
                  disabled={isLoading}
                  style={{backgroundColor: 'var(--hulux-azul-oscuro)', borderColor: 'var(--hulux-azul-oscuro)'}}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>

                <div className="text-center my-3">
                  <span className="text-muted small">o</span>
                </div>

                <button 
                  type="button" 
                  className="btn btn-lg fw-semibold w-100 text-white" 
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  style={{backgroundColor: 'var(--hulux-naranja)', borderColor: 'var(--hulux-naranja)'}}
                >
                  <FaGoogle className="me-2" />
                  Registrarse con Google
                </button>

                {message && (
                  <div className={`alert ${message.includes('exitoso') ? 'alert-success' : 'alert-danger'} text-center`}>
                    {message}
                  </div>
                )}
              </form>
            </div>
            
            <div className="card-footer bg-transparent text-center border-0">
              <p className="mb-0 text-muted">
                ¿Ya tienes cuenta? {' '}
                <button 
                  type="button" 
                  className="btn btn-link p-0 fw-semibold text-decoration-none"
                  onClick={switchToLogin}
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
