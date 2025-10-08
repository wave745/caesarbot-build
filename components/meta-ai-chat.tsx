"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, X, Send, Sparkles, Rocket, Loader2, Maximize2, Minimize2 } from "lucide-react"
import { MetaContext } from "@/lib/services/grok-service"
import { useRouter } from "next/navigation"
import { processChatMarkdown } from "@/lib/utils/markdown-processor"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface MetaAIChatProps {
  metaContext: MetaContext
}

export function MetaAIChat({ metaContext }: MetaAIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Keyboard shortcut for ESC to collapse
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isExpanded])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `Hey! I'm your meta launch assistant. Ask me for ticker ideas, meta analysis, or launch concepts based on current trends!`,
        },
      ])
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/grok/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          metaContext,
          stream: false,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const goToDeployer = () => {
    router.push("/deployer")
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-16 right-6 z-50 group"
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full opacity-75 group-hover:opacity-100 blur-lg transition-all duration-300 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-4 shadow-2xl transform transition-all duration-300 group-hover:scale-110">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
        </div>
      </button>
    )
  }

  return (
    <Card className={`fixed bottom-16 right-6 z-50 ${isExpanded ? 'w-[720px]' : 'w-[340px]'} h-[480px] bg-black/95 backdrop-blur-xl border-zinc-800 shadow-2xl flex flex-col transition-all duration-300 ease-in-out`}>
      <CardHeader className="border-b border-zinc-800 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <div className="p-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded">
              <Sparkles className="w-3 h-3 text-black" />
            </div>
            Meta Launch Assistant
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 text-gray-400 hover:text-yellow-400 hover:bg-zinc-800 transition-colors"
              title={isExpanded ? "Collapse chat" : "Expand chat"}
            >
              {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                  : "bg-zinc-800 text-white border border-zinc-700"
              }`}
            >
              <p 
                className="text-xs whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: message.role === "assistant" 
                    ? processChatMarkdown(message.content) 
                    : message.content 
                }}
              />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 text-white border border-zinc-700 rounded-xl px-3 py-2">
              <Loader2 className="w-3 h-3 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t border-zinc-800 p-3 space-y-2">
        <Button
          onClick={goToDeployer}
          className="w-full h-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:opacity-90 transition-opacity font-semibold text-xs"
        >
          <Rocket className="w-3 h-3 mr-1.5" />
          Go to Deployer
        </Button>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about metas..."
            className="flex-1 h-8 text-xs bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500 focus:border-yellow-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-8 w-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:opacity-90 transition-opacity p-0"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
