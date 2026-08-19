import { useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../context/useAuth.js'

function ChooseFacility() {
  const { setCurrentFacility, accessibleFacilities } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'

  function pick(facility) {
    setCurrentFacility(facility)
    navigate(next, { replace: true })
  }

  return (
    <div className="bg-white rounded shadow p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Choose a facility</h1>
      <div className="flex gap-2">
        {accessibleFacilities.map((facility) => (
          <button
            key={facility.id}
            onClick={() => pick(facility)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {facility.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChooseFacility
