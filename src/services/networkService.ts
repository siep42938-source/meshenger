/**
 * NetworkService — автоматически определяет лучший доступный канал связи:
 * 1. Internet (WebSocket / HTTP)
 * 2. Wi-Fi Direct (WebRTC DataChannel через локальную сеть)
 * 3. Bluetooth (Web Bluetooth API)
 * 4. Offline (очередь сообщений)
 *
 * В браузере Web Bluetooth и WebRTC работают нативно.
 * В React Native — через react-native-ble-plx и react-native-wifi-p2p.
 */

import type { NetworkMode } from '../types'

type NetworkListener = (mode: NetworkMode) => void

class NetworkService {
  private mode: NetworkMode = 'offline'
  private listeners: NetworkListener[] = []
  private wsUrl = 'wss://Umberla-relay.example.com/ws' // replace with real server
  private ws: WebSocket | null = null
  private offlineQueue: Array<{ chatId: string; text: string; senderId: string }> = []

  constructor() {
    this.detectAndConnect()
    window.addEventListener('online',  () => this.detectAndConnect())
    window.addEventListener('offline', () => this.setMode('offline'))
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  getMode(): NetworkMode { return this.mode }

  onModeChange(fn: NetworkListener): () => void {
    this.listeners.push(fn)
    return () => { this.listeners = this.listeners.filter(l => l !== fn) }
  }

  async detectAndConnect(): Promise<NetworkMode> {
    // 1. Try internet
    if (navigator.onLine) {
      try {
        const ok = await this.pingServer()
        if (ok) {
          this.connectWebSocket()
          this.setMode('internet')
          return 'internet'
        }
      } catch { /* fall through */ }
    }

    // 2. Try Wi-Fi Direct via WebRTC (local network peer discovery)
    const wifiOk = await this.tryWifiDirect()
    if (wifiOk) { this.setMode('wifi-direct'); return 'wifi-direct' }

    // 3. Try Bluetooth
    const btOk = await this.tryBluetooth()
    if (btOk) { this.setMode('bluetooth'); return 'bluetooth' }

    // 4. Offline
    this.setMode('offline')
    return 'offline'
  }

  // ─── Internet ────────────────────────────────────────────────────────────────

  private async pingServer(): Promise<boolean> {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 3000)
      // In dev just check navigator.onLine
      clearTimeout(timer)
      return navigator.onLine
    } catch { return false }
  }

  private connectWebSocket() {
    if (this.ws?.readyState === WebSocket.OPEN) return
    try {
      // In dev mode we skip actual WS connection
      console.info('[Network] Internet mode active')
    } catch { /* no server in dev */ }
  }

  // ─── Wi-Fi Direct (WebRTC) ───────────────────────────────────────────────────

  private async tryWifiDirect(): Promise<boolean> {
    // Check if we're on a local network (192.168.x.x / 10.x.x.x)
    // In a real app: use WebRTC + mDNS/Bonjour for peer discovery
    // Here we simulate detection
    try {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (entries.length && entries[0].type === 'navigate') {
        // Heuristic: if page loaded fast on local network
        return false // disabled in browser demo
      }
    } catch { /* */ }
    return false
  }

  // ─── Bluetooth ───────────────────────────────────────────────────────────────

  private async tryBluetooth(): Promise<boolean> {
    if (!('bluetooth' in navigator)) return false
    try {
      // Check if Bluetooth is available (doesn't prompt user)
      const available = await (navigator as any).bluetooth.getAvailability()
      return available
    } catch { return false }
  }

  async scanBluetoothDevices(): Promise<unknown[]> {
    if (!('bluetooth' in navigator)) return []
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', '0000ffe0-0000-1000-8000-00805f9b34fb'],
      })
      return [device]
    } catch { return [] }
  }

  // ─── Offline queue ───────────────────────────────────────────────────────────

  queueMessage(chatId: string, text: string, senderId: string) {
    this.offlineQueue.push({ chatId, text, senderId })
    console.info(`[Network] Queued message for ${chatId}, queue size: ${this.offlineQueue.length}`)
  }

  async flushQueue(onMessage: (chatId: string, text: string, senderId: string) => void) {
    while (this.offlineQueue.length > 0) {
      const item = this.offlineQueue.shift()!
      onMessage(item.chatId, item.text, item.senderId)
      await new Promise(r => setTimeout(r, 100))
    }
  }

  // ─── Private ─────────────────────────────────────────────────────────────────

  private setMode(mode: NetworkMode) {
    if (this.mode === mode) return
    this.mode = mode
    this.listeners.forEach(fn => fn(mode))
    console.info(`[Network] Mode changed → ${mode}`)
  }
}

export const networkService = new NetworkService()
