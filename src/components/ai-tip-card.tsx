import { Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  tip: string
  index: number
}

export default function AiTipCard({ tip, index }: Props) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex gap-3 pt-4 pb-4">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Lightbulb className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <span className="text-xs font-semibold text-primary">Tip {index + 1}</span>
          <p className="text-sm text-foreground mt-0.5 leading-relaxed">{tip}</p>
        </div>
      </CardContent>
    </Card>
  )
}
