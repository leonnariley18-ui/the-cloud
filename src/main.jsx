import React, { useState, useEffect, useCallback, useRef } from "react"
import ReactDOM from "react-dom/client"
import PinAuth from "./PinAuth"
import App from "./App"
import { supabase } from "./supabase"

const SAVE_DELAY = 2000 // debounce saves by 2 seconds

function Root() {
  const [userId, setUserId] = useState(() => sessionStorage.getItem("the-cloud-user"))
  const [appData, setAppData] = useState(null)
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef(null)

  // Load data once user is authed
  useEffect(() => {
    if (!userId) { setLoading(false); return }
    loadData()
  }, [userId])

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("app_data")
      .select("data")
      .eq("user_id", userId)
      .single()

    if (data) {
      setAppData(data.data)
    } else {
      // First time — start with empty data
      setAppData({})
    }
    setLoading(false)
  }

  const handleAuth = (uid) => {
    sessionStorage.setItem("the-cloud-user", uid)
    setUserId(uid)
  }

  // Debounced save — App calls this whenever state changes
  const handleDataChange = useCallback((newData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await supabase
        .from("app_data")
        .upsert({ user_id: userId, data: newData }, { onConflict: "user_id" })
    }, SAVE_DELAY)
  }, [userId])

  if (!userId) return <PinAuth onAuth={handleAuth} />

  if (loading) return (
    <div style={{ background: "#F5F0E8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif" }}>
      <p style={{ color: "#8C7E6A", fontSize: 14 }}>loading your cloud...</p>
    </div>
  )

  return <App initialData={appData} onDataChange={handleDataChange} />
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />)