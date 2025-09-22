import { useState, useEffect, useRef } from 'react'
import { auth, db } from '../firebase/config'
import { updateProfile } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { FaUser, FaEnvelope, FaEdit, FaSave, FaTimes, FaArrowLeft, FaCamera } from 'react-icons/fa'
import { toast } from 'react-toastify'
import './UserProfile.css'

function UserProfile({ onBack }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    email: '',
    photoURL: ''
  })
  
  const [editData, setEditData] = useState({
    displayName: '',
    photoURL: ''
  })

  const fileInputRef = useRef(null)

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    if (auth.currentUser) {
      loadUserProfile()
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const user = auth.currentUser
      const userDocRef = doc(db, 'usuarios', user.uid)
      const userDoc = await getDoc(userDocRef)
      
      const profileData = {
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || ''
      }

      if (userDoc.exists()) {
        const userData = userDoc.data()
        profileData.photoURL = userData.photoURL || user.photoURL || ''
      }

      setUserProfile(profileData)
      setEditData({
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      })
    } catch {
      toast.error('Error al cargar el perfil')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida')
        return
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 5MB')
        return
      }

      // Convertir a base64 para preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditData(prev => ({
          ...prev,
          photoURL: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!editData.displayName.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    setLoading(true)
    try {
      const user = auth.currentUser
      
      // Actualizar nombre y foto en Firebase Auth
      await updateProfile(user, {
        displayName: editData.displayName,
        photoURL: editData.photoURL
      })

      // Actualizar datos en Firestore
      const userDocRef = doc(db, 'usuarios', user.uid)
      await setDoc(userDocRef, {
        displayName: editData.displayName,
        email: user.email,
        photoURL: editData.photoURL,
        updatedAt: new Date()
      }, { merge: true })

      // Actualizar estado local
      setUserProfile(prev => ({
        ...prev,
        displayName: editData.displayName,
        photoURL: editData.photoURL
      }))

      setIsEditing(false)
      toast.success('Perfil actualizado exitosamente')
    } catch {
      toast.error('Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      displayName: userProfile.displayName,
      photoURL: userProfile.photoURL
    })
    setIsEditing(false)
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-card">
        <div className="profile-header">
          <button className="back-button" onClick={onBack}>
            <FaArrowLeft /> Volver
          </button>
          <h2><FaUser /> Mi Perfil</h2>
        </div>

        <div className="profile-content">
          <div className="profile-avatar">
            <div className="avatar-circle" onClick={() => isEditing && fileInputRef.current.click()}>
              {editData.photoURL || userProfile.photoURL ? (
                <img 
                  src={editData.photoURL || userProfile.photoURL} 
                  alt="Foto de perfil" 
                  className="profile-photo"
                />
              ) : (
                <FaUser size={60} />
              )}
              {isEditing && (
                <div className="photo-overlay">
                  <FaCamera size={24} />
                </div>
              )}
            </div>
            {isEditing && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            )}
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label>
                <FaUser /> Nombre Completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="displayName"
                  value={editData.displayName}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Ingresa tu nombre completo"
                />
              ) : (
                <div className="profile-value">
                  {userProfile.displayName || 'No especificado'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaEnvelope /> Correo Electrónico
              </label>
              <div className="profile-value readonly">
                {userProfile.email}
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button 
                  className="btn btn-success"
                  onClick={handleSave}
                  disabled={loading}
                >
                  <FaSave /> {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <FaTimes /> Cancelar
                </button>
              </>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit /> Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile