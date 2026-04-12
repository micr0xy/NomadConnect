import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaArrowLeft,
  FaEdit,
  FaCheck,
  FaTimes,
  FaInstagram,
  FaMapMarkedAlt,
  FaUserPlus,
  FaUserCheck,
  FaComment,
} from 'react-icons/fa'
import { MdVerifiedUser, MdLanguage } from 'react-icons/md'
import useAuthStore from '../store/authStore'
import { getProfileByEmail, followUser, unfollowUser } from '../services/profileApi'
import { getOrCreatePrivateGroup } from '../services/messagesApi'
import './ProfilePage.css'

const TRAVEL_STYLE_OPTIONS = [
  'Leisure Traveler',
  'Backpacker',
  'Adventure Seeker',
  'Digital Nomad',
  'Luxury Explorer',
  'Culture Hunter',
]

const INTEREST_OPTIONS = [
  'Rooftop Bars',
  'Festivals',
  'Mountaineering',
  'Yoga',
  'Meditation',
  'Music',
  'Nightlife',
  'Food Trails',
  'Photography',
]

const DEFAULT_PROFILE_FORM = {
  firstName: '',
  lastName: '',
  age: '',
  location: '',
  instagramHandle: '',
  profileImage: '',
  coverImage: '',
  bio: '',
  languages: '',
  countriesVisited: '',
  upcomingTrips: '',
  profileTheme: 'sunset',
  travelStyles: [],
  interests: [],
  photos: ['', '', '', '', '', ''],
}

const optimizeImageFile = (file, { maxDimension = 1600, quality = 0.78 } = {}) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onerror = () => reject(new Error('Could not read image file'))
    fileReader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('Invalid image format'))
      image.onload = () => {
        const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height))
        const width = Math.max(1, Math.round(image.width * ratio))
        const height = Math.max(1, Math.round(image.height * ratio))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('Could not process image'))
          return
        }

        context.drawImage(image, 0, 0, width, height)
        const output = canvas.toDataURL('image/jpeg', quality)
        resolve(output)
      }

      image.src = String(fileReader.result || '')
    }

    fileReader.readAsDataURL(file)
  })

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profileEmail } = useParams()
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const isLoading = useAuthStore((state) => state.isLoading)

  const normalizedCurrentEmail = String(user?.email || '').toLowerCase()
  const normalizedProfileEmail = String(decodeURIComponent(profileEmail || '')).toLowerCase()
  const canEdit = !normalizedProfileEmail || normalizedProfileEmail === normalizedCurrentEmail

  const [editing, setEditing] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [viewError, setViewError] = useState('')
  const [viewedProfile, setViewedProfile] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const makeFormFromUser = (currentUser) => ({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    age: currentUser?.age || '',
    location: currentUser?.location || '',
    instagramHandle: currentUser?.instagramHandle || '',
    profileImage: currentUser?.profileImage || '',
    coverImage: currentUser?.coverImage || '',
    bio: currentUser?.bio || '',
    languages: (currentUser?.languages || []).join(', '),
    countriesVisited: (currentUser?.countriesVisited || []).join(', '),
    upcomingTrips: (currentUser?.upcomingTrips || []).join(', '),
    profileTheme: currentUser?.profileTheme || 'sunset',
    travelStyles: currentUser?.travelStyles || [],
    interests: currentUser?.interests || [],
    photos: [
      currentUser?.photos?.[0] || '',
      currentUser?.photos?.[1] || '',
      currentUser?.photos?.[2] || '',
      currentUser?.photos?.[3] || '',
      currentUser?.photos?.[4] || '',
      currentUser?.photos?.[5] || '',
    ],
  })

  const [form, setForm] = useState(() => makeFormFromUser(user) || DEFAULT_PROFILE_FORM)

  useEffect(() => {
    const fetchViewedProfile = async () => {
      if (canEdit) {
        setViewedProfile(null)
        setViewError('')
        setIsFollowing(false)
        return
      }

      try {
        setLoadingProfile(true)
        setViewError('')
        const profile = await getProfileByEmail(normalizedProfileEmail)
        setViewedProfile(profile)
        
        // Check if current user is following this profile
        if (user && profile?.followers) {
          setIsFollowing(profile.followers.includes(user._id))
        }
      } catch (error) {
        setViewError(typeof error === 'string' ? error : 'Failed to load profile')
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchViewedProfile()
  }, [canEdit, normalizedProfileEmail, user])

  const profileData = canEdit ? user : viewedProfile

  const profileStrength = useMemo(() => {
    if (!profileData) return 0
    const checks = [
      !!profileData.profileImage,
      !!profileData.bio,
      !!profileData.location,
      !!profileData.age,
      (profileData.interests || []).length > 0,
      (profileData.travelStyles || []).length > 0,
      (profileData.countriesVisited || []).length > 0,
      (profileData.languages || []).length > 0,
    ]
    const complete = checks.filter(Boolean).length
    return Math.round((complete / checks.length) * 100)
  }, [profileData])

  const countriesCount = (profileData?.countriesVisited || []).length
  const exploredPercent = ((countriesCount / 195) * 100).toFixed(1)

  const parseCommaList = (value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

  const toggleSelection = (field, value) => {
    setForm((prev) => {
      const current = prev[field] || []
      const exists = current.includes(value)
      return {
        ...prev,
        [field]: exists ? current.filter((entry) => entry !== value) : [...current, value],
      }
    })
  }

  const handleEditStart = () => {
    if (!canEdit) return
    setSaveError('')
    setForm(makeFormFromUser(user))
    setEditing(true)
  }



  const handleCancel = () => {
    if (!canEdit) return
    setSaveError('')
    setForm(makeFormFromUser(user))
    setEditing(false)
  }

  const handleFollowClick = async () => {
    if (!user || !viewedProfile) return
    try {
      setFollowLoading(true)
      if (isFollowing) {
        await unfollowUser(viewedProfile._id)
        setIsFollowing(false)
      } else {
        await followUser(viewedProfile._id)
        setIsFollowing(true)
      }
      // Refresh profile to get updated follower counts
      const updatedProfile = await getProfileByEmail(normalizedProfileEmail)
      setViewedProfile(updatedProfile)
    } catch (error) {
      setSaveError(typeof error === 'string' ? error : 'Failed to update follow status')
    } finally {
      setFollowLoading(false)
    }
  }

  const canPrivateMessage = () => {
    if (canEdit || !user || !viewedProfile) return false
    // Can message if both users follow each other
    return (
      user.following?.includes(viewedProfile._id) &&
      viewedProfile.followers?.includes(user._id) &&
      viewedProfile.following?.includes(user._id) &&
      user.followers?.includes(viewedProfile._id)
    )
  }

  const handleMessageClick = async () => {
    if (!viewedProfile) return
    try {
      setFollowLoading(true)
      const group = await getOrCreatePrivateGroup(viewedProfile._id)
      navigate(`/messages/${group._id}`)
    } catch (error) {
      setSaveError(typeof error === 'string' ? error : 'Failed to start chat')
    } finally {
      setFollowLoading(false)
    }
  }

  const handleSave = async () => {
    if (!canEdit) return
    try {
      setSaveError('')
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        age: form.age ? Number(form.age) : null,
        location: form.location,
        instagramHandle: form.instagramHandle,
        profileImage: form.profileImage,
        coverImage: form.coverImage,
        bio: form.bio,
        profileTheme: form.profileTheme,
        travelStyles: form.travelStyles,
        interests: form.interests,
        languages: parseCommaList(form.languages),
        countriesVisited: parseCommaList(form.countriesVisited),
        upcomingTrips: parseCommaList(form.upcomingTrips),
        photos: form.photos.map((photo) => photo.trim()).filter(Boolean),
      })
      setEditing(false)
    } catch (error) {
      setSaveError(error.response?.data?.message || 'Failed to save profile changes')
    }
  }

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setSaveError('')
      const dataUrl = await optimizeImageFile(file, { maxDimension: 900, quality: 0.82 })
      setForm((prev) => ({ ...prev, profileImage: dataUrl }))
    } catch (error) {
      setSaveError('Could not process avatar image. Please try a different file.')
    }
  }

  const handleCoverFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setSaveError('')
      const dataUrl = await optimizeImageFile(file, { maxDimension: 1600, quality: 0.75 })

      // Keep a hard guardrail so payloads stay well below backend limits.
      if (dataUrl.length > 4_500_000) {
        setSaveError('Image is still too large. Please choose a smaller image.')
        return
      }

      setForm((prev) => ({ ...prev, coverImage: dataUrl }))
    } catch (error) {
      setSaveError('Could not process cover image. Please try a different file.')
    }
  }

  const displayPhotos = (profileData?.photos || []).slice(0, 6)

  const renderChipGroup = (items, emptyText) => {
    if (!items || items.length === 0) {
      return <p className="section-empty">{emptyText}</p>
    }

    return (
      <div className="chip-grid">
        {items.map((item) => (
          <span className="info-chip" key={item}>{item}</span>
        ))}
      </div>
    )
  }

  if (loadingProfile || (canEdit && !user)) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 gap-4">
        <p className="text-lg text-gray-600">{viewError || 'Profile not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="profile-page"
    >
      <div className="profile-header">
        <button onClick={() => navigate(-1)} className="profile-back-btn">
          <FaArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1>{canEdit ? 'Profile' : 'Traveler Profile'}</h1>
        {canEdit && editing ? (
          <div className="header-actions">
            <button className="icon-action cancel" onClick={handleCancel} title="Cancel">
              <FaTimes />
            </button>
            <button className="icon-action save" onClick={handleSave} disabled={isLoading} title="Save changes">
              <FaCheck />
            </button>
          </div>
        ) : canEdit ? (
          <button className="icon-action edit" onClick={handleEditStart} title="Edit profile">
            <FaEdit />
          </button>
        ) : (
          <div style={{ width: 38, height: 38 }} />
        )}
      </div>

      <div className="profile-container">
        <div
          className={`profile-hero-card ${(editing ? form.coverImage : profileData?.coverImage) ? 'has-cover' : ''}`}
          style={(editing ? form.coverImage : profileData?.coverImage)
            ? { backgroundImage: `linear-gradient(rgba(8, 20, 13, 0.1), rgba(8, 20, 13, 0.35)), url(${editing ? form.coverImage : profileData?.coverImage})` }
            : undefined}
        >
          {canEdit && editing && (
            <>
              <label className="cover-edit-btn" htmlFor="cover-upload-input">Change cover</label>
              <input
                id="cover-upload-input"
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="hidden-cover-input"
              />
            </>
          )}

          <div className="hero-avatar-wrap">
            {(editing ? form.profileImage : profileData?.profileImage) ? (
              <img src={editing ? form.profileImage : profileData?.profileImage} alt={profileData.firstName} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                <span>{profileData?.firstName?.charAt(0)}{profileData?.lastName?.charAt(0)}</span>
              </div>
            )}
            {canEdit && editing && (
              <label className="avatar-edit-btn" htmlFor="avatar-upload-input">
                Change
              </label>
            )}
            {canEdit && editing && (
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden-avatar-input"
              />
            )}
            <div className="profile-progress">{profileStrength}%</div>
          </div>

          <h2 className="hero-name">
            {profileData?.firstName} {profileData?.lastName}
            {profileData?.age ? `, ${profileData.age}` : ''}
          </h2>

          <p className="hero-subtitle">{profileData?.location || 'Location not shared'}</p>

          <div className="hero-badges">
            {profileData?.isVerified && (
              <span className="hero-pill"><MdVerifiedUser /> Verified</span>
            )}
            <span className="hero-pill"><FaMapMarkedAlt /> {countriesCount} countries</span>
          </div>

          {profileData?.instagramHandle && (
            <a
              className="instagram-pill"
              href={`https://instagram.com/${profileData.instagramHandle}`}
              target="_blank"
              rel="noreferrer"
            >
              <FaInstagram /> @{profileData.instagramHandle}
            </a>
          )}

          {!editing && (
            <>
              <div className="profile-stats">
                <div className="profile-stat-card">
                  <p className="stat-big">{profileData?.followersCount || profileData?.followers?.length || 0}</p>
                  <p className="stat-lbl">Followers</p>
                </div>
                <div className="profile-stat-card">
                  <p className="stat-big">{profileData?.followingCount || profileData?.following?.length || 0}</p>
                  <p className="stat-lbl">Following</p>
                </div>
                <div className="profile-stat-card">
                  <p className="stat-big">{countriesCount}</p>
                  <p className="stat-lbl">Countries</p>
                </div>
              </div>

              {!canEdit && (
                <div className="profile-actions">
                  <button 
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollowClick}
                    disabled={followLoading}
                  >
                    {isFollowing ? (
                      <>
                        <FaUserCheck /> Following
                      </>
                    ) : (
                      <>
                        <FaUserPlus /> Follow
                      </>
                    )}
                  </button>
                  {canPrivateMessage() ? (
                    <button 
                      className="message-btn"
                      onClick={handleMessageClick}
                      disabled={followLoading}
                    >
                      <FaComment /> Message
                    </button>
                  ) : (
                    <button className="message-btn" disabled title="Follow back to enable messaging">
                      <FaComment /> Message
                    </button>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {saveError && <div className="error-box">{saveError}</div>}

        {canEdit && editing && (
          <div className="profile-card edit-card">
            <h3>Edit Basics</h3>
            <div className="edit-grid">
              <input value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} placeholder="First name" />
              <input value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} placeholder="Last name" />
              <input value={form.age} onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))} placeholder="Age" type="number" min="18" max="120" />
              <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Location" />
              <input value={form.instagramHandle} onChange={(e) => setForm((prev) => ({ ...prev, instagramHandle: e.target.value }))} placeholder="Instagram handle" />
              <input value={form.profileImage} onChange={(e) => setForm((prev) => ({ ...prev, profileImage: e.target.value }))} placeholder="Avatar image URL" />
              <input value={form.coverImage} onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))} placeholder="Cover image URL" />
            </div>

            <textarea value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} placeholder="About me" rows={4} />

            <div className="option-block">
              <p>Travel Style</p>
              <div className="chip-grid">
                {TRAVEL_STYLE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`toggle-chip ${form.travelStyles.includes(option) ? 'active' : ''}`}
                    onClick={() => toggleSelection('travelStyles', option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-block">
              <p>Interests</p>
              <div className="chip-grid">
                {INTEREST_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`toggle-chip ${form.interests.includes(option) ? 'active' : ''}`}
                    onClick={() => toggleSelection('interests', option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="edit-grid single-col">
              <input value={form.languages} onChange={(e) => setForm((prev) => ({ ...prev, languages: e.target.value }))} placeholder="Languages (comma separated)" />
              <input value={form.countriesVisited} onChange={(e) => setForm((prev) => ({ ...prev, countriesVisited: e.target.value }))} placeholder="Countries visited (comma separated)" />
              <input value={form.upcomingTrips} onChange={(e) => setForm((prev) => ({ ...prev, upcomingTrips: e.target.value }))} placeholder="Upcoming trips (comma separated)" />
            </div>

            <div className="photo-inputs">
              <p>Photo URLs</p>
              {form.photos.map((photo, idx) => (
                <input
                  key={`photo-${idx}`}
                  value={photo}
                  onChange={(e) => {
                    const value = e.target.value
                    setForm((prev) => {
                      const updated = [...prev.photos]
                      updated[idx] = value
                      return { ...prev, photos: updated }
                    })
                  }}
                  placeholder={`Photo URL ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {!editing && (
        <div className="profile-sections-grid">
          <div className="profile-card">
            <h3>About Me</h3>
            <p className="about-text">{profileData?.bio || 'No bio shared yet.'}</p>
          </div>

          <div className="profile-card">
            <h3>Upcoming Trips</h3>
            {renderChipGroup(profileData?.upcomingTrips, 'No upcoming trips')}
          </div>

          <div className="profile-card">
            <h3>Countries Visited</h3>
            <p className="world-stat">{exploredPercent}% of the world explored</p>
            <p className="muted-line">{countriesCount} countries visited</p>
            {renderChipGroup(profileData?.countriesVisited, 'No countries added yet')}
          </div>

          <div className="profile-card">
            <h3>Travel Style</h3>
            {renderChipGroup(profileData?.travelStyles, 'No travel style selected')}
          </div>

          <div className="profile-card">
            <h3>Interests</h3>
            {renderChipGroup(profileData?.interests, 'No interests selected')}
          </div>

          <div className="profile-card">
            <h3><MdLanguage /> Languages</h3>
            {renderChipGroup(profileData?.languages, 'No languages specified')}
          </div>

          <div className="profile-card photos-card">
            <h3>Photos</h3>
            <div className="photo-grid">
              {displayPhotos.length > 0 ? (
                displayPhotos.map((photo) => (
                  <img src={photo} alt="Travel memory" key={photo} className="gallery-photo" />
                ))
              ) : (
                <p className="section-empty">Add photo URLs in edit mode to build your gallery</p>
              )}
            </div>
          </div>
        </div>
        )}

      </div>
    </motion.div>
  )
}
