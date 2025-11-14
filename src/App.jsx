import { useEffect, useMemo, useState } from 'react'

function App() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  // Users
  const [riderName, setRiderName] = useState('Alex Rider')
  const [driverName, setDriverName] = useState('Blaze Driver')
  const [riderId, setRiderId] = useState('')
  const [driverId, setDriverId] = useState('')

  // Driver status
  const [driverAvailable, setDriverAvailable] = useState(true)
  const [driverLat, setDriverLat] = useState('')
  const [driverLng, setDriverLng] = useState('')

  // Drivers list
  const [drivers, setDrivers] = useState([])
  const [loadingDrivers, setLoadingDrivers] = useState(false)

  // Ride request
  const [pickup, setPickup] = useState('Downtown Plaza')
  const [dropoff, setDropoff] = useState('City Park Gate')
  const [rideId, setRideId] = useState('')
  const [rides, setRides] = useState([])
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    refreshDrivers()
  }, [])

  const createUser = async (role) => {
    try {
      const payload = {
        name: role === 'rider' ? riderName : driverName,
        role,
        phone: undefined,
        is_active: true,
      }
      const res = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to create user')
      const data = await res.json()
      if (role === 'rider') setRiderId(data.id)
      else setDriverId(data.id)
      setStatusMsg(`${role} created`) 
    } catch (e) {
      setStatusMsg(e.message)
    }
  }

  const refreshDrivers = async () => {
    try {
      setLoadingDrivers(true)
      const res = await fetch(`${baseUrl}/api/drivers`)
      const data = await res.json()
      setDrivers(data)
    } catch (e) {
      setStatusMsg('Failed to load drivers')
    } finally {
      setLoadingDrivers(false)
    }
  }

  const updateDriverStatus = async () => {
    if (!driverId) return setStatusMsg('Create a driver first')
    try {
      const res = await fetch(`${baseUrl}/api/driver/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: driverId,
          is_available: driverAvailable,
          lat: driverLat ? Number(driverLat) : null,
          lng: driverLng ? Number(driverLng) : null,
        }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setStatusMsg('Driver status updated')
      refreshDrivers()
    } catch (e) {
      setStatusMsg(e.message)
    }
  }

  const requestRide = async () => {
    if (!riderId) return setStatusMsg('Create a rider first')
    try {
      const res = await fetch(`${baseUrl}/api/rides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rider_id: riderId, pickup, dropoff }),
      })
      if (!res.ok) throw new Error('Failed to request ride')
      const data = await res.json()
      setRideId(data.id)
      setStatusMsg('Ride requested')
      loadRides()
    } catch (e) {
      setStatusMsg(e.message)
    }
  }

  const assignDriver = async (rid, did) => {
    try {
      const res = await fetch(`${baseUrl}/api/rides/${rid}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: did }),
      })
      if (!res.ok) throw new Error('Assign failed')
      setStatusMsg('Driver assigned')
      loadRides()
    } catch (e) {
      setStatusMsg(e.message)
    }
  }

  const updateRideStatus = async (rid, status) => {
    try {
      const res = await fetch(`${baseUrl}/api/rides/${rid}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Update status failed')
      setStatusMsg(`Ride ${status}`)
      loadRides()
    } catch (e) {
      setStatusMsg(e.message)
    }
  }

  const loadRides = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/rides?rider_id=${encodeURIComponent(riderId || '')}`)
      const data = await res.json()
      setRides(data)
    } catch (e) {
      setStatusMsg('Failed to load rides')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <header className="px-6 py-4 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Bike Taxi</h1>
          <a href="/test" className="text-sm text-blue-600 hover:underline">System test</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid gap-6 md:grid-cols-2">
        {/* Users */}
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">Quick start: create demo users</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rider name</label>
                <input value={riderName} onChange={e=>setRiderName(e.target.value)} className="mt-1 w-full rounded border px-3 py-2"/>
              </div>
              <button onClick={()=>createUser('rider')} className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded">Create rider</button>
              <div className="text-sm text-gray-600 break-all">ID: {riderId || '—'}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver name</label>
                <input value={driverName} onChange={e=>setDriverName(e.target.value)} className="mt-1 w-full rounded border px-3 py-2"/>
              </div>
              <button onClick={()=>createUser('driver')} className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded">Create driver</button>
              <div className="text-sm text-gray-600 break-all">ID: {driverId || '—'}</div>
            </div>
          </div>
        </section>

        {/* Driver availability */}
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">Driver availability</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input id="avail" type="checkbox" checked={driverAvailable} onChange={e=>setDriverAvailable(e.target.checked)} />
              <label htmlFor="avail" className="text-sm">Available for rides</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Latitude" value={driverLat} onChange={e=>setDriverLat(e.target.value)} className="rounded border px-3 py-2" />
              <input placeholder="Longitude" value={driverLng} onChange={e=>setDriverLng(e.target.value)} className="rounded border px-3 py-2" />
            </div>
            <button onClick={updateDriverStatus} className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded">Update status</button>
          </div>
        </section>

        {/* Drivers list */}
        <section className="bg-white rounded-xl shadow p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Nearby drivers</h2>
            <button onClick={refreshDrivers} className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white">Refresh</button>
          </div>
          {loadingDrivers ? (
            <p className="text-gray-500">Loading drivers…</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map((d)=> (
                <div key={d.id} className="rounded border p-4">
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-gray-600">{d.status?.is_available ? 'Available' : 'Unavailable'}</div>
                  {d.status?.lat && d.status?.lng && (
                    <div className="text-xs text-gray-500">({d.status.lat}, {d.status.lng})</div>
                  )}
                  {rideId && d.status?.is_available && (
                    <button onClick={()=>assignDriver(rideId, d.id)} className="mt-2 text-sm px-3 py-1.5 rounded bg-blue-600 text-white">Assign to current ride</button>
                  )}
                </div>
              ))}
              {drivers.length === 0 && (
                <p className="text-gray-500">No drivers yet. Create one above.</p>
              )}
            </div>
          )}
        </section>

        {/* Request a ride */}
        <section className="bg-white rounded-xl shadow p-5 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Request a ride</h2>
          <div className="grid md:grid-cols-5 gap-3 items-end">
            <input className="rounded border px-3 py-2 md:col-span-2" placeholder="Pickup" value={pickup} onChange={e=>setPickup(e.target.value)} />
            <input className="rounded border px-3 py-2 md:col-span-2" placeholder="Dropoff" value={dropoff} onChange={e=>setDropoff(e.target.value)} />
            <button onClick={requestRide} className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Request</button>
          </div>
          <div className="mt-3 text-sm text-gray-600">Current Ride ID: <span className="font-mono">{rideId || '—'}</span></div>
        </section>

        {/* Rides list */}
        <section className="bg-white rounded-xl shadow p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Your recent rides</h2>
            <button onClick={loadRides} className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Pickup</th>
                  <th className="py-2 pr-4">Dropoff</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Driver</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rides.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2 pr-4 font-mono truncate max-w-[140px]">{r.id}</td>
                    <td className="py-2 pr-4">{r.pickup}</td>
                    <td className="py-2 pr-4">{r.dropoff}</td>
                    <td className="py-2 pr-4">{r.status}</td>
                    <td className="py-2 pr-4">{r.driver_id ? r.driver_id : '—'}</td>
                    <td className="py-2 space-x-2">
                      <button onClick={()=>updateRideStatus(r.id, 'picked_up')} className="px-2 py-1 rounded bg-amber-600 text-white">Pick up</button>
                      <button onClick={()=>updateRideStatus(r.id, 'completed')} className="px-2 py-1 rounded bg-emerald-600 text-white">Complete</button>
                      <button onClick={()=>updateRideStatus(r.id, 'cancelled')} className="px-2 py-1 rounded bg-rose-600 text-white">Cancel</button>
                    </td>
                  </tr>
                ))}
                {rides.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-gray-500">No rides yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {statusMsg && (
          <div className="md:col-span-2 p-3 rounded bg-blue-50 border border-blue-200 text-blue-700">
            {statusMsg}
          </div>
        )}

        <section className="md:col-span-2 text-xs text-gray-500">
          Backend: <span className="font-mono">{baseUrl}</span>
        </section>
      </main>
    </div>
  )
}

export default App
