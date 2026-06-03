'use client'

import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import AiTipCard from '@/components/ai-tip-card'
import useAiStore from '@/stores/useAiStore'
import type { AiTip } from '@/types'

export default function AiTipsPage() {
  const { aiTip, setAiTip, isGenerating, setGenerating } = useAiStore()
  const [loading, setLoading] = useState(true)
  const month = new Date().toISOString().slice(0, 7)
  const monthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  useEffect(() => {
    fetch(`/api/ai/tips`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month }) })
      .then((r) => r.json())
      .then((j: { data?: AiTip }) => { if (j.data) setAiTip(j.data) })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const regenerate = async () => {
    setGenerating(true)
    const res = await fetch('/api/ai/tips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month }),
    })
    const json = await res.json() as { data?: AiTip }
    if (json.data) setAiTip(json.data)
    setGenerating(false)
  }

  const getAnalysis = async () => {
    setGenerating(true)
    const res = await fetch('/api/ai/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month }),
    })
    const json = await res.json() as { data?: AiTip }
    if (json.data) setAiTip(json.data)
    setGenerating(false)
  }

  return (
    <div className="px-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">AI Tips</h1>
          <p className="text-sm text-muted-foreground">{monthLabel}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={regenerate}
          disabled={isGenerating}
          className="rounded-xl"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading || isGenerating ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : aiTip && aiTip.tips.length > 0 ? (
        <>
          <div className="space-y-3">
            {aiTip.tips.map((tip, i) => <AiTipCard key={i} tip={tip} index={i} />)}
          </div>

          {aiTip.analysis ? (
            <Card className="rounded-2xl bg-primary/5 border-primary/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Monthly Analysis</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{aiTip.analysis}</p>
              </CardContent>
            </Card>
          ) : (
            <Button variant="outline" className="w-full" onClick={getAnalysis} disabled={isGenerating}>
              <Sparkles className="w-4 h-4 mr-2" />
              Get monthly analysis
            </Button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center py-16 gap-3">
          <Sparkles className="w-12 h-12 text-primary/30" />
          <p className="text-sm text-muted-foreground text-center">
            Add some expenses first,<br />then get AI-powered tips
          </p>
        </div>
      )}
    </div>
  )
}
