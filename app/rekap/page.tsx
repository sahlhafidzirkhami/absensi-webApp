'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Absensi {
  id: string
  nama: string
  foto_url: string
  latitude: number
  longitude: number
  waktu: string
}

export default function RekapPage() {
  const [data, setData] = useState<Absensi[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fotoModal, setFotoModal] = useState<string | null>(null)
  const [filterTanggal, setFilterTanggal] = useState('')

  useEffect(() => { fetchAbsensi() }, [])

  const fetchAbsensi = async () => {
    const { data, error } = await supabase
      .from('absensi')
      .select('*')
      .order('waktu', { ascending: false })
    if (!error) setData(data)
    setLoading(false)
  }

  const today = new Date().toISOString().split('T')[0]

  const filtered = data.filter(row => {
    const matchNama = row.nama.toLowerCase().includes(search.toLowerCase())
    const matchTanggal = filterTanggal ? row.waktu.startsWith(filterTanggal) : true
    return matchNama && matchTanggal
  })

  const totalHariIni = data.filter(row => row.waktu.startsWith(today)).length

  const exportCSV = () => {
    const header = ['No', 'Nama', 'Waktu', 'Latitude', 'Longitude', 'Foto URL']
    const rows = filtered.map((row, i) => [
      i + 1, row.nama,
      new Date(row.waktu).toLocaleString('id-ID'),
      row.latitude, row.longitude, row.foto_url
    ])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `absensi_${today}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatWaktu = (iso: string) => new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500 text-sm">
      Memuat data...
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">Rekap Absensi</h1>
            <p className="text-gray-500 text-xs">Data kehadiran karyawan</p>
          </div>
          <a
            href="/"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Absensi
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* Statistik */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <p className="text-gray-500 text-xs mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{data.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <p className="text-gray-500 text-xs mb-1">Hari Ini</p>
            <p className="text-2xl font-bold text-emerald-400">{totalHariIni}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <p className="text-gray-500 text-xs mb-1">Filter</p>
            <p className="text-2xl font-bold text-blue-400">{filtered.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            placeholder="Cari nama karyawan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={filterTanggal}
              onChange={e => setFilterTanggal(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            />
            {filterTanggal && (
              <button
                onClick={() => setFilterTanggal('')}
                className="bg-gray-800 border border-gray-700 text-gray-400 px-3 rounded-xl text-sm"
              >
                ✕
              </button>
            )}
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 px-3 py-2.5 rounded-xl text-xs transition-colors whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV
            </button>
          </div>
        </div>

        {/* Kosong */}
        {filtered.length === 0 && (
          <div className="text-center text-gray-600 py-20">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Tidak ada data</p>
          </div>
        )}

        {/* Card List (mobile-friendly, bukan tabel) */}
        {filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((row, i) => (
              <div
                key={row.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4"
              >
                {/* Nomor */}
                <span className="text-gray-700 text-xs w-5 shrink-0 text-center">{i + 1}</span>

                {/* Foto */}
                <div className="shrink-0">
                  {row.foto_url ? (
                    <img
                      src={row.foto_url}
                      alt={row.nama}
                      onClick={() => setFotoModal(row.foto_url)}
                      className="w-12 h-12 rounded-xl object-cover cursor-pointer hover:opacity-70 transition-opacity ring-1 ring-gray-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{row.nama}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{formatWaktu(row.waktu)}</p>
                </div>

                {/* Maps Button */}
                <a
                  href={'https://maps.google.com/?q=' + row.latitude + ',' + row.longitude}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex flex-col items-center gap-1 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 p-2.5 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs">Maps</span>
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="h-8" />
      </div>

      {/* Modal Foto */}
      {fotoModal && (
        <div
          onClick={() => setFotoModal(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
        >
          <div className="max-w-xs w-full">
            <img src={fotoModal} alt="foto" className="w-full rounded-2xl shadow-2xl ring-1 ring-white/10" />
            <p className="text-center text-gray-500 text-xs mt-4">Tap untuk tutup</p>
          </div>
        </div>
      )}
    </div>
  )
}
