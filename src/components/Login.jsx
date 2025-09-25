import { useState } from 'react'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, db } from '../firebase/config'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { FaGoogle, FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa'
import './Auth.css'

function Login({ onLogin, switchToRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleGoogleSignIn = async () => {
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
        const esAdmin = user.email === '2023humanosdelux@gmail.com'
        
        await setDoc(userDocRef, {
          nombre: user.displayName,
          email: user.email,
          fechaRegistro: new Date(),
          rol: esAdmin ? 'admin' : 'usuario',
          proveedor: 'google'
        })
      }

      setMessage('¡Inicio de sesión exitoso!')
      onLogin({
        email: user.email,
        uid: user.uid,
        displayName: user.displayName
      })
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión con Google'
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Ventana cerrada por el usuario'
          break
        case 'auth/cancelled-popup-request':
          errorMessage = 'Solicitud cancelada'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión'
          break
        default:
          errorMessage = 'Error al iniciar sesión con Google'
      }
      
      setMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setMessage('Por favor, completa todos los campos')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      setMessage('¡Inicio de sesión exitoso!')
      onLogin({
        email: userCredential.user.email,
        uid: userCredential.user.uid
      })
    } catch (error) {
      console.error('Error en login:', error)
      let errorMessage = 'Error al iniciar sesión'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este email'
          break
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email inválido'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta más tarde'
          break
        default:
          errorMessage = 'Error al iniciar sesión. Verifica tus credenciales'
      }
      
      setMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100 login-container">
      <div className="container-fluid d-flex align-items-center justify-content-center flex-grow-1 py-5">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card shadow-lg">
            <div className="card-header text-center border-0 pb-0" style={{background: 'var(--hulux-azul-oscuro)', color: 'black', borderRadius: '0.375rem 0.375rem 0 0'}}>
              <h2 className="fw-bold mb-1">🏢 Hulux Espacios Corporativos</h2>
              <h4 className="fw-semibold" style={{color: 'var(--hulux-naranja)'}}>Iniciar Sesión</h4>
              <p className="small mb-0 opacity-75">Accede a tu cuenta para gestionar reservas</p>
            </div>
            <div className="card-body pt-4">
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label fw-semibold">
                    <FaEnvelope className="me-2" />
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control form-control-lg"
                    placeholder="nombre@empresa.com"
                    required
                  />
                  <div className="form-text">
                    <small style={{color: 'black'}}>
                      💡 <strong style={{color: 'black'}}>Gestión completa:</strong> <code>2023humanosdelux@gmail.com</code>
                    </small>
                  </div>
                </div>
                
                <div>
                  <label className="form-label fw-semibold">
                    <FaLock className="me-2" />
                    Contraseña
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      placeholder="Tu contraseña"
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

                <div className="d-flex justify-content-between align-items-center">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="remember" />
                    <label className="form-check-label small" htmlFor="remember">
                      Recordarme
                    </label>
                  </div>
                  <a href="#" className="text-decoration-none small">¿Olvidaste tu contraseña?</a>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg fw-semibold w-100" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Iniciando...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>

                <div className="text-center my-3">
                  <span className="text-muted small">o</span>
                </div>

                <button 
                  type="button" 
                  className="btn btn-google btn-lg fw-semibold w-100" 
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <FaGoogle className="me-2" />
                  Continuar con Google
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
                ¿No tienes cuenta? {' '}
                <button 
                  type="button" 
                  className="btn btn-link p-0 fw-semibold text-decoration-none"
                  onClick={switchToRegister}
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
