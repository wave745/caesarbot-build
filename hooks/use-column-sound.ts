"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export type SoundOption = 'none' | 'click' | 'ding' | 'fart' | 'lets-go' | 'punch' | 'swoosh'

interface SoundSettings {
  sound: SoundOption
  volume: number
}

const SOUND_FILES: Record<Exclude<SoundOption, 'none'>, string> = {
  'click': '/sounds/click.mp3',
  'ding': '/sounds/ding.mp3',
  'fart': '/sounds/fart.mp3',
  'lets-go': '/sounds/lets-go.mp3',
  'punch': '/sounds/punch.mp3',
  'swoosh': '/sounds/swoosh.mp3',
}

export function useColumnSound(columnId: string) {
  const [settings, setSettings] = useState<SoundSettings>({
    sound: 'none',
    volume: 70
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastPlayTimeRef = useRef<number>(0)
  const THROTTLE_MS = 500 // Prevent sound spam

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSound = localStorage.getItem(`column-sound-${columnId}`) as SoundOption
    const savedVolume = localStorage.getItem(`column-volume-${columnId}`)
    
    setSettings({
      sound: savedSound || 'none',
      volume: savedVolume ? parseInt(savedVolume) : 70
    })
  }, [columnId])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(`column-sound-${columnId}`, settings.sound)
    localStorage.setItem(`column-volume-${columnId}`, settings.volume.toString())
  }, [settings, columnId])

  // Preload audio when sound changes
  useEffect(() => {
    if (settings.sound === 'none') {
      audioRef.current = null
      return
    }

    const audio = new Audio(SOUND_FILES[settings.sound])
    audio.volume = settings.volume / 100
    audio.preload = 'auto'
    audioRef.current = audio

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [settings.sound, settings.volume])

  const playSound = useCallback(() => {
    if (settings.sound === 'none' || !audioRef.current) return

    // Throttle to prevent spam
    const now = Date.now()
    if (now - lastPlayTimeRef.current < THROTTLE_MS) return
    lastPlayTimeRef.current = now

    // Clone the audio to allow overlapping plays if needed
    const audio = audioRef.current.cloneNode() as HTMLAudioElement
    audio.volume = settings.volume / 100
    audio.play().catch(err => {
      // Silently handle autoplay policy errors
      console.log('Audio play prevented:', err.message)
    })
  }, [settings.sound, settings.volume])

  const updateSound = useCallback((sound: SoundOption) => {
    setSettings(prev => ({ ...prev, sound }))
  }, [])

  const updateVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume }))
  }, [])

  return {
    sound: settings.sound,
    volume: settings.volume,
    playSound,
    updateSound,
    updateVolume,
  }
}
