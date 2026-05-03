import { useState } from "react"
import { supabase } from "./supabase"

const P = {
  bg: "#F5F0E8", card: "#FFFCF7", border: "#E8E0D0",
  text: "#3A3228", textMuted: "#8C7E6A",
  terracotta: "#C17F4A", cream: "#FFFCF7",
  sage: "#6B7F5A", red: "#C15A4A"
}

// Simple hash — not cryptographic but fine for personal use
async function hashPin(pin) {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + "the-cloud-salt-2024")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

export default function PinAuth({ onAuth }) {
  const [pin, setPin] = useState("")
  const [mode, setMode] = useState("login") // "login" | "create" | "confirm"
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleDigit = (d) => {
    if (mode === "confirm") {
      if (confirmPin.length < 4) setConfirmPin(p => p + d)
    } else {
      if (pin.length < 4) setPin(p => p + d)
    }
    setError("")
  }

  const handleDelete = () => {
    if (mode === "confirm") setConfirmPin(p => p.slice(0, -1))
    else setPin(p => p.slice(0, -1))
    setError("")
  }

  const handleSubmit = async () => {
    const current = mode === "confirm" ? confirmPin : pin
    if (current.length < 4) return
    setLoading(true)
    setError("")

    try {
      const hash = await hashPin(current)

      if (mode === "login") {
        const { data, error } = await supabase
          .from("users")
          .select("id")
          .eq("pin_hash", hash)
          .single()

        if (error || !data) {
          setError("wrong pin — try again")
          setPin("")
        } else {
          onAuth(data.id)
        }

      } else if (mode === "create") {
        // Move to confirm step
        setMode("confirm")
        setLoading(false)
        return

      } else if (mode === "confirm") {
        const originalHash = await hashPin(pin)
        if (current !== pin) {
          setError("pins don't match — try again")
          setConfirmPin("")
          setLoading(false)
          return
        }
        const hash2 = await hashPin(current)
        const { data, error } = await supabase
          .from("users")
          .insert({ pin_hash: hash2 })
          .select("id")
          .single()

        if (error) {
          setError("something went wrong — try again")
          setConfirmPin("")
        } else {
          onAuth(data.id)
        }
      }
    } catch (e) {
      setError("something went wrong")
    }

    setLoading(false)
  }

  const currentPin = mode === "confirm" ? confirmPin : pin

  return (
    <div style={{ background: P.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet" />

      <h1 style={{ fontSize: 32, fontWeight: 500, color: P.text, fontFamily: "'Playfair Display', serif", margin: "0 0 4px" }}>c<span style={{textTransform:"uppercase",letterSpacing:2}}>loud</span></h1>
      <p style={{ fontSize: 13, color: P.textMuted, margin: "0 0 48px" }}>your terpene journal</p>

      <p style={{ fontSize: 14, color: P.textMuted, margin: "0 0 24px", textAlign: "center" }}>
        {mode === "login" && "enter your pin"}
        {mode === "create" && "create a 4-digit pin"}
        {mode === "confirm" && "confirm your pin"}
      </p>

      {/* PIN dots */}
      <div style={{ display: "flex", gap: 16, marginBottom: 40 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: "50%",
            background: currentPin.length > i ? P.terracotta : P.border,
            transition: "background 0.15s"
          }} />
        ))}
      </div>

      {error && <p style={{ fontSize: 12, color: P.red, margin: "-24px 0 24px", textAlign: "center" }}>{error}</p>}

      {/* Numpad */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32, width: 240 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((d, i) => (
          d === null ? <div key={i} /> :
          <button
            key={i}
            onClick={() => d === "del" ? handleDelete() : handleDigit(String(d))}
            style={{
              height: 64, borderRadius: 12, border: `0.5px solid ${P.border}`,
              background: d === "del" ? "transparent" : P.card,
              color: P.text, fontSize: d === "del" ? 18 : 22, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            {d === "del" ? "⌫" : d}
          </button>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={currentPin.length < 4 || loading}
        style={{
          width: 240, padding: 14, borderRadius: 10, border: "none",
          background: currentPin.length < 4 ? P.border : P.terracotta,
          color: currentPin.length < 4 ? P.textMuted : P.cream,
          fontSize: 15, fontWeight: 500, cursor: currentPin.length < 4 ? "default" : "pointer",
          fontFamily: "inherit", marginBottom: 20, transition: "all 0.15s"
        }}
      >
        {loading ? "..." : mode === "login" ? "enter" : mode === "create" ? "next" : "confirm"}
      </button>

      {mode === "login" && (
        <button onClick={() => { setMode("create"); setPin(""); setError("") }}
          style={{ background: "none", border: "none", color: P.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
          first time? create a pin
        </button>
      )}
    </div>
  )
}