"use client";
import { useRef, useState, useEffect, useCallback } from "react";

export default function AbsensiPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nama, setNama] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [fotoBlob, setFotoBlob] = useState<Blob | null>(null);
  const [koordinat, setKoordinat] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [status, setStatus] = useState("");
  const [kameraAktif, setKameraAktif] = useState(false);

  const aktifkanKamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setKameraAktif(true);
    } catch {
      alert("Tidak bisa mengakses kamera.");
    }
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setKoordinat({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("Aktifkan GPS."),
    );
  }, []);

  const ambilFoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const MAX = 400;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > h) {
      if (w > MAX) {
        h = Math.round((h * MAX) / w);
        w = MAX;
      }
    } else {
      if (h > MAX) {
        w = Math.round((w * MAX) / h);
        h = MAX;
      }
    }
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")?.drawImage(video, 0, 0, w, h);
    setFoto(canvas.toDataURL("image/jpeg", 0.7));
    canvas.toBlob(
      (blob) => {
        if (blob) setFotoBlob(blob);
      },
      "image/jpeg",
      0.7,
    );
    video.srcObject instanceof MediaStream &&
      video.srcObject.getTracks().forEach((t) => t.stop());
    setKameraAktif(false);
  };

  const ulangi = () => {
    setFoto(null);
    setFotoBlob(null);
    aktifkanKamera();
  };

  const submit = async () => {
    if (!nama.trim()) return alert("Masukkan nama terlebih dahulu");
    if (!foto) return alert("Ambil foto terlebih dahulu");
    if (!koordinat) return alert("Menunggu data lokasi...");
    setStatus("loading");
    const formData = new FormData();
    formData.append("nama", nama.trim());
    formData.append("foto", fotoBlob!, "foto.jpg");
    formData.append("latitude", String(koordinat.lat));
    formData.append("longitude", String(koordinat.lng));
    try {
      const res = await fetch("/api/absensi", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) setStatus("success");
      else throw new Error(data.error);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 flex flex-col items-center max-w-sm w-full shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-1">
            Absensi Berhasil!
          </h2>
          <p className="text-gray-400 text-sm mb-1">
            Nama: <span className="text-white font-medium">{nama}</span>
          </p>
          <p className="text-gray-500 text-xs mb-6">
            {koordinat?.lat.toFixed(5)}, {koordinat?.lng.toFixed(5)}
          </p>
          <button
            onClick={() => {
              setNama("");
              setFoto(null);
              setFotoBlob(null);
              setStatus("");
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-medium transition-colors"
          >
            Absensi Lagi
          </button>
          <a
            href="/rekap"
            className="mt-3 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Lihat Rekap →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      {/* Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8">
        {/* Logo / Title */}
        <div className="mb-7 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600/20 rounded-xl mb-3">
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">
            Absensi Karyawan edited
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Nama */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Nama Karyawan
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Masukkan nama lengkap"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
          />
        </div>

        {/* Kamera */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Foto
          </label>
          <div className="w-full aspect-square bg-gray-800 border border-gray-700 rounded-xl overflow-hidden relative flex items-center justify-center">
            {!kameraAktif && !foto && (
              <button
                onClick={aktifkanKamera}
                className="flex flex-col items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors"
              >
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm">Buka Kamera</span>
              </button>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${kameraAktif ? "block" : "hidden"}`}
            />
            {foto && (
              <img
                src={foto}
                alt="preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="mt-2 flex gap-2">
            {kameraAktif && (
              <button
                onClick={ambilFoto}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-sm font-medium transition-colors"
              >
                📸 Ambil Foto
              </button>
            )}
            {foto && (
              <button
                onClick={ulangi}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 py-2 rounded-xl text-sm transition-colors"
              >
                🔄 Ulangi
              </button>
            )}
          </div>
        </div>

        {/* Lokasi */}
        <div className="mb-7">
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Lokasi
          </label>
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5">
            <svg
              className="w-4 h-4 text-blue-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm text-gray-400">
              {koordinat
                ? `${koordinat.lat.toFixed(5)}, ${koordinat.lng.toFixed(5)}`
                : "Mendeteksi lokasi..."}
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          disabled={status === "loading"}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
        >
          {status === "loading" ? "Menyimpan..." : "Kirim Absensi"}
        </button>
        {status === "error" && (
          <p className="text-red-400 text-xs text-center mt-3">
            Gagal menyimpan. Coba lagi.
          </p>
        )}

        <div className="mt-4 text-center">
          <a
            href="/rekap"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Lihat rekap absensi →
          </a>
        </div>
      </div>
    </div>
  );
}
